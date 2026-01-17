import { signJwt } from "@/lib/utils/jwt";
import { userServices } from "@/services/users.service";
import { emailService } from "@/services/email.service";

import { NextFunction, Request, Response } from "express";
import passport from "@/lib/passport";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "@/helpers/errors";

export class UserController {
  registerUser = async (req: Request, res: Response) => {
    try {
      const {
        firstName,
        lastName,
        avatar,
        businessName,
        email,
        phone,
        password,
        promoCode,
      } = req.body;

      const result = await userServices.registerUser({
        firstName,
        lastName,
        avatar,
        businessName,
        email,
        phone,
        password,
        promoCode,
      });

      // Generate JWT token for automatic login (note: user is not verified yet for credentials signup)
      const token = signJwt({
        sub: result.user.id,
        id: result.user.id,
        email: result.user.email,
        is_verified: false, // Credential signups start as unverified
      });

      // Set cookies for automatic login (same as login endpoint)
      res.cookie("token", token, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        path: "/",
      });

      res.cookie("userId", result.user.id, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        path: "/",
      });

      // Send verification email (non-blocking)
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const verificationLink = `${frontendUrl}/verify-email?token=${result.verificationToken}`;
      emailService.sendVerificationEmail({
        to: result.user.email,
        firstName: result.user.firstName,
        verificationLink,
      }).catch((err) => {
        console.error("Failed to send verification email:", err);
      });

      return res.status(200).json({
        success: true,
        data: result,
        token, // Include token in response for frontend
        user: result.user,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      throw new InternalServerError(
        err.message || "Unable to connect to the server"
      );
    }
  };

  loginUser = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      { session: false },
      async (err: any, user: any, info: any) => {
        if (err) {
          // Catch DB "relation does not exist" error
          if (err.message.includes("users")) {
            return res.status(500).json({
              success: false,
              error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Users table not found in the database",
              },
            });
          }
          return next(err);
        }
        if (!user)
          return res
            .status(401)
            .json({
              message: info?.message || "Unauthorized",
              ...(info?.requiresEmailVerification && {
                requiresEmailVerification: true,
                email: info.email
              })
            });

        // Fetch full user data to get is_verified status
        const [fullUser] = await userServices.getUserWithId((user as any).id);

        const token = signJwt({
          sub: (user as any).id,
          id: (user as any).id,
          email: (user as any).email,
          is_verified: fullUser?.isVerified || false,
          onboarding_completed: fullUser?.onboardingCompleted || false,
        });
        if (token) {
          await userServices.updateLastLogin(user.email);
        }

        res.cookie("token", token, {
          // httpOnly: true, // prevents JavaScript access
          secure: process.env.NODE_ENV === "production", // only sent over HTTPS in production
          sameSite: "none", // controls cross-site behavior
          maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
          path: "/", // cookie is valid across all routes
        });

        res.cookie("userId", (user as any).id, {
          // httpOnly: true, // prevents JavaScript access
          secure: process.env.NODE_ENV === "production", // only sent over HTTPS in production
          sameSite: "none", // controls cross-site behavior
          maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
          path: "/", // cookie is valid across all routes
        });

