import { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "@/helpers/errors";
import { vendorsService } from "@/services/vendors.service";

class VendorsController {
    async getVendors(req: Request, res: Response) {
        try {
            //@ts-ignore
            const userId = req.user.id;

            if (!userId) {
                throw new BadRequestError("Need a valid userId");
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = (req.query.search as string) || "";
            const sortBy = (req.query.sortBy as string) || "name";
            const sortOrder = (req.query.sortOrder as "asc" | "desc") || "asc";

            const result = await vendorsService.getVendors({
                userId,
                page,
                limit,
                search,
                sortBy,
                sortOrder,
            });

            return res.status(200).json({
                status: "success",
                data: result,
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                error: error.message || "Failed to get vendors",
            });
        }
    }

    async getVendorById(req: Request, res: Response) {
        try {
            //@ts-ignore
            const userId = req.user.id;
            const vendorId = parseInt(req.params.id);

            if (!userId) {
                throw new BadRequestError("Need a valid userId");
            }

            if (!vendorId || isNaN(vendorId)) {
                throw new BadRequestError("Need a valid vendor ID");
            }

            const vendor = await vendorsService.getVendorById(userId, vendorId);

            if (!vendor) {
                throw new NotFoundError("Vendor not found");
            }

            return res.status(200).json({
                status: "success",
                data: vendor,
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                error: error.message || "Failed to get vendor",
            });
        }
    }

    async updateVendor(req: Request, res: Response) {
        try {
            //@ts-ignore
            const userId = req.user.id;
            const vendorId = parseInt(req.params.id);
            const updateData = req.body;

            if (!userId) {
                throw new BadRequestError("Need a valid userId");
            }

            if (!vendorId || isNaN(vendorId)) {
                throw new BadRequestError("Need a valid vendor ID");
            }

            // Validate that the vendor belongs to the user
            const existingVendor = await vendorsService.getVendorById(userId, vendorId);
            if (!existingVendor) {
                throw new NotFoundError("Vendor not found");
            }

            const updatedVendor = await vendorsService.updateVendor(vendorId, updateData);

            return res.status(200).json({
                status: "success",
                data: updatedVendor,
                message: "Vendor updated successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                error: error.message || "Failed to update vendor",
            });
        }
    }
}

export const vendorsController = new VendorsController();
