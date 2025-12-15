import { Request, Response } from "express";
import { BadRequestError, NotFoundError, ForbiddenError } from "@/helpers/errors";
import { attachmentServices } from "@/services/attachment.services";
import { invoiceServices } from "@/services/invoice.services";
import { projectServices } from "@/services/project.services";
import { getWebSocketService } from "@/services/websocket.service";
import { status } from "@/drizzle/schema";

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

  async getAllProjects(req: Request, res: Response) {
  try {

    // Fetch projects from service
    const { projects, totalCount } = await projectServices.getAllProjects();

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
    // console.log("updateAttachment", attachmentIdNumber, status, updatedData);
    const response = await attachmentServices.updateAttachment(attachmentIdNumber, { status, ...updatedData });

    // Emit WebSocket event for attachment status update
    if (status && response) {
      const wsService = getWebSocketService();
      const userId = response.userId;
      wsService.emitAttachmentStatusUpdated(userId, attachmentIdNumber, status);
    }

    try {
      const { status, ...data } = req.body;
      const updated = await attachmentServices.updateAttachment(attachmentIdNumber, { status, ...data });

      if (status && updated) {
        const wsService = getWebSocketService();
        wsService.emitAttachmentStatusUpdated(updated.userId, attachmentIdNumber, status);
      }

      return res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || "Internal server error" });
    }
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

      const result = await projectServices.createProjectFromAddress(
        userId,
        reqData.address,
        reqData.vendor_name
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
