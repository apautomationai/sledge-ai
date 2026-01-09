import { BadRequestError, NotFoundError } from "@/helpers/errors";
import db from "@/lib/db";
import { attachmentsModel } from "@/models/attachments.model";
import { invoiceModel, lineItemsModel } from "@/models/invoice.model";
import { quickbooksVendorsModel } from "@/models/quickbooks-vendors.model";
import { quickbooksCustomersModel } from "@/models/quickbooks-customers.model";
import { count, desc, eq, getTableColumns, and, sql, gte, lt, lte, inArray, ne } from "drizzle-orm";
import { quickbooksProductsModel } from "@/models/quickbooks-products.model";
import { PDFDocument } from "pdf-lib";
import { s3Client, uploadBufferToS3 } from "@/helpers/s3upload";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { streamToBuffer } from "@/lib/utils/steamToBuffer";
import { Readable } from "stream";
import { generateS3PublicUrl } from "@/lib/utils/s3";
import { QuickBooksService } from "@/services/quickbooks.service";
import { emailService } from "@/services/email.service";
import { usersModel } from "@/models/users.model";
const { v4: uuidv4 } = require("uuid");

const quickbooksService = new QuickBooksService();

export class InvoiceServices {
  async insertInvoice(data: typeof invoiceModel.$inferInsert) {
    try {
      const [response] = await db.insert(invoiceModel).values(data).returning();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async createInvoiceWithLineItems(
    invoiceData: Omit<typeof invoiceModel.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
    lineItemsData: Array<{
      item_name: string;
      quantity: number;
      rate: number;
      amount: number;
    }>
  ) {
    try {
      return await db.transaction(async (tx) => {
        // Check if invoice already exists with same invoice_number and attachment_id
        const [existingInvoice] = await tx
          .select()
          .from(invoiceModel)
          .where(
            and(
              eq(invoiceModel.invoiceNumber, invoiceData.invoiceNumber!),
              eq(invoiceModel.attachmentId, invoiceData.attachmentId),
              eq(invoiceModel.isDeleted, false)
            )
          );

        let invoice: typeof invoiceModel.$inferSelect;
        let isUpdate = false;

        if (existingInvoice) {
          // Check if data is different from existing invoice
          const hasChanges =
            existingInvoice.vendorId !== invoiceData.vendorId ||
            existingInvoice.customerId !== invoiceData.customerId ||
            existingInvoice.invoiceDate?.getTime() !== invoiceData.invoiceDate?.getTime() ||
            existingInvoice.dueDate?.getTime() !== invoiceData.dueDate?.getTime() ||
            existingInvoice.totalAmount !== invoiceData.totalAmount ||
            existingInvoice.totalQuantity !== invoiceData.totalQuantity ||
            existingInvoice.currency !== invoiceData.currency ||
            existingInvoice.totalTax !== invoiceData.totalTax ||
            existingInvoice.description !== invoiceData.description ||
            existingInvoice.fileKey !== invoiceData.fileKey ||
            existingInvoice.fileUrl !== generateS3PublicUrl(invoiceData.fileKey!) ||
            existingInvoice.s3JsonKey !== invoiceData.s3JsonKey;

          if (hasChanges) {
            // Update existing invoice with new data
            const [updatedInvoice] = await tx
              .update(invoiceModel)
              .set({
                vendorId: invoiceData.vendorId,
                customerId: invoiceData.customerId,
                invoiceDate: invoiceData.invoiceDate,
                dueDate: invoiceData.dueDate,
                totalAmount: invoiceData.totalAmount,
                totalQuantity: invoiceData.totalQuantity,
                currency: invoiceData.currency,
                totalTax: invoiceData.totalTax,
                description: invoiceData.description,
                fileKey: invoiceData.fileKey,
                fileUrl: invoiceData.fileKey ? generateS3PublicUrl(invoiceData.fileKey) : existingInvoice.fileUrl,
                s3JsonKey: invoiceData.s3JsonKey,
                updatedAt: new Date(),
              })
              .where(eq(invoiceModel.id, existingInvoice.id))
              .returning();

            invoice = updatedInvoice;
            isUpdate = true;
          } else {
            // No changes needed, use existing invoice
            invoice = existingInvoice;
          }
        } else {
          // Check for duplicates: same invoice number + same vendor + same user
          let isDuplicate = false;
          if (invoiceData.vendorId && invoiceData.invoiceNumber) {
            const duplicates = await tx
              .select()
              .from(invoiceModel)
              .where(
                and(
                  eq(invoiceModel.userId, invoiceData.userId),
                  eq(invoiceModel.vendorId, invoiceData.vendorId),
                  eq(invoiceModel.invoiceNumber, invoiceData.invoiceNumber),
                  eq(invoiceModel.isDeleted, false),
                  ne(invoiceModel.status, "rejected")
                )
              );

            isDuplicate = duplicates.length > 0;
          }

          // Create new invoice with duplicate flag if needed
          const [newInvoice] = await tx
            .insert(invoiceModel)
            .values({
              ...invoiceData,
              isDuplicate,
              fileUrl: invoiceData.fileKey && generateS3PublicUrl(invoiceData.fileKey),
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();

          invoice = newInvoice;
        }

        // Handle line items - always add new line items to existing invoice
        if (lineItemsData && lineItemsData.length > 0) {
          // Search for each line item in QuickBooks products to get quickbooks_id
          const lineItemsToInsert = await Promise.all(
            lineItemsData.map(async (item) => {
              let resourceId: string | null = null;
              let itemType: 'account' | 'product' | null = null;

              // Search for the product in QuickBooks using hybrid search
              if (item.item_name) {
                try {
                  const searchResults = await quickbooksService.hybridSearchProducts(
                    invoiceData.userId,
                    item.item_name,
                    1 // Get top 1 match
                  );

                  if (searchResults && searchResults.length > 0) {
                    const topMatch = searchResults[0];
                    // Use quickbooks_id as resourceId
                    resourceId = topMatch.quickbooksId;
                    itemType = 'product' as const;
                    // Found QuickBooks product match
                  }
                } catch (error) {
                  console.error(`Error searching for product "${item.item_name}":`, error);
                  // Continue without resourceId if search fails
                }
              }

              return {
                invoiceId: invoice.id,
                item_name: item.item_name,
                quantity: item.quantity.toString(),
                rate: item.rate.toString(),
                amount: item.amount.toString(),
                itemType: itemType,
                resourceId: resourceId,
              };
            })
          );

          await tx.insert(lineItemsModel).values(lineItemsToInsert);
        }

        // Return the invoice with operation type
        return {
          invoice,
          operation: isUpdate ? 'updated' : existingInvoice ? 'no_changes' : 'created'
        };
      });
    } catch (error) {
      throw error;
    }
  }

  async getAllInvoices(userId: number, page: number, limit: number, attachmentId?: number) {
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [
      eq(invoiceModel.userId, userId),
      eq(invoiceModel.isDeleted, false)
    ];

    // Add attachmentId filter if provided
    if (attachmentId !== undefined) {
      whereConditions.push(eq(invoiceModel.attachmentId, attachmentId));
    }

    const allInvoices = await db
      .select({
        id: invoiceModel.id,
        userId: invoiceModel.userId,
        invoiceNumber: invoiceModel.invoiceNumber,
        vendorId: invoiceModel.vendorId,
        totalAmount: invoiceModel.totalAmount,
        attachmentId: invoiceModel.attachmentId,
        attachmentUrl: attachmentsModel.fileUrl,
        senderEmail: attachmentsModel.sender,
        fileUrl: invoiceModel.fileUrl,
        createdAt: invoiceModel.createdAt,
        invoiceDate: invoiceModel.invoiceDate,
        status: invoiceModel.status,
        isDuplicate: invoiceModel.isDuplicate,
        // Vendor data from quickbooks_vendors table
        vendorData: {
          id: quickbooksVendorsModel.id,
          displayName: quickbooksVendorsModel.displayName,
          companyName: quickbooksVendorsModel.companyName,
          primaryEmail: quickbooksVendorsModel.primaryEmail,
          primaryPhone: quickbooksVendorsModel.primaryPhone,
          billAddrLine1: quickbooksVendorsModel.billAddrLine1,
          billAddrCity: quickbooksVendorsModel.billAddrCity,
          billAddrState: quickbooksVendorsModel.billAddrState,
          billAddrPostalCode: quickbooksVendorsModel.billAddrPostalCode,
          active: quickbooksVendorsModel.active,
          quickbooksId: quickbooksVendorsModel.quickbooksId,
        },
      })
      .from(invoiceModel)
      .leftJoin(
        attachmentsModel,
        eq(invoiceModel.attachmentId, attachmentsModel.id),
      )
      .leftJoin(
        quickbooksVendorsModel,
        eq(invoiceModel.vendorId, quickbooksVendorsModel.id),
      )
      .where(and(...whereConditions))
      .orderBy(desc(invoiceModel.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalResult] = await db
      .select({ count: count() })
      .from(invoiceModel)
      .where(and(...whereConditions));

    return {
      invoices: allInvoices,
      totalCount: totalResult.count,
    };
  }

  // Lightweight method that only returns invoice IDs and statuses
  async getInvoicesListByAttachment(userId: number, attachmentId: number) {
    const invoicesList = await db
      .select({
        id: invoiceModel.id,
        invoiceNumber: invoiceModel.invoiceNumber,
        status: invoiceModel.status,
        isDuplicate: invoiceModel.isDuplicate,
        createdAt: invoiceModel.createdAt,
      })
      .from(invoiceModel)
      .where(
        and(
          eq(invoiceModel.userId, userId),
          eq(invoiceModel.attachmentId, attachmentId),
          eq(invoiceModel.isDeleted, false)
        )
      )
      .orderBy(desc(invoiceModel.createdAt));

    return invoicesList;
  }

  async getInvoice(invoiceId: number) {
    const [response] = await db
      .select({
        ...getTableColumns(invoiceModel),
        sourcePdfUrl: attachmentsModel.fileUrl,
        senderEmail: attachmentsModel.sender,
        // Vendor data from quickbooks_vendors table
        vendorData: {
          id: quickbooksVendorsModel.id,
          displayName: quickbooksVendorsModel.displayName,
          companyName: quickbooksVendorsModel.companyName,
          primaryEmail: quickbooksVendorsModel.primaryEmail,
          primaryPhone: quickbooksVendorsModel.primaryPhone,
          billAddrLine1: quickbooksVendorsModel.billAddrLine1,
          billAddrCity: quickbooksVendorsModel.billAddrCity,
          billAddrState: quickbooksVendorsModel.billAddrState,
          billAddrPostalCode: quickbooksVendorsModel.billAddrPostalCode,
          active: quickbooksVendorsModel.active,
          quickbooksId: quickbooksVendorsModel.quickbooksId,
        },
        // Customer data from quickbooks_customers table
        customerData: {
          id: quickbooksCustomersModel.id,
          displayName: quickbooksCustomersModel.displayName,
          companyName: quickbooksCustomersModel.companyName,
          givenName: quickbooksCustomersModel.givenName,
          familyName: quickbooksCustomersModel.familyName,
          primaryEmail: quickbooksCustomersModel.primaryEmail,
          primaryPhone: quickbooksCustomersModel.primaryPhone,
          billAddrLine1: quickbooksCustomersModel.billAddrLine1,
          billAddrCity: quickbooksCustomersModel.billAddrCity,
          billAddrState: quickbooksCustomersModel.billAddrState,
          billAddrPostalCode: quickbooksCustomersModel.billAddrPostalCode,
          billAddrCountry: quickbooksCustomersModel.billAddrCountry,
          balance: quickbooksCustomersModel.balance,
          active: quickbooksCustomersModel.active,
          quickbooksId: quickbooksCustomersModel.quickbooksId,
        },
      })
      .from(invoiceModel)
      .leftJoin(
        attachmentsModel,
        eq(invoiceModel.attachmentId, attachmentsModel.id),
      )
      .leftJoin(
        quickbooksVendorsModel,
        eq(invoiceModel.vendorId, quickbooksVendorsModel.id),
      )
      .leftJoin(
        quickbooksCustomersModel,
        eq(invoiceModel.customerId, quickbooksCustomersModel.id),
      )
      .where(
        and(
          eq(invoiceModel.id, invoiceId),
          eq(invoiceModel.isDeleted, false)
        )
      );

    if (!response) {
      throw new NotFoundError("No invoice found with that ID.");
    }

    return response;
  }

  async getInvoicesByAttachmentId(attachmentId: number) {
    const invoices = await db
      .select({
        id: invoiceModel.id,
        status: invoiceModel.status,
        invoiceNumber: invoiceModel.invoiceNumber,
        vendorId: invoiceModel.vendorId,
        totalAmount: invoiceModel.totalAmount,
        isDuplicate: invoiceModel.isDuplicate,
      })
      .from(invoiceModel)
      .where(
        and(
          eq(invoiceModel.attachmentId, attachmentId),
          eq(invoiceModel.isDeleted, false)
        )
      );

    return invoices;
  }

  async updateInvoice(
    invoiceId: number,
    updatedData: Partial<typeof invoiceModel.$inferSelect>
  ) {
    const existingInvoice = await this.getInvoice(invoiceId);
    if (!existingInvoice) {
      throw new NotFoundError("No invoice found to update.");
    }

    try {
      // Check if vendor data is included in the update
      const vendorData = (updatedData as any).vendorData;
      const customerData = (updatedData as any).customerData;

      // Update the invoice (exclude vendorData and customerData from invoice update)
      const { vendorData: _, customerData: __, ...invoiceUpdateData } = updatedData as any;

      // Re-check for duplicates if invoice number is being updated
      if (invoiceUpdateData.invoiceNumber && invoiceUpdateData.invoiceNumber !== existingInvoice.invoiceNumber) {
        // Use vendorId from update data if provided, otherwise use existing
        const vendorIdToCheck = invoiceUpdateData.vendorId ?? existingInvoice.vendorId;

        if (vendorIdToCheck) {
          // Check for duplicates: same invoice number + same vendor + same user (excluding current invoice)
          const duplicates = await db
            .select()
            .from(invoiceModel)
            .where(
              and(
                eq(invoiceModel.userId, existingInvoice.userId),
                eq(invoiceModel.vendorId, vendorIdToCheck),
                eq(invoiceModel.invoiceNumber, invoiceUpdateData.invoiceNumber),
                eq(invoiceModel.isDeleted, false),
                ne(invoiceModel.status, "rejected"),
                ne(invoiceModel.id, invoiceId)
              )
            );

          // If duplicate exists, prevent the update and throw error
          if (duplicates.length > 0) {
            throw new BadRequestError("This invoice number already exists for this vendor. Please use a different invoice number.");
          }

          // If no duplicate, set isDuplicate to false (clearing any previous duplicate flag)
          invoiceUpdateData.isDuplicate = false;
        } else {
          // If no vendor, can't be a duplicate, so set to false
          invoiceUpdateData.isDuplicate = false;
        }
      }

      await db
        .update(invoiceModel)
        .set({ ...invoiceUpdateData, updatedAt: new Date() })
        .where(eq(invoiceModel.id, invoiceId));

      // Update vendor data if provided and vendorId exists
      if (vendorData && existingInvoice.vendorId) {
        const vendorUpdateData: any = {};

        // Map vendor fields from frontend to database fields
        if (vendorData.displayName !== undefined) {
          vendorUpdateData.displayName = vendorData.displayName;
        }
        if (vendorData.primaryEmail !== undefined) {
          vendorUpdateData.primaryEmail = vendorData.primaryEmail;
        }
        if (vendorData.primaryPhone !== undefined) {
          vendorUpdateData.primaryPhone = vendorData.primaryPhone;
        }
        if (vendorData.billAddrLine1 !== undefined) {
          vendorUpdateData.billAddrLine1 = vendorData.billAddrLine1;
        }
        if (vendorData.billAddrCity !== undefined) {
          vendorUpdateData.billAddrCity = vendorData.billAddrCity;
        }
        if (vendorData.billAddrState !== undefined) {
          vendorUpdateData.billAddrState = vendorData.billAddrState;
        }
        if (vendorData.billAddrPostalCode !== undefined) {
          vendorUpdateData.billAddrPostalCode = vendorData.billAddrPostalCode;
        }

        // Only update if there are vendor fields to update
        if (Object.keys(vendorUpdateData).length > 0) {
          vendorUpdateData.updatedAt = new Date();

          // Get current vendor data BEFORE updating for QuickBooks comparison
          let currentVendorData = null;
          try {
            const quickbooksService = new (await import('./quickbooks.service')).QuickBooksService();
            const integration = await quickbooksService.getUserIntegration(existingInvoice.userId);

            if (integration) {
              // Get current vendor data before update
              [currentVendorData] = await db
                .select({
                  quickbooksId: quickbooksVendorsModel.quickbooksId,
                  syncToken: quickbooksVendorsModel.syncToken,
                  displayName: quickbooksVendorsModel.displayName,
                  primaryEmail: quickbooksVendorsModel.primaryEmail,
                  primaryPhone: quickbooksVendorsModel.primaryPhone,
                  billAddrLine1: quickbooksVendorsModel.billAddrLine1,
                  billAddrCity: quickbooksVendorsModel.billAddrCity,
                  billAddrState: quickbooksVendorsModel.billAddrState,
                  billAddrPostalCode: quickbooksVendorsModel.billAddrPostalCode,
                })
                .from(quickbooksVendorsModel)
                .where(eq(quickbooksVendorsModel.id, existingInvoice.vendorId))
                .limit(1);

              // Update local database first
              await db
                .update(quickbooksVendorsModel)
                .set(vendorUpdateData)
                .where(eq(quickbooksVendorsModel.id, existingInvoice.vendorId));

              // Now sync to QuickBooks if we have the necessary data
              if (currentVendorData?.quickbooksId && currentVendorData?.syncToken) {
                // Validate QuickBooks ID format
                if (!currentVendorData.quickbooksId.match(/^\d+$/)) {
                  console.error("Invalid QuickBooks vendor ID format:", currentVendorData.quickbooksId);
                  throw new Error(`Invalid QuickBooks vendor ID format: ${currentVendorData.quickbooksId}`);
                }

                // Validate sync token
                if (!currentVendorData.syncToken || currentVendorData.syncToken.trim() === '') {
                  console.error("Invalid or missing sync token for vendor:", currentVendorData.quickbooksId);
                  throw new Error("Invalid or missing sync token for vendor update");
                }

                // Check what actually changed
                const hasChanges = (
                  (vendorData.displayName !== undefined && vendorData.displayName !== currentVendorData.displayName) ||
                  (vendorData.primaryEmail !== undefined && vendorData.primaryEmail !== currentVendorData.primaryEmail) ||
                  (vendorData.primaryPhone !== undefined && vendorData.primaryPhone !== currentVendorData.primaryPhone) ||
                  (vendorData.billAddrLine1 !== undefined && vendorData.billAddrLine1 !== currentVendorData.billAddrLine1) ||
                  (vendorData.billAddrCity !== undefined && vendorData.billAddrCity !== currentVendorData.billAddrCity) ||
                  (vendorData.billAddrState !== undefined && vendorData.billAddrState !== currentVendorData.billAddrState) ||
                  (vendorData.billAddrPostalCode !== undefined && vendorData.billAddrPostalCode !== currentVendorData.billAddrPostalCode)
                );

                if (hasChanges) {
                  console.log("Syncing vendor changes to QuickBooks...");
                  console.log("Current vendor data:", currentVendorData);
                  console.log("New vendor data:", vendorData);

                  // Prepare QuickBooks update data
                  const qbVendorData: any = {
                    syncToken: currentVendorData.syncToken
                  };

                  if (vendorData.displayName !== undefined && vendorData.displayName !== currentVendorData.displayName) {
                    // Ensure the name is not empty and is properly formatted
                    const trimmedName = vendorData.displayName?.trim();
                    if (trimmedName && trimmedName.length > 0) {
                      qbVendorData.name = trimmedName;
                    }
                  }
                  if (vendorData.primaryEmail !== undefined && vendorData.primaryEmail !== currentVendorData.primaryEmail) {
                    // Only set email if it's not empty and has basic validation
                    const trimmedEmail = vendorData.primaryEmail?.trim();
                    if (trimmedEmail && trimmedEmail.includes('@')) {
                      qbVendorData.email = trimmedEmail;
                    }
                  }
                  if (vendorData.primaryPhone !== undefined && vendorData.primaryPhone !== currentVendorData.primaryPhone) {
                    const trimmedPhone = vendorData.primaryPhone?.trim();
                    if (trimmedPhone && trimmedPhone.length > 0) {
                      qbVendorData.phone = trimmedPhone;
                    }
                  }
                  if (vendorData.billAddrLine1 !== undefined && vendorData.billAddrLine1 !== currentVendorData.billAddrLine1) {
                    const trimmedAddress = vendorData.billAddrLine1?.trim();
                    if (trimmedAddress && trimmedAddress.length > 0) {
                      qbVendorData.address = trimmedAddress;
                    }
                  }
                  if (vendorData.billAddrCity !== undefined && vendorData.billAddrCity !== currentVendorData.billAddrCity) {
                    const trimmedCity = vendorData.billAddrCity?.trim();
                    if (trimmedCity && trimmedCity.length > 0) {
                      qbVendorData.city = trimmedCity;
                    }
                  }
                  if (vendorData.billAddrState !== undefined && vendorData.billAddrState !== currentVendorData.billAddrState) {
                    const trimmedState = vendorData.billAddrState?.trim();
                    if (trimmedState && trimmedState.length > 0) {
                      qbVendorData.state = trimmedState;
                    }
                  }
                  if (vendorData.billAddrPostalCode !== undefined && vendorData.billAddrPostalCode !== currentVendorData.billAddrPostalCode) {
                    const trimmedPostalCode = vendorData.billAddrPostalCode?.trim();
                    if (trimmedPostalCode && trimmedPostalCode.length > 0) {
                      qbVendorData.postalCode = trimmedPostalCode;
                    }
                  }

                  console.log("QuickBooks vendor update data:", qbVendorData);

                  // Ensure we have at least one field to update besides syncToken
                  const fieldsToUpdate = Object.keys(qbVendorData).filter(key => key !== 'syncToken');
                  if (fieldsToUpdate.length === 0) {
                    console.log("No valid fields to update in QuickBooks, skipping sync");
                    return;
                  }

                  // Update in QuickBooks
                  const updatedQBVendor = await quickbooksService.updateVendor(
                    integration,
                    currentVendorData.quickbooksId,
                    qbVendorData
                  );

                  console.log("QuickBooks vendor update response:", updatedQBVendor);

                  // Update sync token with response
                  const newSyncToken = updatedQBVendor?.QueryResponse?.Vendor?.[0]?.SyncToken ||
                    updatedQBVendor?.Vendor?.SyncToken ||
                    updatedQBVendor?.SyncToken;

                  if (newSyncToken) {
                    await db
                      .update(quickbooksVendorsModel)
                      .set({
                        syncToken: newSyncToken,
                        updatedAt: new Date()
                      })
                      .where(eq(quickbooksVendorsModel.id, existingInvoice.vendorId));
                  }
                } else {
                  console.log("No vendor changes detected for QuickBooks sync");
                }
              }
            } else {
              // No QuickBooks integration, just update local database
              await db
                .update(quickbooksVendorsModel)
                .set(vendorUpdateData)
                .where(eq(quickbooksVendorsModel.id, existingInvoice.vendorId));
            }
          } catch (qbError: any) {
            console.error("QuickBooks vendor sync error:", qbError);

            // Log detailed error information
            if (qbError.response) {
              console.error("QuickBooks API response status:", qbError.response.status);
              console.error("QuickBooks API response data:", qbError.response.data);
            }
            if (qbError.message) {
              console.error("QuickBooks error message:", qbError.message);
            }

            // If QuickBooks sync fails, still update local database
            if (!currentVendorData) {
              await db
                .update(quickbooksVendorsModel)
                .set(vendorUpdateData)
                .where(eq(quickbooksVendorsModel.id, existingInvoice.vendorId));
            }

            // Re-throw the error with more context
            throw new Error(`QuickBooks vendor sync failed: ${qbError.message || 'Unknown error'}`);
          }
        }
      }

      // Update customer data if provided and customerId exists
      if (customerData && existingInvoice.customerId) {
        const customerUpdateData: any = {};

        // Map customer fields from frontend to database fields
        if (customerData.displayName !== undefined) {
          customerUpdateData.displayName = customerData.displayName;
        }

        // Only update if there are customer fields to update
        if (Object.keys(customerUpdateData).length > 0) {
          customerUpdateData.updatedAt = new Date();

          // Get current customer data BEFORE updating for QuickBooks comparison
          let currentCustomerData = null;
          try {
            const quickbooksService = new (await import('./quickbooks.service')).QuickBooksService();
            const integration = await quickbooksService.getUserIntegration(existingInvoice.userId);

            if (integration) {
              // Get current customer data before update
              [currentCustomerData] = await db
                .select({
                  quickbooksId: quickbooksCustomersModel.quickbooksId,
                  syncToken: quickbooksCustomersModel.syncToken,
                  displayName: quickbooksCustomersModel.displayName,
                })
                .from(quickbooksCustomersModel)
                .where(eq(quickbooksCustomersModel.id, existingInvoice.customerId))
                .limit(1);

              // Update local database first
              await db
                .update(quickbooksCustomersModel)
                .set(customerUpdateData)
                .where(eq(quickbooksCustomersModel.id, existingInvoice.customerId));

              // Now sync to QuickBooks if we have the necessary data
              if (currentCustomerData?.quickbooksId && currentCustomerData?.syncToken) {
                // Check what actually changed
                const hasChanges = (
                  customerData.displayName !== undefined && customerData.displayName !== currentCustomerData.displayName
                );

                if (hasChanges) {
                  console.log("Syncing customer changes to QuickBooks...");

                  // Prepare QuickBooks update data
                  const qbCustomerData: any = {
                    syncToken: currentCustomerData.syncToken
                  };

                  if (customerData.displayName !== undefined && customerData.displayName !== currentCustomerData.displayName) {
                    qbCustomerData.name = customerData.displayName;
                  }

                  // Update in QuickBooks (we'll need to implement updateCustomer method)
                  const updatedQBCustomer = await quickbooksService.updateCustomer(
                    integration,
                    currentCustomerData.quickbooksId,
                    qbCustomerData
                  );

                  // Update sync token with response
                  const newSyncToken = updatedQBCustomer?.QueryResponse?.Customer?.[0]?.SyncToken ||
                    updatedQBCustomer?.Customer?.SyncToken ||
                    updatedQBCustomer?.SyncToken;

                  if (newSyncToken) {
                    await db
                      .update(quickbooksCustomersModel)
                      .set({
                        syncToken: newSyncToken,
                        updatedAt: new Date()
                      })
                      .where(eq(quickbooksCustomersModel.id, existingInvoice.customerId));
                  }
                } else {
                  console.log("No customer changes detected for QuickBooks sync");
                }
              }
            } else {
              // No QuickBooks integration, just update local database
              await db
                .update(quickbooksCustomersModel)
                .set(customerUpdateData)
                .where(eq(quickbooksCustomersModel.id, existingInvoice.customerId));
            }
          } catch (qbError) {
            console.error("QuickBooks customer sync error:", qbError);
            // If QuickBooks sync fails, still update local database
            if (!currentCustomerData) {
              await db
                .update(quickbooksCustomersModel)
                .set(customerUpdateData)
                .where(eq(quickbooksCustomersModel.id, existingInvoice.customerId));
            }
          }
        }
      }

      // Fetch the updated invoice with vendor and customer data using JOIN
      const [updatedInvoiceWithData] = await db
        .select({
          ...getTableColumns(invoiceModel),
          sourcePdfUrl: attachmentsModel.fileUrl,
          senderEmail: attachmentsModel.sender,
          // Vendor data from quickbooks_vendors table
          vendorData: {
            id: quickbooksVendorsModel.id,
            displayName: quickbooksVendorsModel.displayName,
            companyName: quickbooksVendorsModel.companyName,
            primaryEmail: quickbooksVendorsModel.primaryEmail,
            primaryPhone: quickbooksVendorsModel.primaryPhone,
            billAddrLine1: quickbooksVendorsModel.billAddrLine1,
            billAddrCity: quickbooksVendorsModel.billAddrCity,
            billAddrState: quickbooksVendorsModel.billAddrState,
            billAddrPostalCode: quickbooksVendorsModel.billAddrPostalCode,
            active: quickbooksVendorsModel.active,
            quickbooksId: quickbooksVendorsModel.quickbooksId,
          },
          // Customer data from quickbooks_customers table
          customerData: {
            id: quickbooksCustomersModel.id,
            displayName: quickbooksCustomersModel.displayName,
            companyName: quickbooksCustomersModel.companyName,
            givenName: quickbooksCustomersModel.givenName,
            familyName: quickbooksCustomersModel.familyName,
            primaryEmail: quickbooksCustomersModel.primaryEmail,
            primaryPhone: quickbooksCustomersModel.primaryPhone,
            billAddrLine1: quickbooksCustomersModel.billAddrLine1,
            billAddrCity: quickbooksCustomersModel.billAddrCity,
            billAddrState: quickbooksCustomersModel.billAddrState,
            billAddrPostalCode: quickbooksCustomersModel.billAddrPostalCode,
            billAddrCountry: quickbooksCustomersModel.billAddrCountry,
            balance: quickbooksCustomersModel.balance,
            active: quickbooksCustomersModel.active,
            quickbooksId: quickbooksCustomersModel.quickbooksId,
          },
        })
        .from(invoiceModel)
        .leftJoin(
          attachmentsModel,
          eq(invoiceModel.attachmentId, attachmentsModel.id),
        )
        .leftJoin(
          quickbooksVendorsModel,
          eq(invoiceModel.vendorId, quickbooksVendorsModel.id),
        )
        .leftJoin(
          quickbooksCustomersModel,
          eq(invoiceModel.customerId, quickbooksCustomersModel.id),
        )
        .where(
          and(
            eq(invoiceModel.id, invoiceId),
            eq(invoiceModel.isDeleted, false)
          )
        );

      if (!updatedInvoiceWithData) {
        throw new NotFoundError("Invoice not found after update");
      }

      return updatedInvoiceWithData;
    } catch (error) {
      console.error("Error updating invoice:", error);
      // Re-throw the error if it's already a BadRequestError or NotFoundError
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError("Unable to update invoice");
    }
  }

  async softDeleteInvoice(invoiceId: number): Promise<void> {
    try {
      // Verify invoice exists and is not already deleted
      const [existingInvoice] = await db
        .select()
        .from(invoiceModel)
        .where(eq(invoiceModel.id, invoiceId));

      if (!existingInvoice) {
        throw new NotFoundError("Invoice not found");
      }

      if (existingInvoice.isDeleted) {
        throw new BadRequestError("Invoice has already been deleted");
      }

      // Perform soft delete
      const [result] = await db
        .update(invoiceModel)
        .set({
          isDeleted: true,
          deletedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(invoiceModel.id, invoiceId))
        .returning();

      if (!result) {
        throw new BadRequestError("Failed to delete invoice");
      }
    } catch (error) {
      console.error("Error soft deleting invoice:", error);
      throw error;
    }
  }

  async getInvoiceLineItems(invoiceId: number, viewType?: 'single' | 'expanded') {
    try {
      const whereConditions = [eq(lineItemsModel.invoiceId, invoiceId)];

      // Filter by view type if specified
      if (viewType) {
        whereConditions.push(eq(lineItemsModel.viewType, viewType));
      }

      const lineItems = await db
        .select()
        .from(lineItemsModel)
        .where(and(...whereConditions));

      return lineItems;
    } catch (error) {
      throw error;
    }
  }

  async getAttachmentTexts(pdfBuffer: Buffer): Promise<string[]> {
    // Ensure DOMMatrix is available for pdf-parse (it expects some DOM APIs).
    // Load the lightweight `dommatrix` polyfill if DOMMatrix is missing, then
    // dynamically import `pdf-parse` to avoid loading it at module init time
    // (which would throw on startup in a Node environment without DOMMatrix).
    if (typeof (globalThis as any).DOMMatrix === "undefined") {
      try {
        // Use dynamic import so this only runs in Node when needed.
        const dommatrix = await import("dommatrix");
        // The package exports a DOMMatrix constructor
        (globalThis as any).DOMMatrix =
          // @ts-ignore
          dommatrix.DOMMatrix || dommatrix.default;
      } catch (err) {
        // If polyfill install is missing, rethrow a helpful error.
        throw new Error(
          "DOMMatrix is not available and the 'dommatrix' polyfill failed to load. Please install 'dommatrix' as a dependency.",
        );
      }
    }

    // Dynamically import pdf-parse to avoid evaluating it at module load time.
    const pdfParseModule = await import("pdf-parse");
    // pdf-parse may export the function as default or module.exports
    const pdfParse = (pdfParseModule &&
      (pdfParseModule.default || pdfParseModule)) as any;

    // Extract digital text
    const parsed = await pdfParse(pdfBuffer);

    // if (parsed.text && parsed.text.trim().length > 20) {
    // Split by page marker like "Page X of Y"
    const pages = parsed.text
      .split(/Page \d+ of \d+/) // split using the page pattern
      .map((p: any) => p.trim()) // remove extra whitespace
      .filter((p: any) => p.length > 0); // remove empty pages

    return pages;
    // }

    // Fallback: scanned PDF → OCR
    // const tempDir = path.join(__dirname, "../../temp_images");
    // if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    // const outputBase = path.join(tempDir, "page");
    // execSync(`pdftoppm -png "${pdfPath}" "${outputBase}"`);

    // const imageFiles = fs
    //   .readdirSync(tempDir)
    //   .filter((f) => f.endsWith(".png"))
    //   .sort(
    //     (a, b) =>
    //       parseInt(a.match(/\d+/)?.[0] || "0") -
    //       parseInt(b.match(/\d+/)?.[0] || "0")
    //   );

    // const results: string[] = [];
    // for (const imageFile of imageFiles) {
    //   const imagePath = path.join(tempDir, imageFile);
    //   const { data } = await Tesseract.recognize(imagePath, "eng");

    //   const text = data.text.trim();
    //   if (text.length > 0) {
    //     results.push(text);
    //   }
    // }

    // imageFiles.forEach((f) => fs.unlinkSync(path.join(tempDir, f)));
    // console.log("result ", results);

    // return results;
  }

  // --- New method to detect invoices ---
  // async extractInvoices(pdfBuffer: Buffer) {
  //   let pages = await this.getAttachmentTexts(pdfBuffer);

  //   const invoices: any[] = [];
  //   let currentInvoice: any = null;

  //   for (let i = 0; i < pages.length; i++) {
  //     const text = pages[i].trim();
  //     if (!text) continue; // skip empty pages

  //     // Match invoice number (adjust regex if needed)

  //     const invoiceMatch = text.match(
  //       /INVOICE\s*(NUMBER|No\.?)?\s*[:#]?\s*(\d+)/i
  //     );
  //     if (invoiceMatch) {
  //       // Save previous invoice
  //       if (currentInvoice) {
  //         currentInvoice.endPage = i;
  //         currentInvoice.pageCount =
  //           currentInvoice.endPage - currentInvoice.startPage + 1;
  //         invoices.push(currentInvoice);
  //       }

  //       // Start new invoice
  //       currentInvoice = {
  //         invoiceNumber: invoiceMatch[2],
  //         startPage: i + 1,
  //         endPage: i + 1,
  //         pageCount: 1,
  //       };
  //     } else if (currentInvoice) {
  //       // Extend current invoice
  //       currentInvoice.endPage = i + 1;
  //       currentInvoice.pageCount =
  //         currentInvoice.endPage - currentInvoice.startPage + 1;
  //     }
  //   }

  //   // Save last invoice
  //   if (currentInvoice) {
  //     currentInvoice.endPage = Math.min(
  //       currentInvoice.endPage,
  //       pages.length - 1
  //     );
  //     currentInvoice.pageCount =
  //       currentInvoice.endPage - currentInvoice.startPage + 1;
  //     invoices.push(currentInvoice);
  //   }

  //   return {
  //     success: true,
  //     totalPages: pages.length,
  //     totalInvoices: invoices.length,
  //     invoices,
  //   };
  // }
  async extractInvoices(pdfBuffer: Buffer) {
    let pages = await this.getAttachmentTexts(pdfBuffer);

    // Use a Map to track invoices by invoice number
    const invoiceMap = new Map<
      string,
      {
        invoiceNumber: string;
        pages: number[];
      }
    >();

    let lastInvoiceNumber: string | null = null;

    for (let i = 0; i < pages.length - 1; i++) {
      const text = pages[i].trim();
      if (!text) continue; // skip empty pages

      // Match invoice number (adjust regex if needed)
      const invoiceMatch = text.match(
        /INVOICE\s*(NUMBER|No\.?)?\s*[:#]?\s*(\d+)/i,
        // /\bINVOICE\s*(NUMBER|No\.?|#)\s*[:]?\s*([\w-]+)(?!\s*customer)/i
      );

      if (invoiceMatch) {
        lastInvoiceNumber = invoiceMatch[2];
      }

      // If we have an invoice number (either from this page or previous)
      if (lastInvoiceNumber) {
        if (!invoiceMap.has(lastInvoiceNumber)) {
          invoiceMap.set(lastInvoiceNumber, {
            invoiceNumber: lastInvoiceNumber,
            pages: [],
          });
        }
        invoiceMap.get(lastInvoiceNumber)!.pages.push(i + 1);
      }
    }

    // Convert map to array and calculate page ranges
    const invoices = Array.from(invoiceMap.values()).map((invoice) => {
      const sortedPages = invoice.pages.sort((a, b) => a - b);
      return {
        invoiceNumber: invoice.invoiceNumber,
        startPage: sortedPages[0],
        endPage: sortedPages[sortedPages.length - 1],
        pageCount: sortedPages.length,
        pages: sortedPages, // Optional: include all page numbers
      };
    });

    return {
      success: true,
      totalPages: pages.length,
      totalInvoices: invoices.length,
      invoices,
    };
  }

  async splitInvoicesPdf(attachmentId: number, userId: number) {
    const [attachment] = await db
      .select()
      .from(attachmentsModel)
      .where(
        and(
          eq(attachmentsModel.id, attachmentId),
          eq(attachmentsModel.isDeleted, false)
        )
      );

    const s3Url = attachment.fileUrl;
    //convert s3Url to attachment
    const s3Key = s3Url!.split(".amazonaws.com/")[1];
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: s3Key,
    });
    const s3Object = await s3Client.send(command);
    //@ts-ignore
    const pdfBuffer = s3Object.Body
      ? await streamToBuffer(s3Object.Body as Readable)
      : null;

    //@ts-ignore
    const originalPdf = await PDFDocument.load(pdfBuffer);

    const splitResults: any[] = [];
    //@ts-ignore
    const invoiceData = await this.extractInvoices(pdfBuffer);

    for (const inv of invoiceData.invoices) {
      const { startPage, endPage, invoiceNumber } = inv;

      try {
        const newPdf = await PDFDocument.create();

        // Copy pages safely in a separate array
        for (let i = startPage - 1; i < endPage; i++) {
          const [copiedPage] = await newPdf.copyPages(originalPdf, [i]);
          newPdf.addPage(copiedPage);
        }

        const newPdfBytes = await newPdf.save();

        // Upload directly to S3
        const s3Key = `invoices/Invoice_${uuidv4()}.pdf`;
        const s3Url = await uploadBufferToS3(
          Buffer.from(newPdfBytes),
          s3Key,
          "application/pdf",
        );

        //@ts-ignore
        const inserted = await this.insertInvoice({
          userId,
          attachmentId,
          invoiceNumber: invoiceNumber as string,
          fileUrl: s3Url,
          fileKey: s3Key,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        splitResults.push({
          invoiceNumber,
          startPage,
          endPage,
          pageCount: endPage - startPage + 1,
          s3Url,
        });
      } catch (err) {
        console.error(`Error splitting invoice ${invoiceNumber}:`, err);
      }
    }

    return {
      success: true,
      totalInvoices: splitResults.length,
      invoices: splitResults,
    };
  }

  async getLineItemsByName(itemName: string) {
    try {
      const lineItems = await db
        .select()
        .from(lineItemsModel)
        .where(eq(lineItemsModel.item_name, itemName));

      if (lineItems.length === 0) {
        const allItems = await db.select().from(lineItemsModel);
        const caseInsensitiveMatch = allItems.filter(item =>
          item.item_name?.toLowerCase().trim() === itemName.toLowerCase().trim()
        );
        return caseInsensitiveMatch;
      }

      return lineItems;
    } catch (error) {
      console.error("Error fetching line items by name:", error);
      throw error;
    }
  }

  async getAllLineItems() {
    try {
      const lineItems = await db
        .select()
        .from(lineItemsModel);

      return lineItems;
    } catch (error) {
      console.error("Error fetching all line items:", error);
      throw error;
    }
  }

  async getLineItemsByInvoiceId(invoiceId: number, viewType?: 'single' | 'expanded') {
    try {
      const whereConditions = [
        eq(lineItemsModel.invoiceId, invoiceId),
        eq(lineItemsModel.isDeleted, false)
      ];

      // Filter by view type if specified
      if (viewType) {
        whereConditions.push(eq(lineItemsModel.viewType, viewType));
      }

      const lineItems = await db
        .select()
        .from(lineItemsModel)
        .where(and(...whereConditions));

      return lineItems;
    } catch (error) {
      console.error("Error fetching line items by invoice ID:", error);
      throw error;
    }
  }

  async updateInvoiceStatus(invoiceId: number, status: string, rejectionReason?: string, recipientEmails?: string[]) {
    try {
      // Store comma-separated emails for backward compatibility in DB
      const emailsString = recipientEmails?.join(', ') || null;

      // Update the invoice status
      await db
        .update(invoiceModel)
        .set({
          status: status as any,
          rejectionEmailSender: emailsString,
          rejectionReason: rejectionReason || null,
          updatedAt: new Date()
        })
        .where(eq(invoiceModel.id, invoiceId));

      // Fetch the updated invoice with vendor data using JOIN
      const [updatedInvoiceWithVendor] = await db
        .select({
          ...getTableColumns(invoiceModel),
          sourcePdfUrl: attachmentsModel.fileUrl,
          // Vendor data from quickbooks_vendors table
          vendorData: {
            id: quickbooksVendorsModel.id,
            displayName: quickbooksVendorsModel.displayName,
            companyName: quickbooksVendorsModel.companyName,
            primaryEmail: quickbooksVendorsModel.primaryEmail,
            primaryPhone: quickbooksVendorsModel.primaryPhone,
            billAddrLine1: quickbooksVendorsModel.billAddrLine1,
            billAddrCity: quickbooksVendorsModel.billAddrCity,
            billAddrState: quickbooksVendorsModel.billAddrState,
            billAddrPostalCode: quickbooksVendorsModel.billAddrPostalCode,
            active: quickbooksVendorsModel.active,
            quickbooksId: quickbooksVendorsModel.quickbooksId,
          },
          userData: {
            firstName: usersModel.firstName,
            lastName: usersModel.lastName,
            companyName: usersModel.businessName,
          },
        })
        .from(invoiceModel)
        .leftJoin(
          attachmentsModel,
          eq(invoiceModel.attachmentId, attachmentsModel.id),
        )
        .leftJoin(
          quickbooksVendorsModel,
          eq(invoiceModel.vendorId, quickbooksVendorsModel.id),
        )
        .leftJoin(
          usersModel,
          eq(invoiceModel.userId, usersModel.id),
        )
        .where(
          and(
            eq(invoiceModel.id, invoiceId),
            eq(invoiceModel.isDeleted, false)
          )
        );

      if (!updatedInvoiceWithVendor) {
        throw new NotFoundError("Invoice not found after update");
      }

      // Send rejection email if status is "rejected" and recipient emails are provided
      if (status === "rejected" && recipientEmails && recipientEmails.length > 0) {
        const senderName = `${updatedInvoiceWithVendor?.userData?.firstName} ${updatedInvoiceWithVendor?.userData?.lastName}`.trim() || 'Me';
        const senderCompany = updatedInvoiceWithVendor?.userData?.companyName || 'My Company';
        try {
          await emailService.sendInvoiceRejectionEmail({
            to: recipientEmails,
            invoiceNumber: updatedInvoiceWithVendor.invoiceNumber || `INV-${invoiceId}`,
            vendorName: updatedInvoiceWithVendor.vendorData?.displayName || undefined,
            rejectionReason: rejectionReason,
            senderName: senderName,
            senderCompany: senderCompany,
            invoiceFileUrl: updatedInvoiceWithVendor.fileUrl || undefined,
          });
          console.log(`Rejection email sent to ${recipientEmails.join(', ')} for invoice ${updatedInvoiceWithVendor.invoiceNumber}`);
        } catch (emailError) {
          console.error("Failed to send rejection email:", emailError);
        }
      }

      return updatedInvoiceWithVendor;
    } catch (error) {
      console.error("Error updating invoice status:", error);
      throw error;
    }
  }

  async cloneInvoice(invoiceId: number, userId: number) {
    try {
      // Get the original invoice
      const [originalInvoice] = await db
        .select()
        .from(invoiceModel)
        .where(
          and(
            eq(invoiceModel.id, invoiceId),
            eq(invoiceModel.userId, userId),
            eq(invoiceModel.isDeleted, false)
          )
        );

      if (!originalInvoice) {
        throw new NotFoundError("Invoice not found or access denied");
      }

      // Get line items (only non-deleted ones)
      const lineItems = await db
        .select()
        .from(lineItemsModel)
        .where(
          and(
            eq(lineItemsModel.invoiceId, invoiceId),
            eq(lineItemsModel.isDeleted, false)
          )
        );

      // Generate new invoice number with suffix logic
      const originalNumber = originalInvoice.invoiceNumber || "INV";

      // Check if the invoice number already has a suffix pattern (ends with -XXX where XXX is digits)
      const suffixMatch = originalNumber.match(/^(.+)-(\d+)$/);

      let newInvoiceNumber: string;

      if (suffixMatch) {
        // Invoice already has a suffix (e.g., "546237-001" or "INV-2024-001")
        const basePart = suffixMatch[1]; // "546237" or "INV-2024"
        const suffixPart = suffixMatch[2]; // "001"
        const currentNum = parseInt(suffixPart, 10);
        const newNum = currentNum + 1;
        // Pad with zeros to match original length
        const paddedNum = String(newNum).padStart(suffixPart.length, '0');
        newInvoiceNumber = `${basePart}-${paddedNum}`;
      } else {
        // Invoice doesn't have a suffix, add -001
        newInvoiceNumber = `${originalNumber}-001`;
      }

      // Create new invoice
      const [newInvoice] = await db
        .insert(invoiceModel)
        .values({
          userId: originalInvoice.userId,
          attachmentId: originalInvoice.attachmentId,
          invoiceNumber: newInvoiceNumber,
          vendorId: originalInvoice.vendorId,
          customerId: originalInvoice.customerId,
          invoiceDate: originalInvoice.invoiceDate,
          dueDate: originalInvoice.dueDate,
          totalAmount: originalInvoice.totalAmount,
          currency: originalInvoice.currency,
          totalTax: originalInvoice.totalTax,
          description: originalInvoice.description,
          fileUrl: originalInvoice.fileUrl,
          fileKey: originalInvoice.fileKey,
          s3JsonKey: originalInvoice.s3JsonKey,
          status: "pending",
          isDeleted: false,
        })
        .returning();

      // Clone line items if any exist (only non-deleted ones)
      if (lineItems.length > 0) {
        await db.insert(lineItemsModel).values(
          lineItems.map((item) => ({
            invoiceId: newInvoice.id,
            item_name: item.item_name,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            itemType: item.itemType,
            resourceId: item.resourceId,
            isDeleted: false,
          }))
        );
      }

      return newInvoice;
    } catch (error) {
      console.error("Error cloning invoice:", error);
      throw error;
    }
  }

  async splitInvoice(invoiceId: number, userId: number, lineItemIds: number[]) {
    try {
      // Get the original invoice
      const [originalInvoice] = await db
        .select()
        .from(invoiceModel)
        .where(
          and(
            eq(invoiceModel.id, invoiceId),
            eq(invoiceModel.userId, userId),
            eq(invoiceModel.isDeleted, false)
          )
        );

      if (!originalInvoice) {
        throw new NotFoundError("Invoice not found or access denied");
      }

      // Get only the selected line items
      const lineItems = await db
        .select()
        .from(lineItemsModel)
        .where(
          and(
            eq(lineItemsModel.invoiceId, invoiceId),
            eq(lineItemsModel.isDeleted, false),
            inArray(lineItemsModel.id, lineItemIds)
          )
        );

      if (lineItems.length === 0) {
        throw new BadRequestError("No valid line items found to split");
      }

      // Generate new invoice number with suffix logic
      const originalNumber = originalInvoice.invoiceNumber || "INV";
      const suffixMatch = originalNumber.match(/^(.+)-(\d+)$/);

      let newInvoiceNumber: string;
      if (suffixMatch) {
        const basePart = suffixMatch[1];
        const suffixPart = suffixMatch[2];
        const currentNum = parseInt(suffixPart, 10);
        const newNum = currentNum + 1;
        const paddedNum = String(newNum).padStart(suffixPart.length, '0');
        newInvoiceNumber = `${basePart}-${paddedNum}`;
      } else {
        newInvoiceNumber = `${originalNumber}-001`;
      }

      // Calculate total amount from selected line items
      const totalAmount = lineItems.reduce((sum, item) => {
        return sum + parseFloat(item.amount || "0");
      }, 0).toFixed(2);

      // Create new invoice
      const [newInvoice] = await db
        .insert(invoiceModel)
        .values({
          userId: originalInvoice.userId,
          attachmentId: originalInvoice.attachmentId,
          invoiceNumber: newInvoiceNumber,
          vendorId: originalInvoice.vendorId,
          customerId: originalInvoice.customerId,
          invoiceDate: originalInvoice.invoiceDate,
          dueDate: originalInvoice.dueDate,
          totalAmount: totalAmount,
          currency: originalInvoice.currency,
          totalTax: originalInvoice.totalTax,
          description: originalInvoice.description,
          fileUrl: originalInvoice.fileUrl,
          fileKey: originalInvoice.fileKey,
          s3JsonKey: originalInvoice.s3JsonKey,
          status: "pending",
          isDeleted: false,
        })
        .returning();

      // Clone only the selected line items to the new invoice
      await db.insert(lineItemsModel).values(
        lineItems.map((item) => ({
          invoiceId: newInvoice.id,
          item_name: item.item_name,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          itemType: item.itemType,
          resourceId: item.resourceId,
          isDeleted: false,
        }))
      );

      return newInvoice;
    } catch (error) {
      console.error("Error splitting invoice:", error);
      throw error;
    }
  }

  async createLineItem(
    lineItemData: {
      invoiceId: number;
      item_name: string;
      description: string | null;
      quantity: string;
      rate: string;
      amount: string;
      itemType?: 'account' | 'product' | null;
      resourceId?: string | null;
      customerId?: string | null;
    },
    userId: number
  ) {
    try {
      // Verify invoice exists and belongs to user
      const [invoice] = await db
        .select()
        .from(invoiceModel)
        .where(
          and(
            eq(invoiceModel.id, lineItemData.invoiceId),
            eq(invoiceModel.userId, userId)
          )
        );

      if (!invoice) {
        throw new NotFoundError("Invoice not found or access denied");
      }

      // Create the line item
      const [newLineItem] = await db
        .insert(lineItemsModel)
        .values({
          invoiceId: lineItemData.invoiceId,
          item_name: lineItemData.item_name,
          description: lineItemData.description,
          quantity: lineItemData.quantity,
          rate: lineItemData.rate,
          amount: lineItemData.amount,
          itemType: lineItemData.itemType || null,
          resourceId: lineItemData.resourceId || null,
          customerId: lineItemData.customerId || null,
          isDeleted: false,
        })
        .returning();

      return newLineItem;
    } catch (error) {
      console.error("Error creating line item:", error);
      throw error;
    }
  }

  async updateLineItem(
    lineItemId: number,
    updateData: {
      itemType?: 'account' | 'product' | null;
      resourceId?: string | null;
      customerId?: string | null;
      quantity?: string;
      rate?: string;
      amount?: string;
      item_name?: string;
      description?: string;
    }
  ) {
    try {
      // Verify line item exists
      const [existingLineItem] = await db
        .select()
        .from(lineItemsModel)
        .where(eq(lineItemsModel.id, lineItemId));

      if (!existingLineItem) {
        throw new NotFoundError("Line item not found");
      }

      // Get invoice information for user ID
      const [invoiceInfo] = await db
        .select({
          userId: invoiceModel.userId,
        })
        .from(invoiceModel)
        .where(eq(invoiceModel.id, existingLineItem.invoiceId));

      if (!invoiceInfo) {
        throw new NotFoundError("Invoice not found for line item");
      }

      // Prepare update data
      const updateFields: any = {};

      if (updateData.itemType !== undefined) {
        updateFields.itemType = updateData.itemType;
      }

      if (updateData.resourceId !== undefined) {
        updateFields.resourceId = updateData.resourceId;
      }

      if (updateData.customerId !== undefined) {
        updateFields.customerId = updateData.customerId;
      }

      if (updateData.quantity !== undefined) {
        updateFields.quantity = updateData.quantity;
      }

      if (updateData.rate !== undefined) {
        updateFields.rate = updateData.rate;
      }

      if (updateData.amount !== undefined) {
        updateFields.amount = updateData.amount;
      }

      if (updateData.item_name !== undefined) {
        updateFields.item_name = updateData.item_name;
      }

      if (updateData.description !== undefined) {
        updateFields.description = updateData.description;
      }

      // If itemType is being changed, clear resourceId if it doesn't match
      if (updateData.itemType !== undefined && updateData.resourceId === undefined) {
        // If changing type without setting resourceId, clear it
        updateFields.resourceId = null;
      }

      // Update the line item in database first
      const [updatedLineItem] = await db
        .update(lineItemsModel)
        .set(updateFields)
        .where(eq(lineItemsModel.id, lineItemId))
        .returning();

      // Sync description changes to QuickBooks if description was updated and we have a resourceId
      if (updateData.description !== undefined && existingLineItem.resourceId && existingLineItem.itemType === 'product') {
        try {
          const quickbooksService = new (await import('./quickbooks.service')).QuickBooksService();
          const integration = await quickbooksService.getUserIntegration(invoiceInfo.userId);

          if (integration) {
            // Get current QuickBooks product data
            const [currentProductData] = await db
              .select({
                quickbooksId: quickbooksProductsModel.quickbooksId,
                syncToken: quickbooksProductsModel.syncToken,
                name: quickbooksProductsModel.name,
                description: quickbooksProductsModel.description,
              })
              .from(quickbooksProductsModel)
              .where(
                and(
                  eq(quickbooksProductsModel.quickbooksId, existingLineItem.resourceId),
                  eq(quickbooksProductsModel.userId, invoiceInfo.userId)
                )
              )
              .limit(1);

            if (currentProductData?.quickbooksId && currentProductData?.syncToken) {
              // Check if description actually changed
              const hasDescriptionChange = updateData.description !== currentProductData.description;

              if (hasDescriptionChange) {
                // Update in QuickBooks
                const updatedQBItem = await quickbooksService.updateItem(
                  integration,
                  currentProductData.quickbooksId,
                  {
                    description: updateData.description,
                    syncToken: currentProductData.syncToken
                  }
                );

                // Update sync token in local database
                const newSyncToken = updatedQBItem?.QueryResponse?.Item?.[0]?.SyncToken ||
                  updatedQBItem?.Item?.SyncToken ||
                  updatedQBItem?.SyncToken;

                if (newSyncToken) {
                  await db
                    .update(quickbooksProductsModel)
                    .set({
                      description: updateData.description,
                      syncToken: newSyncToken,
                      updatedAt: new Date()
                    })
                    .where(
                      and(
                        eq(quickbooksProductsModel.quickbooksId, currentProductData.quickbooksId),
                        eq(quickbooksProductsModel.userId, invoiceInfo.userId)
                      )
                    );
                }
              }
            }
          }
        } catch (qbError: any) {
          console.error("QuickBooks item description sync error:", qbError);

          // Log detailed error information
          if (qbError.response) {
            console.error("QuickBooks API response status:", qbError.response.status);
            console.error("QuickBooks API response data:", qbError.response.data);
          }
          if (qbError.message) {
            console.error("QuickBooks error message:", qbError.message);
          }

          // Don't throw error - line item was updated successfully, QB sync is optional
        }
      }

      return updatedLineItem;
    } catch (error) {
      console.error("Error updating line item:", error);
      throw error;
    }
  }

  async deleteLineItem(lineItemId: number, userId: number) {
    try {
      // Verify line item exists and belongs to user's invoice
      const [existingLineItem] = await db
        .select({
          lineItem: lineItemsModel,
          invoice: invoiceModel,
        })
        .from(lineItemsModel)
        .innerJoin(invoiceModel, eq(lineItemsModel.invoiceId, invoiceModel.id))
        .where(
          and(
            eq(lineItemsModel.id, lineItemId),
            eq(invoiceModel.userId, userId)
          )
        );

      if (!existingLineItem) {
        throw new NotFoundError("Line item not found or access denied");
      }

      // Soft delete by setting isDeleted to true
      await db
        .update(lineItemsModel)
        .set({
          isDeleted: true,
          deletedAt: new Date()
        })
        .where(eq(lineItemsModel.id, lineItemId));

      return { success: true };
    } catch (error) {
      console.error("Error deleting line item:", error);
      throw error;
    }
  }

  async getDashboardMetrics(userId: number, dateRange: 'monthly' | 'all-time' = 'monthly') {
    try {
      // Calculate date boundaries based on range
      const now = new Date();
      let startDate: Date | null = null;
      let endDate: Date | null = null;

      if (dateRange === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      }
      // For 'all-time', startDate and endDate remain null (no date filtering)

      // Fetch last 10 invoices with full details including attachment URL
      const recentInvoices = await db
        .select({
          ...getTableColumns(invoiceModel),
          sourcePdfUrl: attachmentsModel.fileUrl,
        })
        .from(invoiceModel)
        .leftJoin(
          attachmentsModel,
          eq(invoiceModel.attachmentId, attachmentsModel.id),
        )
        .where(
          and(
            eq(invoiceModel.userId, userId),
            eq(invoiceModel.isDeleted, false)
          )
        )
        .orderBy(desc(invoiceModel.createdAt))
        .limit(10);

      // Count invoices in the selected date range
      const invoiceConditions = [
        eq(invoiceModel.userId, userId),
        eq(invoiceModel.isDeleted, false),
      ];
      if (startDate && endDate) {
        invoiceConditions.push(gte(invoiceModel.createdAt, startDate));
        invoiceConditions.push(lt(invoiceModel.createdAt, endDate));
      }

      const [invoicesResult] = await db
        .select({ count: count() })
        .from(invoiceModel)
        .where(and(...invoiceConditions));

      // Count approved invoices in the selected date range
      const approvedConditions = [
        eq(invoiceModel.userId, userId),
        eq(invoiceModel.isDeleted, false),
        eq(invoiceModel.status, "approved"),
      ];
      if (startDate && endDate) {
        approvedConditions.push(gte(invoiceModel.createdAt, startDate));
        approvedConditions.push(lt(invoiceModel.createdAt, endDate));
      }

      const [approvedResult] = await db
        .select({ count: count() })
        .from(invoiceModel)
        .where(and(...approvedConditions));

      // Count rejected invoices in the selected date range
      const rejectedConditions = [
        eq(invoiceModel.userId, userId),
        eq(invoiceModel.isDeleted, false),
        eq(invoiceModel.status, "rejected"),
      ];
      if (startDate && endDate) {
        rejectedConditions.push(gte(invoiceModel.createdAt, startDate));
        rejectedConditions.push(lt(invoiceModel.createdAt, endDate));
      }

      const [rejectedResult] = await db
        .select({ count: count() })
        .from(invoiceModel)
        .where(and(...rejectedConditions));

      // Count ALL pending invoices (not date-filtered) for "Pending Review"
      const [allPendingResult] = await db
        .select({ count: count() })
        .from(invoiceModel)
        .where(
          and(
            eq(invoiceModel.userId, userId),
            eq(invoiceModel.isDeleted, false),
            eq(invoiceModel.status, "pending")
          )
        );

      // Calculate total outstanding (sum of totalAmount for ALL pending invoices)
      const [totalOutstandingResult] = await db
        .select({
          total: sql<string>`COALESCE(SUM(${invoiceModel.totalAmount}::numeric), 0)`,
        })
        .from(invoiceModel)
        .where(
          and(
            eq(invoiceModel.userId, userId),
            eq(invoiceModel.isDeleted, false),
            eq(invoiceModel.status, "pending")
          )
        );

      const metrics = {
        invoicesThisMonth: invoicesResult.count,
        pendingThisMonth: allPendingResult.count, // All pending invoices, not date-filtered
        approvedThisMonth: approvedResult.count,
        rejectedThisMonth: rejectedResult.count,
        totalOutstanding: parseFloat(totalOutstandingResult.total || "0"),
      };

      return {
        recentInvoices,
        metrics,
      };
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      throw error;
    }
  }

  async getInvoiceTrends(userId: number, dateRange: 'monthly' | 'all-time' = 'monthly') {
    try {
      const now = new Date();
      let trendData: any[] = [];

      if (dateRange === 'monthly') {
        // For debugging: let's also get the total monthly count to compare
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        // Debug: Get total monthly count using same logic as dashboard metrics
        const [totalMonthlyCount] = await db
          .select({ count: count() })
          .from(invoiceModel)
          .where(
            and(
              eq(invoiceModel.userId, userId),
              eq(invoiceModel.isDeleted, false),
              gte(invoiceModel.createdAt, startOfMonth),
              lt(invoiceModel.createdAt, endOfMonth) // Use lt() like dashboard metrics
            )
          );

        const [totalMonthlyOutstanding] = await db
          .select({
            total: sql<string>`COALESCE(SUM(${invoiceModel.totalAmount}::numeric), 0)`,
          })
          .from(invoiceModel)
          .where(
            and(
              eq(invoiceModel.userId, userId),
              eq(invoiceModel.isDeleted, false),
              eq(invoiceModel.status, "pending"),
              gte(invoiceModel.createdAt, startOfMonth),
              lt(invoiceModel.createdAt, endOfMonth) // Use lt() like dashboard metrics
            )
          );

        console.log(`DEBUG: Total monthly invoices: ${totalMonthlyCount.count}, Total outstanding: ${totalMonthlyOutstanding.total}`);

        // Get weekly data for current month
        const actualEndOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of month

        // Calculate actual weeks of the current month
        const weeks: { start: Date; end: Date; name: string }[] = [];
        let currentWeekStart = new Date(startOfMonth);

        // Find the first Monday of the month (or start of month if it's later)
        const firstDayOfWeek = startOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
        if (firstDayOfWeek !== 1) { // If not Monday
          // Go back to the previous Monday, but not before start of month
          const daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
          currentWeekStart.setDate(currentWeekStart.getDate() - daysToSubtract);
          if (currentWeekStart < startOfMonth) {
            currentWeekStart = new Date(startOfMonth);
          }
        }

        let weekNumber = 1;
        while (currentWeekStart <= actualEndOfMonth) {
          const weekEnd = new Date(currentWeekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999); // End of day

          // Don't go beyond end of month
          if (weekEnd > actualEndOfMonth) {
            weekEnd.setTime(actualEndOfMonth.getTime());
            weekEnd.setHours(23, 59, 59, 999);
          }

          // Only include weeks that have at least one day in the current month
          if (weekEnd >= startOfMonth) {
            weeks.push({
              start: new Date(Math.max(currentWeekStart.getTime(), startOfMonth.getTime())),
              end: new Date(weekEnd),
              name: `Week ${weekNumber}`
            });
            weekNumber++;
          }

          // Move to next week
          currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        }

        // Generate data for each week
        for (const week of weeks) {
          // Use createdAt and same date logic as dashboard metrics
          const [invoiceCount] = await db
            .select({ count: count() })
            .from(invoiceModel)
            .where(
              and(
                eq(invoiceModel.userId, userId),
                eq(invoiceModel.isDeleted, false),
                gte(invoiceModel.createdAt, week.start),
                lte(invoiceModel.createdAt, week.end) // Use lte for week end
              )
            );

          // Calculate total outstanding (pending invoices only) to match dashboard metrics
          const [totalOutstanding] = await db
            .select({
              total: sql<string>`COALESCE(SUM(${invoiceModel.totalAmount}::numeric), 0)`,
            })
            .from(invoiceModel)
            .where(
              and(
                eq(invoiceModel.userId, userId),
                eq(invoiceModel.isDeleted, false),
                eq(invoiceModel.status, "pending"), // Only pending invoices for outstanding amount
                gte(invoiceModel.createdAt, week.start),
                lte(invoiceModel.createdAt, week.end) // Use lte for week end
              )
            );


          trendData.push({
            name: week.name,
            invoices: invoiceCount.count,
            amount: parseFloat(totalOutstanding.total || "0"), // This is now total outstanding
          });
        }

      } else {
        // Get yearly data for all-time view
        const earliestYear = 1970; // Start from a reasonable earliest year
        const currentYear = now.getFullYear();

        for (let year = earliestYear; year <= currentYear; year++) {
          const yearStart = new Date(year, 0, 1);
          const yearEnd = new Date(year, 11, 31, 23, 59, 59);

          // Use createdAt instead of invoiceDate to match dashboard metrics
          const [invoiceCount] = await db
            .select({ count: count() })
            .from(invoiceModel)
            .where(
              and(
                eq(invoiceModel.userId, userId),
                eq(invoiceModel.isDeleted, false),
                // Include all statuses to match dashboard metrics
                gte(invoiceModel.createdAt, yearStart),
                lte(invoiceModel.createdAt, yearEnd)
              )
            );

          // Calculate total outstanding (pending invoices only) to match dashboard metrics
          const [totalOutstanding] = await db
            .select({
              total: sql<string>`COALESCE(SUM(${invoiceModel.totalAmount}::numeric), 0)`,
            })
            .from(invoiceModel)
            .where(
              and(
                eq(invoiceModel.userId, userId),
                eq(invoiceModel.isDeleted, false),
                eq(invoiceModel.status, "pending"), // Only pending invoices for outstanding amount
                gte(invoiceModel.createdAt, yearStart),
                lte(invoiceModel.createdAt, yearEnd)
              )
            );

          // Only include years that have data
          if (invoiceCount.count > 0) {
            trendData.push({
              name: year.toString(),
              invoices: invoiceCount.count,
              amount: parseFloat(totalOutstanding.total || "0"), // This is now total outstanding
            });
          }
        }
      }

      return trendData;
    } catch (error) {
      console.error("Error fetching invoice trends:", error);
      throw error;
    }
  }

  async getQuickBooksVendorById(vendorId: number) {
    const vendor = await db
      .select({
        id: quickbooksVendorsModel.id,
        displayName: quickbooksVendorsModel.displayName,
        companyName: quickbooksVendorsModel.companyName,
        primaryEmail: quickbooksVendorsModel.primaryEmail,
        primaryPhone: quickbooksVendorsModel.primaryPhone,
        billAddrLine1: quickbooksVendorsModel.billAddrLine1,
        billAddrCity: quickbooksVendorsModel.billAddrCity,
        billAddrState: quickbooksVendorsModel.billAddrState,
        billAddrPostalCode: quickbooksVendorsModel.billAddrPostalCode,
        active: quickbooksVendorsModel.active,
        quickbooksId: quickbooksVendorsModel.quickbooksId,
      })
      .from(quickbooksVendorsModel)
      .where(eq(quickbooksVendorsModel.id, vendorId))
      .limit(1);

    return vendor.length > 0 ? vendor[0] : null;
  }

  async createOrUpdateSingleModeLineItem(data: {
    userId: number;
    invoiceId: number;
    itemType: 'account' | 'product';
    resourceId: string;
    customerId?: string;
    quantity?: string;
    rate?: string;
    totalAmount: string;
    description: string;
  }) {
    try {
      // Get existing single mode line item for this invoice
      const [existingSingleItem] = await db
        .select()
        .from(lineItemsModel)
        .where(
          and(
            eq(lineItemsModel.invoiceId, data.invoiceId),
            eq(lineItemsModel.viewType, 'single')
          )
        );

      let lineItemData;

      if (existingSingleItem) {
        // Update existing single mode line item (no QuickBooks item creation needed)
        const [updatedLineItem] = await db
          .update(lineItemsModel)
          .set({
            item_name: data.description,
            description: data.description,
            quantity: data.quantity || "1",
            rate: data.rate || data.totalAmount,
            amount: data.totalAmount,
            itemType: data.itemType,
            resourceId: data.resourceId,
            customerId: data.customerId,
            updatedAt: new Date(),
          })
          .where(eq(lineItemsModel.id, existingSingleItem.id))
          .returning();

        lineItemData = updatedLineItem;
      } else {
        // Create new single mode line item (no QuickBooks item creation needed - use existing resourceId)
        const [newLineItem] = await db
          .insert(lineItemsModel)
          .values({
            invoiceId: data.invoiceId,
            item_name: data.description,
            description: data.description,
            quantity: data.quantity || "1",
            rate: data.rate || data.totalAmount,
            amount: data.totalAmount,
            itemType: data.itemType,
            resourceId: data.resourceId, // This is already a QuickBooks ID from the dropdown selection
            customerId: data.customerId,
            viewType: 'single',
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        lineItemData = newLineItem;
      }

      return lineItemData;
    } catch (error: any) {
      console.error("Error in createOrUpdateSingleModeLineItem:", error);
      throw error;
    }
  }
}
export const invoiceServices = new InvoiceServices();