        return res.json({ user, token });
      }
    )(req, res, next);
  };

  //@ts-ignore
  getUsers = async (req: Request, res: Response) => {
    try {
      const allUsers = await userServices.getUsers();
      const result = {
        success: "success",
        data: allUsers,
      };

      return res.status(200).send(result);
    } catch (error: any) {
      return new InternalServerError(
        error.message || "Unable to connect to the server"
      );
    }
  };
  getUserWithId = async (req: Request, res: Response) => {
    //@ts-ignore
    const userId = req.user.id;
    if (!userId) {
      throw new BadRequestError("Need a valid user id");
    }
    try {
      const response = await userServices.getUserWithId(userId);
      if (response.length === 0) {
        throw new NotFoundError("No user found");
      }
      const result = {
        success: "success",
        data: response[0],
      };
      return res.status(200).send(result);
    } catch (error: any) {
      throw new BadRequestError(error.message || "Unable to get user");
    }
  };
  updateUser = async (req: Request, res: Response) => {
    //@ts-ignore
    const userId = req.user.id;
    // const { email } = req.body;
    const userData = req.body;

    if (!userId) {
      throw new BadRequestError("Email is required");
    }

    try {
      const updatedUser = await userServices.updateUser(userId, userData);

      if (updatedUser) {
        const result = {
          success: "success",
          data: updatedUser[0],
        };
        return res.status(200).send(result);
      }
      throw new BadRequestError("User has not updated");
    } catch (err: any) {
      throw new InternalServerError(
        err.message || "Unable to connect the server"
      );
    }
  };
  resetPassword = async (req: Request, res: Response) => {
    const { password, confirmPassword, resetToken } = req.body;
    // const password = req.body;
    let decodedToken: any;

    // Verify reset token
    try {
      decodedToken = await userServices.verifyResetToken(resetToken);
    } catch (error) {
      throw new BadRequestError("Link has been expired");
    }

    // Validate password and confirm password
    if (!password || !confirmPassword) {
      throw new BadRequestError("Password and confirm password are required");
    }
    if (password?.length < 6 || confirmPassword?.length < 6) {
      throw new BadRequestError("Password must be at least 6 characters");
    }
    if (password !== confirmPassword) {
      throw new BadRequestError("Password and confirm password do not match");
    }

    // user email
    const userEmail = decodedToken?.email;

    // Reset password and get user data with token (all handled in service)
    const result = await userServices.resetPassword(userEmail, password);

    // Set cookies for authentication
    res.cookie("token", result.token, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: "/",
    });

    res.cookie("userId", result.user.id.toString(), {
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: "/",
    });

    // Return success response with token and user data
    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
      token: result.token,
      user: result.user,
    });

  };
  changePassword = async (req: Request, res: Response) => {
    //@ts-ignore
    const userId = req.user.id;
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;
      if (!oldPassword || !newPassword || !confirmPassword) {
        throw new BadRequestError(
          "Old password, new password, confirm password are required"
        );
      }
      if (newPassword !== confirmPassword) {
        throw new BadRequestError(
          "new password should match the confirm password"
        );
      }
      const response = await userServices.changePassword(
        userId,
        oldPassword,
        newPassword
      );
      if (!response) {
        throw new BadRequestError("Password has not change");
      }
      const result = {
        status: "success",
        data: {
          message: "Password changed successfully",
        },
      };
      return res.status(200).send(result);
    } catch (error: any) {
      throw new BadRequestError(error.message || "Unable to change password");
    }
  };

  completeOnboarding = async (req: Request, res: Response) => {
    //@ts-ignore
    const userId = req.user.id;
    try {
      const response = await userServices.completeOnboarding(userId);
      if (!response) {
        throw new BadRequestError("Unable to complete onboarding");
      }

      // Set new JWT token with updated onboarding_completed flag
      res.cookie("token", response.token, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        path: "/",
      });

      const result = {
        status: "success",
        data: {
          message: "Onboarding completed successfully",
        },
        token: response.token,
      };
      return res.status(200).send(result);
    } catch (error: any) {
      throw new BadRequestError(error.message || "Unable to complete onboarding");
    }
  };

  forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      throw new BadRequestError("Email is required");
    }

    try {
      const response = await userServices.forgotPassword(email);
      if (!response) {
        throw new BadRequestError("Unable to send password reset link");
      }
      return res.status(200).json({
        success: true,
        message: "Password reset link sent to email",
        data: response,
      });
    } catch (error: any) {
      throw new BadRequestError(error.message || "Unable to send password reset link");
    }
  };

  verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.body;
    if (!token) {
      throw new BadRequestError("Verification token is required");
    }

    try {
      const result = await userServices.verifyEmail(token);

      // Set cookies for automatic login
      res.cookie("token", result.token, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        path: "/",
      });

      res.cookie("userId", result.user.id.toString(), {
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        path: "/",
      });

      return res.status(200).json({
        success: true,
        message: "Email verified successfully",
        token: result.token,
        user: result.user,
      });
    } catch (error: any) {
      throw new BadRequestError(error.message || "Unable to verify email");
    }
  };

  checkResendCooldown = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      throw new BadRequestError("Email is required");
    }

    try {
      const result = await userServices.checkResendCooldown(email);

      return res.status(200).json({
        success: true,
        canResend: result.canResend,
        remainingSeconds: result.remainingSeconds,
        isVerified: result.isVerified || false,
      });
    } catch (error: any) {
      throw new BadRequestError(error.message || "Unable to check cooldown status");
    }
  };

  resendVerificationEmail = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      throw new BadRequestError("Email is required");
    }

    try {
      const result = await userServices.resendVerificationEmail(email);

      return res.status(200).json({
        success: true,
        message: result.message,
        remainingSeconds: result.remainingSeconds,
      });
    } catch (error: any) {
      // Check if it's a rate limit error with remaining seconds
      const secondsMatch = error.message?.match(/wait (\d+) seconds/);
      if (secondsMatch) {
        const remainingSeconds = parseInt(secondsMatch[1], 10);
        return res.status(429).json({
          success: false,
          message: error.message,
          remainingSeconds,
        });
      }
      throw new BadRequestError(error.message || "Unable to resend verification email");
    }
  };
}

export const userController = new UserController();
