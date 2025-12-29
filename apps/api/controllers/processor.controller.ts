import { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "@/helpers/errors";
import { attachmentServices } from "@/services/attachment.services";
import { invoiceServices } from "@/services/invoice.services";
import { projectsServices } from "@/services/projects.services";
import { vendorsService } from "@/services/vendors.service";
import { getWebSocketService } from "@/services/websocket.service";

// import fs from 'fs';

class ProcessorController {
  async getAttachmentInfo(req: Request, res: Response) {
    const { attachmentId } = req.params;
    const attachmentIdNumber = parseInt(attachmentId, 10);

    if (isNaN(attachmentIdNumber)) {
      return res.status(400).json({ success: false, error: "Invalid attachment ID" });
    }

    try {
      const attachment = await attachmentServices.getAttachmentById(attachmentIdNumber);

      if (!attachment) {
        return res.status(404).json({ success: false, error: "Attachment not found" });
      }

      return res.status(200).json({ success: true, data: attachment });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || "Internal server error" });
    }
  }

  async createBatchInvoices(req: Request, res: Response) {
    const self = this; // Store reference to 'this' to avoid context issues
    try {
      const { invoices } = req.body;
      // save the json invoices in a json file

      // const jsonFileName = `batch-invoice-${Date.now()}.json`;
      // fs.writeFileSync(jsonFileName, JSON.stringify(invoices, null, 2));

      // console.log("createBatchInvoices", JSON.stringify(req.body, null, 2));

      // Validate that invoices is an array
      if (!Array.isArray(invoices)) {
        throw new BadRequestError("Invoices must be an array");
      }

      // Validate that invoices array is not empty
      if (invoices.length === 0) {
        throw new BadRequestError("Invoices array cannot be empty");
      }

      // Resolve user ID once if available from auth
      let userId: number | null = null;
      //@ts-ignore
      if (req.user?.id) {
        //@ts-ignore
        userId = req.user.id;
      }

      // Resolve user ID for all invoices (needed for vendor deduplication)
      let resolvedUserId: number;
      if (userId !== null) {
        resolvedUserId = userId;
      } else {
        // Get user ID from first invoice's attachment
        const firstAttachmentId = invoices[0]?.attachment_id;
        if (!firstAttachmentId) {
          throw new BadRequestError("Attachment ID is required for the first invoice");
        }
        const attachment = await attachmentServices.getAttachmentById(firstAttachmentId);
        if (!attachment) {
          throw new NotFoundError("Attachment not found");
        }
        resolvedUserId = attachment.userId;
      }

      // OPTIMIZATION: Deduplicate vendors before processing to avoid race conditions
      // Extract unique vendors from all invoices
      const uniqueVendors = new Map<string, {
        vendor_name: string;
        vendor_address?: string;
        vendor_phone?: string;
        vendor_email?: string;
      }>();

      for (const invoice of invoices) {
        if (invoice.vendor_name) {
          const vendorKey = invoice.vendor_name.trim().toLowerCase();
          if (!uniqueVendors.has(vendorKey)) {
            uniqueVendors.set(vendorKey, {
              vendor_name: invoice.vendor_name,
              vendor_address: invoice.vendor_address,
              vendor_phone: invoice.vendor_phone,
              vendor_email: invoice.vendor_email,
            });
          }
        }
      }

      // Create/find all unique vendors upfront
      const vendorIdMap = new Map<string, number>();
      for (const [vendorKey, vendorData] of uniqueVendors.entries()) {
        try {
          const vendorId = await vendorsService.findOrCreateVendor(resolvedUserId, vendorData);
          vendorIdMap.set(vendorKey, vendorId);
        } catch (error: any) {
          console.error(`Error creating/finding vendor ${vendorData.vendor_name}:`, error);
          // Continue processing other vendors
        }
      }

      // Process each invoice and collect results
      const results: any[] = [];
      const wsService = getWebSocketService();

      for (const invoice of invoices) {
        try {
          // Get pre-resolved vendor ID from map
          const vendorKey = invoice.vendor_name?.trim().toLowerCase();
          const preResolvedVendorId = vendorKey ? vendorIdMap.get(vendorKey) : undefined;

          // Process the invoice with pre-resolved vendor ID
          const { result, userId: invoiceUserId } = await self.processSingleInvoice(
            invoice,
            resolvedUserId,
            preResolvedVendorId
          );
          const { invoice: createdInvoice, operation } = result;

          // Emit WebSocket events for real-time updates
          switch (operation) {
            case 'created':
              wsService.emitInvoiceCreated(invoiceUserId, createdInvoice);
              break;
            case 'updated':
              wsService.emitInvoiceUpdated(invoiceUserId, createdInvoice);
              break;
          }

          // Add successful result
          results.push({
            success: true,
            invoice_number: invoice.invoice_number,
            data: createdInvoice,
            operation,
            message: operation === 'created'
              ? "Invoice created successfully"
              : operation === 'updated'
                ? "Invoice updated successfully"
                : "Invoice already exists with same data",
          });
        } catch (error: any) {
          // Add error result
          let errorMessage = "Internal server error";
          if (error instanceof BadRequestError) {
            errorMessage = error.message;
          } else if (error instanceof NotFoundError) {
            errorMessage = error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          results.push({
            success: false,
            invoice_number: invoice.invoice_number || "unknown",
            error: errorMessage,
          });
        }
      }

      // Calculate summary statistics
      const total = invoices.length;
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      // Determine response status code
      // Use 207 (Multi-Status) if there are any failures, 200 if all succeed
      const statusCode = failed > 0 ? 207 : 200;

      return res.status(statusCode).json({
        success: failed === 0,
        summary: {
          total,
          successful,
          failed,
        },
        results,
      });
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  async getAllProjects(_req: Request, res: Response) {
    try {

      // Fetch projects from service
      const { projects, totalCount } = await projectsServices.getAllProjects();

      // Safe check for empty array
      if (!projects || projects.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No projects found",
        });
      }

      const addresses = projects.map(p => p.address);

      return res.json({
        success: true,
        data: {
          addresses,
          totalCount,
        },
      });
    } catch (error: any) {
      console.error(error);
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }


  async updateAttachment(req: Request, res: Response) {
    const { attachmentId } = req.params;
    const attachmentIdNumber = parseInt(attachmentId, 10);

    if (isNaN(attachmentIdNumber)) {
      throw new BadRequestError("Invalid attachment ID");
    }

    try {
      const { status, processed_at, ...data } = req.body;

      // If processed_at === "now", set it to current timestamp
      if (processed_at === "now") {
        data.processed_at = new Date(); // current datetime
      }

      const updated = await attachmentServices.updateAttachment(
        attachmentIdNumber,
        { status, ...data }
      );

      // Emit WebSocket event
      if (status && updated) {
        const wsService = getWebSocketService();
        wsService.emitAttachmentStatusUpdated(updated.userId, attachmentIdNumber, status, updated);
      }

      return res.status(200).json({ success: true, data: updated });

    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || "Internal server error" });
    }
  }


  private async processSingleInvoice(
    invoiceData: any,
    userId: number | null = null,
    preResolvedVendorId?: number
  ) {
    // Extract data from invoice object
    const {
      invoice_number,
      customer_name,
      vendor_name,
      vendor_address,
      vendor_phone,
      vendor_email,
      invoice_date,
      due_date,
      total_amount,
      currency,
      total_tax,
      description,
      line_items,
      attachment_id,
      s3_pdf_key,
      s3_json_key,
    } = invoiceData;

    // Validate required fields
    if (!attachment_id) {
      throw new BadRequestError("Attachment ID is required");
    }

    if (!invoice_number || !vendor_name || !customer_name) {
      throw new BadRequestError("Invoice number, vendor name, and customer name are required");
    }

    if (!invoice_date) {
      throw new BadRequestError("Invoice date is required");
    }

    if (!total_amount) {
      throw new BadRequestError("Total amount is required");
    }

    // Resolve user ID if not provided
    let resolvedUserId: number;
    if (userId !== null) {
      resolvedUserId = userId;
    } else {
      const attachment = await attachmentServices.getAttachmentById(attachment_id);
      if (!attachment) {
        throw new NotFoundError("Attachment not found");
      }
      resolvedUserId = attachment.userId;
    }

    // Resolve vendor ID from vendor name (use pre-resolved if available)
    const vendorId = preResolvedVendorId ?? await vendorsService.findOrCreateVendor(resolvedUserId, {
      vendor_name,
      vendor_address,
      vendor_phone,
      vendor_email,
    });

    // Parse dates
    const parsedInvoiceDate = new Date(invoice_date);
    const parsedDueDate = due_date ? new Date(due_date) : null;

    // Validate dates
    if (isNaN(parsedInvoiceDate.getTime())) {
      throw new BadRequestError("Invalid invoice date format");
    }

    if (due_date && parsedDueDate && isNaN(parsedDueDate.getTime())) {
      throw new BadRequestError("Invalid due date format");
    }

    // Prepare invoice data
    const invoicePayload = {
      userId: resolvedUserId,
      attachmentId: attachment_id,
      invoiceNumber: invoice_number,
      vendorId: vendorId,
      vendorAddress: vendor_address,
      vendorPhone: vendor_phone,
      vendorEmail: vendor_email,
      customerName: customer_name,
      invoiceDate: parsedInvoiceDate,
      dueDate: parsedDueDate,
      totalAmount: total_amount ? total_amount.toString() : null,
      currency: currency,
      totalTax: total_tax ? total_tax.toString() : null,
      description: description || "",
      fileKey: s3_pdf_key || "",
      s3JsonKey: s3_json_key || "",
    };

    // Prepare line items data
    const lineItemsData = line_items?.map((item: any) => ({
      item_name: item.item_name || "",
      quantity: item.quantity || 0,
      rate: item.unit_price || 0,
      amount: item.total_price || 0,
    })) || [];

    // Create or update invoice with line items
    const result = await invoiceServices.createInvoiceWithLineItems(
      invoicePayload,
      lineItemsData
    );

    return { result, userId: resolvedUserId };
  }

  async createInvoice(req: Request, res: Response) {
    try {
      console.log("createInvoice", JSON.stringify(req.body, null, 2));

      // Resolve user ID
      let userId: number | null = null;
      //@ts-ignore
      if (req.user?.id) {
        //@ts-ignore
        userId = req.user.id;
      }

      // Process the invoice using the shared method
      const { result, userId: resolvedUserId } = await this.processSingleInvoice(req.body, userId);

      const { invoice, operation } = result;

      let message = "";
      let statusCode = 201;

      // Emit WebSocket events for real-time updates
      const wsService = getWebSocketService();
      if (result.operation === "created") wsService.emitInvoiceCreated(result.invoice.userId, result.invoice);
      if (result.operation === "updated") wsService.emitInvoiceUpdated(result.invoice.userId, result.invoice);

      switch (operation) {
        case 'created':
          message = "Invoice created successfully";
          statusCode = 201;
          wsService.emitInvoiceCreated(resolvedUserId, invoice);
          break;
        case 'updated':
          message = "Invoice updated successfully";
          statusCode = 200;
          // Emit invoice updated event
          wsService.emitInvoiceUpdated(resolvedUserId, invoice);
          break;
        case 'no_changes':
          message = "Invoice already exists with same data";
          statusCode = 200;
          break;
        default:
          message = "Invoice processed successfully";
          statusCode = 200;
      }

      return res.status(statusCode).json({
        success: true,
        data: result.invoice,
        operation: result.operation,
        message
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || "Internal server error" });
    }
  }

  async createProject(req: Request, res: Response) {
    try {
      const userId = 1;
      const reqData = req.body;
      if (!reqData.address) {
        return res.status(400).json({
          success: false,
          error: "Address is required",
        });
      }

      const result = await projectsServices.createProjectFromAddress(
        userId,
        reqData.address,
        reqData.vendor_name,
        reqData.postal_code,
        reqData.state,
        reqData.country,
        reqData.city
      );

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }
}



export const processorController = new ProcessorController();
