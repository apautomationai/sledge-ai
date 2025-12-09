import { BadRequestError, NotFoundError, ForbiddenError } from "@/helpers/errors";
import { attachmentServices } from "@/services/attachment.services";
import { invoiceServices } from "@/services/invoice.services";
import { getWebSocketService } from "@/services/websocket.service";
import { Request, Response } from "express";

// import fs from 'fs';

class ProcessorController {
  async getAttachmentInfo(req: Request, res: Response) {
    const { attachmentId } = req.params;

    const attachmentIdNumber = parseInt(attachmentId);
    if (isNaN(attachmentIdNumber)) {
      throw new BadRequestError("Invalid attachment ID");
    }
    try {
      const response = await attachmentServices.getAttachmentById(attachmentIdNumber);
      if (!response) {
        throw new NotFoundError("Attachment not found");
      }
      return res.status(201).json({
        success: true,
        data: response,
      });
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateAttachment(req: Request, res: Response) {
    const { attachmentId } = req.params;
    const { status, ...updatedData } = req.body;
    const attachmentIdNumber = parseInt(attachmentId);
    if (isNaN(attachmentIdNumber)) {
      throw new BadRequestError("Invalid attachment ID");
    }
    // console.log("updateAttachment", attachmentIdNumber, status, updatedData);
    const response = await attachmentServices.updateAttachment(attachmentIdNumber, { status, ...updatedData });

    // Emit WebSocket event for attachment status update
    if (status && response) {
      const wsService = getWebSocketService();
      const userId = response.userId;
      wsService.emitAttachmentStatusUpdated(userId, attachmentIdNumber, status);
    }

    return res.status(200).json({
      success: true,
      data: response,
    });
  }

  private async processSingleInvoice(invoiceData: any, userId: number | null = null) {
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
      vendorName: vendor_name,
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
    // This method implements upsert logic:
    // - If invoice with same invoice_number and attachment_id exists, update it if data differs
    // - Line items are always added to the invoice (existing or new)
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
        data: invoice,
        operation,
        message,
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

      // Process each invoice and collect results
      const results: any[] = [];
      const wsService = getWebSocketService();

      for (const invoice of invoices) {
        try {
          // Process the invoice
          const { result, userId: resolvedUserId } = await self.processSingleInvoice(invoice, userId);
          const { invoice: createdInvoice, operation } = result;

          // Emit WebSocket events for real-time updates
          switch (operation) {
            case 'created':
              wsService.emitInvoiceCreated(resolvedUserId, createdInvoice);
              break;
            case 'updated':
              wsService.emitInvoiceUpdated(resolvedUserId, createdInvoice);
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

  async deleteAttachment(req: Request, res: Response) {
    try {
      //@ts-ignore
      const userId = req.user.id;

      // Validate user ID
      if (!userId) {
        throw new BadRequestError("User ID is required");
      }

      // Validate and parse attachment ID
      const attachmentId = parseInt(req.params.id, 10);
      if (isNaN(attachmentId) || attachmentId <= 0) {
        throw new BadRequestError("Attachment ID must be a valid positive number");
      }

      // Get attachment to verify ownership
      const attachment = await attachmentServices.getAttachmentById(attachmentId);

      if (!attachment) {
        throw new NotFoundError("Attachment not found");
      }

      if (attachment.userId !== userId) {
        throw new ForbiddenError("Not authorized to delete this attachment");
      }

      // Check for associated invoice
      const associatedInvoice = await attachmentServices.getAssociatedInvoice(attachmentId);

      // Soft delete attachment
      await attachmentServices.softDeleteAttachment(attachmentId);

      // Cascade delete invoice if exists
      if (associatedInvoice) {
        await invoiceServices.softDeleteInvoice(associatedInvoice.id);
      }

      return res.status(200).json({
        success: true,
        message: "Attachment deleted successfully",
        deletedInvoice: associatedInvoice ? {
          id: associatedInvoice.id,
          invoiceNumber: associatedInvoice.invoiceNumber,
          vendorName: associatedInvoice.vendorName,
        } : null,
      });
    } catch (error: any) {
      console.error("Error deleting attachment:", error);

      // Return appropriate status code based on error type
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

}
export const processorController = new ProcessorController();
