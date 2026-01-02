import { Request, Response, NextFunction } from "express";
import db from "@/lib/db";
import { usersModel } from "@/models/users.model";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id?: number;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  token?: string;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const r = req as AuthenticatedRequest; // cast here

  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (token) {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!); // ! ensures secret is defined
      const [user] = await db.select().from(usersModel).where(eq(usersModel.id, decoded.id));

      if (!user) return res.status(401).json({ message: "User not found" });

      r.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
      };
      r.token = token;
      return next();
    }

    // OAuth login (Google / Microsoft)
    const oauthEmail = req.cookies.oauthEmail;
    if (oauthEmail) {
      r.user = {
        email: oauthEmail,
        firstName: req.cookies.oauthFirstName,
        lastName: req.cookies.oauthLastName,
      };
      return next();
    }

    // Not logged in
    return res.status(401).json({ message: "Unauthorized" });
  } catch (err) {
    console.error("Auth error", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
