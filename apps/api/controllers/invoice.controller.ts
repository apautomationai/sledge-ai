import { BadRequestError, NotFoundError, ForbiddenError } from "@/helpers/errors";
import { invoiceServices } from "@/services/invoice.services";
import { getWebSocketService } from "@/services/websocket.service";
import { Request, Response } from "express";

class InvoiceController {
  async insertInvoice(req: Request, res: Response) {
    try {
      //@ts-ignore
      const userId = req.user.id;
      const {
        attachmentId,
        invoiceNumber,
        vendorId,
        customerName,
        invoiceDate,
        dueDate,
        totalAmount,
        currency,
        fileUrl,
        description,
      } = req.body;

      if (!invoiceDate || !dueDate) {
        throw new BadRequestError("Invoice date and due date are required");
      }

      const response = await invoiceServices.insertInvoice({
        userId,
        attachmentId,
        invoiceNumber,
        vendorId,
        customerName,
        invoiceDate: new Date(invoiceDate),
        dueDate: new Date(dueDate),
        totalAmount,
        currency,
        fileUrl,
        description,
      });

      return res.status(201).json({
        success: true,
        data: response,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getAllInvoices(req: Request, res: Response) {
    //@ts-ignore
    const userId = req.user.id;
    // const userId = 33;
    try {
      //@ts-ignore
      const userId = req.user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const attachmentId = req.query.attachmentId ? parseInt(req.query.attachmentId as string) : undefined;

      const { invoices, totalCount } = await invoiceServices.getAllInvoices(
        userId,
        page,
        limit,
        attachmentId
      );

      return res.json({
        success: true,
        data: {
          invoices: invoices,
          pagination: {
            totalInvoices: totalCount || 0,
            page,
            limit,
            totalPages: Math.ceil((totalCount || 0) / limit),
          },
        },
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Lightweight endpoint that only returns invoice IDs and statuses
  async getInvoicesList(req: Request, res: Response) {
    try {
      //@ts-ignore
      const userId = req.user.id;
      const attachmentId = req.query.attachmentId ? parseInt(req.query.attachmentId as string) : undefined;

      if (!attachmentId) {
        throw new BadRequestError("Attachment ID is required");
      }

      const invoicesList = await invoiceServices.getInvoicesListByAttachment(userId, attachmentId);

      return res.json({
        success: true,
        data: {
          invoices: invoicesList,
        },
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getDashboardMetrics(req: Request, res: Response) {
    try {
      //@ts-ignore
      const userId = req.user.id;
      const dateRange = (req.query.dateRange as 'monthly' | 'all-time') || 'monthly';

      const dashboardData = await invoiceServices.getDashboardMetrics(userId, dateRange);

      return res.json({
        success: true,
        data: dashboardData,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getInvoiceTrends(req: Request, res: Response) {
    try {
      //@ts-ignore
      const userId = req.user.id;
      const dateRange = (req.query.dateRange as 'monthly' | 'all-time') || 'monthly';

      const trendData = await invoiceServices.getInvoiceTrends(userId, dateRange);

      return res.json({
        success: true,
        data: trendData,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getInvoice(req: Request, res: Response) {
    try {
      // UPDATED: Parse the 'id' from URL parameter into a number
      const invoiceId = parseInt(req.params.id, 10);
      if (isNaN(invoiceId)) {
        throw new BadRequestError("Invoice ID must be a valid number.");
      }

      const response = await invoiceServices.getInvoice(invoiceId);

      return res.json({
        success: true,
        data: response,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateInvoice(req: Request, res: Response) {
    try {
      // UPDATED: Parse the 'id' from URL parameter into a number
      const invoiceId = parseInt(req.params.id, 10);
      if (isNaN(invoiceId)) {
        throw new BadRequestError("Invoice ID must be a valid number.");
      }

      //@ts-ignore
      const invoiceInfo = req.body;

      // delete
      delete invoiceInfo.createdAt;
      delete invoiceInfo.updatedAt;

      invoiceInfo.dueDate = invoiceInfo.dueDate ? new Date(invoiceInfo.dueDate) : null;
      invoiceInfo.invoiceDate = invoiceInfo.invoiceDate ? new Date(invoiceInfo.invoiceDate) : null;

      const response = await invoiceServices.updateInvoice(
        invoiceId,
        invoiceInfo
      );

      // Emit WebSocket event for invoice update
      //@ts-ignore
      const userId = req.user.id;
      const wsService = getWebSocketService();
      wsService.emitInvoiceUpdated(userId, response);

      return res.json({
        success: true,
        data: response,
      });
    } catch (error: any) {
      console.error("Error updating invoice:", error);
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // async extractInvoiceText(req: Request, res: Response) {
  //   try {
  //     if (!req.files || (!req.files.pdf && !req.files.file)) {
  //       return res.json({
  //         success: false,
  //         error:
  //           "PDF file is required. Use 'file' or 'pdf' as the form-data key.",
  //       });
  //     }

  //     const pdfFile = (req.files.pdf || req.files.file) as UploadedFile;
  //     const uploadDir = path.join(__dirname, "../../temp_uploads");

  //     if (!fs.existsSync(uploadDir)) {
  //       fs.mkdirSync(uploadDir);
  //     }

  //     const tempPath = path.join(uploadDir, pdfFile.name);
  //     await pdfFile.mv(tempPath);

  //     const pages = await invoiceServices.getAttachmentTexts(tempPath);

  //     fs.unlinkSync(tempPath);

  //     return res.status(200).json({ success: true, pages });
  //   } catch (err: any) {
  //     console.error("Error extracting invoice text:", err);
  //     return res.status(500).json({ success: false, error: err.message });
  //   }
  // }
  async splitInvoices(req: Request, res: Response) {
    try {
      //@ts-ignore
      const userId = req.user.id;

      const { attachmentId } = req.body;
      if (!attachmentId) {
        throw new BadRequestError("Need an attachment id");
      }

      const result = await invoiceServices.splitInvoicesPdf(
        attachmentId,
        userId
      );

      return res.status(200).json(result);
    } catch (err: any) {
      console.error("Error extracting invoice text:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getAllLineItems(req: Request, res: Response) {
    try {
      //@ts-ignore
      const userId = req.user.id;

      const lineItems = await invoiceServices.getAllLineItems();

      return res.status(200).json({
        success: true,
        data: lineItems,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }



  async getLineItemsByName(req: Request, res: Response) {
    try {
      //@ts-ignore
      const userId = req.user.id;
      const { itemName } = req.query;

      if (!itemName) {
        throw new BadRequestError("Item name is required");
      }

      const lineItems = await invoiceServices.getLineItemsByName(itemName as string);

      return res.status(200).json({
        success: true,
        data: lineItems,
      });
    } catch (error: any) {
      console.error("Error fetching line items:", error);
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getLineItemsByInvoiceId(req: Request, res: Response) {
    try {
      //@ts-ignore
      const userId = req.user.id;
      const { invoiceId } = req.params;

      if (!invoiceId) {
        throw new BadRequestError("Invoice ID is required");
      }

      const lineItems = await invoiceServices.getLineItemsByInvoiceId(parseInt(invoiceId));

      return res.status(200).json({
        success: true,
        data: lineItems,
      });
    } catch (error: any) {
      console.error("Error fetching line items by invoice ID:", error);
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async createLineItem(req: Request, res: Response) {
    try {
      //@ts-ignore
      const userId = req.user.id;
      const { invoiceId, item_name, description, quantity, rate, amount, itemType, resourceId, customerId } = req.body;

      if (!invoiceId) {
        throw new BadRequestError("Invoice ID is required");
      }

      if (!item_name) {
        throw new BadRequestError("Item name is required");
      }

      const lineItemData = {
        invoiceId: parseInt(invoiceId, 10),
        item_name,
        description: description || null,
        quantity: quantity ? String(quantity) : "1",
        rate: rate ? String(rate) : "0",
        amount: amount ? String(amount) : "0",
        itemType: itemType || null,
        resourceId: resourceId || null,
        customerId: customerId || null,
      };

      const newLineItem = await invoiceServices.createLineItem(lineItemData, userId);

      return res.status(201).json({
        success: true,
        data: newLineItem,
      });
    } catch (error: any) {
      console.error("Error creating line item:", error);
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateLineItem(req: Request, res: Response) {
    try {
      //@ts-ignore
      const userId = req.user.id;
      const { id } = req.params;
      const { itemType, resourceId, customerId, quantity, rate, amount, item_name, description } = req.body;

      if (!id) {
        throw new BadRequestError("Line item ID is required");
      }

      const lineItemId = parseInt(id, 10);
      if (isNaN(lineItemId)) {
        throw new BadRequestError("Line item ID must be a valid number");
      }

      // Validate itemType if provided
      if (itemType !== undefined && itemType !== null && itemType !== 'account' && itemType !== 'product') {
        throw new BadRequestError("itemType must be either 'account' or 'product'");
      }

      const updateData: {
        itemType?: 'account' | 'product' | null;
        resourceId?: string | null;
        customerId?: string | null;
        quantity?: string;
        rate?: string;
        amount?: string;
        item_name?: string;
        description?: string;
      } = {};

      if (itemType !== undefined) {
        updateData.itemType = itemType;
      }
      if (resourceId !== undefined) {
        updateData.resourceId = resourceId ? String(resourceId) : null;
      }
      if (customerId !== undefined) {
        updateData.customerId = customerId ? String(customerId) : null;
      }
      if (quantity !== undefined) {
        updateData.quantity = String(quantity);
      }
      if (rate !== undefined) {
        updateData.rate = String(rate);
      }
      if (amount !== undefined) {
        updateData.amount = String(amount);
      }
      if (item_name !== undefined) {
        updateData.item_name = String(item_name);
      }
      if (description !== undefined) {
        updateData.description = String(description);
      }

      const updatedLineItem = await invoiceServices.updateLineItem(lineItemId, updateData);

      return res.status(200).json({
        success: true,
        data: updatedLineItem,
      });
    } catch (error: any) {
      console.error("Error updating line item:", error);
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteLineItem(req: Request, res: Response) {
    try {
      //@ts-ignore
      const userId = req.user.id;
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError("Line item ID is required");
      }

      const lineItemId = parseInt(id, 10);
      if (isNaN(lineItemId)) {
        throw new BadRequestError("Line item ID must be a valid number");
      }

      await invoiceServices.deleteLineItem(lineItemId, userId);

      return res.status(200).json({
        success: true,
        message: "Line item deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting line item:", error);
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async updateInvoiceStatus(req: Request, res: Response) {
    try {
      //@ts-ignore
      const userId = req.user.id;
      const { id } = req.params;
      const { status, rejectionReason, recipientEmail } = req.body;

      if (!id) {
        throw new BadRequestError("Invoice ID is required");
      }

      if (!status) {
        throw new BadRequestError("Status is required");
      }

      const updatedInvoice = await invoiceServices.updateInvoiceStatus(parseInt(id), status, rejectionReason, recipientEmail);

      // Emit WebSocket event for status update
      const wsService = getWebSocketService();
      // wsService.emitInvoiceStatusUpdated(userId, parseInt(id), status, updatedInvoice);
      wsService.emitInvoiceStatusUpdated(userId, parseInt(id), status);

      return res.status(200).json({
        success: true,
        data: updatedInvoice,
      });
    } catch (error: any) {
      console.error("Error updating invoice status:", error);
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async cloneInvoice(req: Request, res: Response) {
    try {
      //@ts-ignore
      const userId = req.user.id;
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError("Invoice ID is required");
      }

      const invoiceId = parseInt(id, 10);
      if (isNaN(invoiceId)) {
        throw new BadRequestError("Invoice ID must be a valid number");
      }

      const clonedInvoice = await invoiceServices.cloneInvoice(invoiceId, userId);

      return res.status(201).json({
        success: true,
        data: clonedInvoice,
        message: "Invoice cloned successfully",
      });
    } catch (error: any) {
      console.error("Error cloning invoice:", error);
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async splitInvoice(req: Request, res: Response) {
    try {
      //@ts-ignore
      const userId = req.user.id;
      const { id } = req.params;
      const { lineItemIds } = req.body;

      if (!id) {
        throw new BadRequestError("Invoice ID is required");
      }

      if (!lineItemIds || !Array.isArray(lineItemIds) || lineItemIds.length === 0) {
        throw new BadRequestError("Line item IDs are required");
      }

      const invoiceId = parseInt(id, 10);
      if (isNaN(invoiceId)) {
        throw new BadRequestError("Invoice ID must be a valid number");
      }

      const splitInvoice = await invoiceServices.splitInvoice(invoiceId, userId, lineItemIds);

      return res.status(201).json({
        success: true,
        data: splitInvoice,
        message: "Invoice split successfully",
      });
    } catch (error: any) {
      console.error("Error splitting invoice:", error);
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteInvoice(req: Request, res: Response) {
    try {
      //@ts-ignore
      const userId = req.user.id;

      // Validate user ID
      if (!userId) {
        throw new BadRequestError("User ID is required");
      }

      // Validate and parse invoice ID
      const invoiceId = parseInt(req.params.id, 10);
      if (isNaN(invoiceId) || invoiceId <= 0) {
        throw new BadRequestError("Invoice ID must be a valid positive number");
      }

      // Get invoice to verify ownership
      const invoice = await invoiceServices.getInvoice(invoiceId);

      if (!invoice) {
        throw new NotFoundError("Invoice not found");
      }

      if (invoice.userId !== userId) {
        throw new ForbiddenError("Not authorized to delete this invoice");
      }

      // Soft delete the invoice
      await invoiceServices.softDeleteInvoice(invoiceId);

      return res.status(200).json({
        success: true,
        message: "Invoice deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting invoice:", error);

      // Return appropriate status code based on error type
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }
}
export const invoiceController = new InvoiceController();
