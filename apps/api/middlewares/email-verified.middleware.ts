import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "@/lib/utils/jwt";
import { UnauthorizedError } from "@/helpers/errors";

/**
 * Middleware to check if user's email is verified
 * Should be used after the authenticate middleware
 */
export const requireEmailVerification = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from cookie or Authorization header
    const token =
      req.cookies?.token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }

    // Verify and decode the JWT token
    const decoded = verifyJwt(token);

    // Check if user is verified
    if (!(decoded as any).is_verified) {
      return res.status(403).json({
        success: false,
        error: {
          code: "EMAIL_NOT_VERIFIED",
          message: "Please verify your email address to access this resource",
        },
      });
    }

    // User is verified, continue to next middleware
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      },
    });
  }
};
