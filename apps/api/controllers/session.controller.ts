import { BadRequestError } from '@/helpers/errors';
import { sessionService } from '@/services/session.service';
import { Request, Response } from 'express';

export class SessionController {

    // create and send the lien waiver to the vendor
    getSession = async (req: Request, res: Response) => {
        try {
            const { token, type } = req.body;
            if (!token) {
                throw new BadRequestError("Token is required");
            }
            if (!type) {
                throw new BadRequestError("Type is required");
            }
            const session = await sessionService.getSession(token, type);
            if (!session) {
                throw new BadRequestError("Invalid or expired token");
            }
            return res.status(200).json({
                success: true,
                data: session,
            });
        }
        catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}

export const sessionController = new SessionController();
