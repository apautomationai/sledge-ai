import { BadRequestError, NotFoundError } from "@/helpers/errors";
import db from "@/lib/db";
import { attachmentsModel } from "@/models/attachments.model";
import { invoiceModel, lineItemsModel } from "@/models/invoice.model";
import { quickbooksVendorsModel } from "@/models/quickbooks-vendors.model";
import { count, desc, eq, getTableColumns, and, sql, gte, lt, inArray } from "drizzle-orm";
import { PDFDocument } from "pdf-lib";
import { s3Client, uploadBufferToS3 } from "@/helpers/s3upload";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { streamToBuffer } from "@/lib/utils/steamToBuffer";
import { Readable } from "stream";
import { generateS3PublicUrl } from "@/lib/utils/s3";
import { QuickBooksService } from "@/services/quickbooks.service";
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
            existingInvoice.vendorAddress !== invoiceData.vendorAddress ||
            existingInvoice.vendorPhone !== invoiceData.vendorPhone ||
            existingInvoice.vendorEmail !== invoiceData.vendorEmail ||
            existingInvoice.customerName !== invoiceData.customerName ||
            existingInvoice.invoiceDate?.getTime() !== invoiceData.invoiceDate?.getTime() ||
            existingInvoice.dueDate?.getTime() !== invoiceData.dueDate?.getTime() ||
            existingInvoice.totalAmount !== invoiceData.totalAmount ||
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
                vendorAddress: invoiceData.vendorAddress,
                vendorPhone: invoiceData.vendorPhone,
                vendorEmail: invoiceData.vendorEmail,
                customerName: invoiceData.customerName,
                invoiceDate: invoiceData.invoiceDate,
                dueDate: invoiceData.dueDate,
                totalAmount: invoiceData.totalAmount,
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
          // Create new invoice
          const [newInvoice] = await tx
            .insert(invoiceModel)
            .values({
              ...invoiceData,
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
                    console.log(`Found QuickBooks product for "${item.item_name}": ${topMatch.name} (ID: ${resourceId})`);
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
        fileUrl: invoiceModel.fileUrl,
        createdAt: invoiceModel.createdAt,
        invoiceDate: invoiceModel.invoiceDate,
        status: invoiceModel.status,
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
      // Update the invoice
      await db
        .update(invoiceModel)
        .set({ ...updatedData, updatedAt: new Date() })
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
        .where(
          and(
            eq(invoiceModel.id, invoiceId),
            eq(invoiceModel.isDeleted, false)
          )
        );

      if (!updatedInvoiceWithVendor) {
        throw new NotFoundError("Invoice not found after update");
      }

      return updatedInvoiceWithVendor;
    } catch (error) {
      console.log(error);
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

  async getInvoiceLineItems(invoiceId: number) {
    try {
      const lineItems = await db
        .select()
        .from(lineItemsModel)
        .where(eq(lineItemsModel.invoiceId, invoiceId));

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

  async getLineItemsByInvoiceId(invoiceId: number) {
    try {
      const lineItems = await db
        .select()
        .from(lineItemsModel)
        .where(
          and(
            eq(lineItemsModel.invoiceId, invoiceId),
            eq(lineItemsModel.isDeleted, false)
          )
        );

      return lineItems;
    } catch (error) {
      console.error("Error fetching line items by invoice ID:", error);
      throw error;
    }
  }

  async updateInvoiceStatus(invoiceId: number, status: string) {
    try {
      // Update the invoice status
      await db
        .update(invoiceModel)
        .set({
          status: status as any,
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
        .where(
          and(
            eq(invoiceModel.id, invoiceId),
            eq(invoiceModel.isDeleted, false)
          )
        );

      if (!updatedInvoiceWithVendor) {
        throw new NotFoundError("Invoice not found after update");
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
          vendorAddress: originalInvoice.vendorAddress,
          vendorPhone: originalInvoice.vendorPhone,
          vendorEmail: originalInvoice.vendorEmail,
          customerName: originalInvoice.customerName,
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
          vendorAddress: originalInvoice.vendorAddress,
          vendorPhone: originalInvoice.vendorPhone,
          vendorEmail: originalInvoice.vendorEmail,
          customerName: originalInvoice.customerName,
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

      const [updatedLineItem] = await db
        .update(lineItemsModel)
        .set(updateFields)
        .where(eq(lineItemsModel.id, lineItemId))
        .returning();

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

      const [invoicesThisMonthResult] = await db
        .select({ count: count() })
        .from(invoiceModel)
        .where(and(...invoiceConditions));

      // Count pending invoices in the selected date range
      const pendingConditions = [
        eq(invoiceModel.userId, userId),
        eq(invoiceModel.isDeleted, false),
        eq(invoiceModel.status, "pending"),
      ];
      if (startDate && endDate) {
        pendingConditions.push(gte(invoiceModel.createdAt, startDate));
        pendingConditions.push(lt(invoiceModel.createdAt, endDate));
      }

      const [pendingThisMonthResult] = await db
        .select({ count: count() })
        .from(invoiceModel)
        .where(and(...pendingConditions));

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

      const [approvedThisMonthResult] = await db
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

      const [rejectedThisMonthResult] = await db
        .select({ count: count() })
        .from(invoiceModel)
        .where(and(...rejectedConditions));

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

      return {
        recentInvoices,
        metrics: {
          invoicesThisMonth: invoicesThisMonthResult.count,
          pendingThisMonth: pendingThisMonthResult.count,
          approvedThisMonth: approvedThisMonthResult.count,
          rejectedThisMonth: rejectedThisMonthResult.count,
          totalOutstanding: parseFloat(totalOutstandingResult.total || "0"),
        },
      };
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
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
}
export const invoiceServices = new InvoiceServices();
