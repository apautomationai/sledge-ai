import { Request, Response, NextFunction } from "express";
import passport from "@/lib/passport";
import { signJwt } from "@/lib/utils/jwt";
import { userServices } from "@/services/users.service";

export class AuthController {
  // Initiate Google OAuth flow
  googleAuth = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    })(req, res, next);
  };

  // Handle Google OAuth callback
  googleCallback = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "google",
      { session: false },
      async (err: any, user: any, info: any) => {
        if (err) {
          const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
          return res.redirect(
            `${frontendUrl}/auth/callback?error=${encodeURIComponent(err.message || "Authentication failed")}`
          );
        }

        if (!user) {
          const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
          return res.redirect(
            `${frontendUrl}/auth/callback?error=${encodeURIComponent(info?.message || "Authentication failed")}`
          );
        }

        try {
          // Fetch full user data to get is_verified status
          const [fullUser] = await userServices.getUserWithId(user.id);

          // Generate JWT token with is_verified and onboarding_completed flags
          const token = signJwt({
            sub: user.id,
            id: user.id,
            email: user.email,
            is_verified: fullUser?.isVerified || false,
            onboarding_completed: fullUser?.onboardingCompleted || false,
          });

          // Update last login
          await userServices.updateLastLogin(user.email);

          // Set cookies
          res.cookie("token", token, {
            // httpOnly: true, // Commented for frontend access, enable in production
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            path: "/",
          });

          res.cookie("userId", user.id, {
            // httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            path: "/",
          });

          // Redirect to frontend with token
          const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
          return res.redirect(
            `${frontendUrl}/auth/callback?token=${token}&userId=${user.id}`
          );
        } catch (error: any) {
          const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
          return res.redirect(
            `${frontendUrl}/auth/callback?error=${encodeURIComponent(error.message || "Failed to create session")}`
          );
        }
      }
    )(req, res, next);
  };

  microsoftAuth = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("microsoft", {
      scope: ["User.Read"],
      session: false,
    })(req, res, next);
  };

  microsoftCallback = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("microsoft", { session: false },
      async (err: any, user: any, info: any) => {
          if (err) {
          const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
          return res.redirect(
            `${frontendUrl}/auth/callback?error=${encodeURIComponent(err.message || "Authentication failed")}`
          );
        }

        if (!user) {
          const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
          return res.redirect(
            `${frontendUrl}/auth/callback?error=${encodeURIComponent(info?.message || "Authentication failed")}`
          );
        }

        try {
          // Fetch full user data to get is_verified status
          const [fullUser] = await userServices.getUserWithId(user.id);

          // Generate JWT token with is_verified and onboarding_completed flags
          const token = signJwt({
            sub: user.id,
            id: user.id,
            email: user.email,
            is_verified: fullUser?.isVerified || false,
            onboarding_completed: fullUser?.onboardingCompleted || false,
          });

          // Update last login
          await userServices.updateLastLogin(user.email);

          // Set cookies
          res.cookie("token", token, {
            // httpOnly: true, // Commented for frontend access, enable in production
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            path: "/",
          });

          res.cookie("userId", user.id, {
            // httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            path: "/",
          });

          // Redirect to frontend with token
          const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
          return res.redirect(
            `${frontendUrl}/auth/callback?token=${token}&userId=${user.id}`
          );
        } catch (error: any) {
          const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
          return res.redirect(
            `${frontendUrl}/auth/callback?error=${encodeURIComponent(error.message || "Failed to create session")}`
          );
        }
      }
    )(req, res, next);
  };
}

export const authController = new AuthController();

