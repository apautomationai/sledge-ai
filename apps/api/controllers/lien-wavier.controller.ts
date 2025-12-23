import { BadRequestError } from '@/helpers/errors';
import { lienWaiverService } from '@/services/lien-wavier.service';
import { sessionService } from '@/services/session.service';
import { Request, Response } from 'express';

export class LienWaiverController {

    // get all lien waivers
    getAllLienWaivers = async (req: Request, res: Response) => {
        try {
            //@ts-ignore
            const userId = req.user.id;

            if (!userId) {
                throw new BadRequestError("Need a valid userId");
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = (req.query.search as string) || "";
            const status = (req.query.status as string) || "";
            const startDate = (req.query.startDate as string) || "";
            const endDate = (req.query.endDate as string) || "";
            const sortBy = (req.query.sortBy as string) || "createdAt";
            const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

            const lienWaivers = await lienWaiverService.getAllLienWaivers({
                userId,
                page,
                limit,
                search,
                status,
                startDate,
                endDate,
                sortBy,
                sortOrder,
            });
            return res.status(200).json({
                success: true,
                data: lienWaivers,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    // upload the lien waiver to the s3 bucket
    uploadLienWaiver = async (req: Request, res: Response) => {
        try {
            const { token } = req.body;
            if (!token) {
                throw new BadRequestError("Token is required");
            }
            const session = await sessionService.getSession(token, "lien-waiver");
            if (!session) {
                throw new BadRequestError("Invalid or expired token");
            }

            // upload the lien waiver to the s3 bucket
            // const lienWaiver = await lienWaiverService.uploadLienWaiver(session.data.lienWaiverId);

            return res.status(200).json({
                success: true,
                data: {
                    message: "Lien waiver uploaded successfully",
                },
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}

export const lienWaiverController = new LienWaiverController();
