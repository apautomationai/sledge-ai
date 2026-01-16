import { BadRequestError, NotFoundError, ForbiddenError } from "@/helpers/errors";
import { uploadServices } from "@/services/upload.services";
import { sendAttachmentMessage } from "@/helpers/sqs";
import { attachmentServices } from "@/services/attachment.services";
import { getWebSocketService } from "@/services/websocket.service";
import { uploadBufferToS3 } from "@/helpers/s3upload";
import { Request, Response } from "express";

export class UploadController {
  uploadAttachment = async (req: Request, res: Response) => {
    try {
      // FIX: Changed req.body to req.query to correctly handle GET request parameters.
      const { filename, mimetype } = req.query as {
        filename: string;
        mimetype: string;
      };

      if (!filename || !mimetype) {
        throw new BadRequestError(
          "Filename and mimetype are required query parameters."
        );
      }

      const response = await uploadServices.uploadAttachment(
        filename,
        mimetype
      );

      if (!response.success) {
        return res.status(400).json({
          success: false,
          //@ts-ignore
          error: response.error,
        });
      }

      return res.status(200).json(response.data);
    } catch (error: any) {
      if (error.isOperational) {
        return res.status(error.statusCode || 400).json({
          status: "error",
          message: error.message,
        });
      }
      console.error("UNEXPECTED_ERROR in uploadAttachment:", error);
      // Return a generic error message for unexpected errors
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  };

  createDbRecord = async (req: Request, res: Response) => {
    try {
      //@ts-ignore
      const userId = req.user.id;
      const bodyData = req.body;
      if (!userId) {
        throw new BadRequestError("A valid user ID is required.");
      }

      const attInfo = {
        userId: userId,
        filename: bodyData.filename,
        mimeType: bodyData.mimetype,
        fileUrl: bodyData.fileUrl,
        fileKey: bodyData.fileKey,
      };

      const [response] = await uploadServices.createDbRecord(attInfo);

      // Send SQS message with attachment ID
      if (response && response.id) {
        try {
          await sendAttachmentMessage(response.id);
        } catch (sqsError) {
          // Log SQS error but don't fail the upload
          console.error("Failed to send SQS message for attachment:", response.id, sqsError);
        }
      }

      const result = {
        success: true,
        data: response,
      };
      return res.status(201).send(result);
    } catch (error: any) {
      if (error.isOperational) {
        return res.status(error.statusCode || 400).json({
          success: false,
          message: error.message,
        });
      }
      console.error("UNEXPECTED_ERROR in createDbRecord:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  };

  regenerate = async (req: Request, res: Response) => {
    try {
      //@ts-ignore
      const userId = req.user.id;
      const { attachmentId } = req.body;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      if (!attachmentId) {
        throw new BadRequestError("Attachment ID is required");
      }

      // Validate and parse attachment ID
      const attachmentIdNumber = parseInt(attachmentId, 10);
      if (isNaN(attachmentIdNumber) || attachmentIdNumber <= 0) {
        throw new BadRequestError("Attachment ID must be a valid positive number");
      }

      // Get attachment to verify ownership
      const attachment = await attachmentServices.getAttachmentById(attachmentIdNumber);

      if (!attachment) {
        throw new NotFoundError("Attachment not found");
      }

      if (attachment.userId !== userId) {
        throw new ForbiddenError("Not authorized to regenerate this attachment");
      }

      // Send attachment ID to queue
      const success = await sendAttachmentMessage(attachmentIdNumber);

      if (!success) {
        return res.status(500).json({
          success: false,
          message: "Failed to send attachment to processing queue",
        });
      }

      // Update attachment status to pending (worker will set to "processing" when it starts)
      const updatedAttachment = await attachmentServices.updateAttachment(
        attachmentIdNumber,
        { status: "pending" }
      );

      // Emit WebSocket event for real-time UI update
      const wsService = getWebSocketService();
      wsService.emitAttachmentStatusUpdated(
        userId,
        attachmentIdNumber,
        "pending",
        updatedAttachment
      );

      return res.status(200).json({
        success: true,
        message: "Attachment sent to processing queue successfully",
        data: {
          attachmentId: attachmentIdNumber,
        },
      });
    } catch (error: any) {
      if (error.isOperational) {
        const statusCode = error.statusCode || 400;
        return res.status(statusCode).json({
          success: false,
          message: error.message,
        });
      }
      console.error("UNEXPECTED_ERROR in regenerate:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  uploadProjectImage = async (req: Request, res: Response) => {
    try {
      //@ts-ignore
      const userId = req.user.id;

      if (!userId) {
        throw new BadRequestError("User not authenticated");
      }

      if (!req.file) {
        throw new BadRequestError("No file uploaded");
      }

      const file = req.file;
      const timestamp = Date.now();
      const key = `projects/${userId}/${timestamp}-${file.originalname}`;

      // Upload to S3
      const imageUrl = await uploadBufferToS3(file.buffer, key, file.mimetype);

      return res.status(200).json({
        success: true,
        data: {
          imageUrl,
          key,
        },
      });
    } catch (error: any) {
      if (error.isOperational) {
        const statusCode = error.statusCode || 400;
        return res.status(statusCode).json({
          success: false,
          message: error.message,
        });
      }
      console.error("UNEXPECTED_ERROR in uploadProjectImage:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
}

export const uploadController = new UploadController();
