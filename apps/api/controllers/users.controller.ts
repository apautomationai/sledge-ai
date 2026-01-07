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
      } = req.body;

      const result = await userServices.registerUser({
        firstName,
        lastName,
        avatar,
        businessName,
        email,
        phone,
        password,
      });

      // Generate JWT token for automatic login
      const token = signJwt({
        sub: result.user.id,
        id: result.user.id,
        email: result.user.email,
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

      // Send welcome email (non-blocking)
      const ctaLink = `${process.env.FRONTEND_URL || "https://app.getsledge.com"}/onboarding`;
      emailService.sendWelcomeEmail({
        to: result.user.email,
        firstName: result.user.firstName,
        ctaLink,
      }).catch((err) => {
        console.error("Failed to send welcome email:", err);
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
            .json({ message: info?.message || "Unauthorized" });

        const token = signJwt({
          sub: (user as any).id,
          id: (user as any).id,
          email: (user as any).email,
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
      const result = {
        status: "success",
        data: {
          message: "Onboarding completed successfully",
        },
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
}

export const userController = new UserController();
