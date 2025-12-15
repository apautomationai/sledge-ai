import { Request, Response } from "express";
import { BadRequestError, NotFoundError, ForbiddenError } from "@/helpers/errors";
import { attachmentServices } from "@/services/attachment.services";
import { invoiceServices } from "@/services/invoice.services";
import { projectServices } from "@/services/project.services";
import { getWebSocketService } from "@/services/websocket.service";

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
      return res.status(400).json({ success: false, error: "Invalid attachment ID" });
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

  async createInvoice(req: Request, res: Response) {
    try {
      const invoiceData = req.body;

      if (!invoiceData.attachment_id) {
        return res.status(400).json({ success: false, error: "Attachment ID is required" });
      }

      const result = await invoiceServices.createInvoiceWithLineItems(invoiceData, invoiceData.line_items || []);

      const wsService = getWebSocketService();
      if (result.operation === "created") wsService.emitInvoiceCreated(result.invoice.userId, result.invoice);
      if (result.operation === "updated") wsService.emitInvoiceUpdated(result.invoice.userId, result.invoice);

      return res.status(result.operation === "created" ? 201 : 200).json({
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
