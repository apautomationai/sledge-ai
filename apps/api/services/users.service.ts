import db from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/utils/hash";
import { eq, or, InferSelectModel } from "drizzle-orm";
import { usersModel } from "@/models/users.model";
import { signJwt, verifyJwt } from "@/lib/utils/jwt";
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "@/helpers/errors";
import { RegistrationService } from "./registration.service";
import { emailService } from "./email.service";

type User = InferSelectModel<typeof usersModel>;

type UpdateUser = Partial<User>;

export class UserServices {
  registerUser = async ({
    firstName,
    lastName,
    avatar,
    businessName,
    email,
    phone,
    password,
    promoCode,
  }: {
    firstName: string;
    lastName: string;
    avatar: string;
    businessName: string;
    email: string;
    phone: string;
    password: string;
    promoCode?: string;
  }) => {
    if (!firstName || !email || !password) {
      throw new BadRequestError(
        "First name, email, and password are required"
      );
    }

    // Check if email already exists
    const [existingUser] = await db
      .select()
      .from(usersModel)
      .where(eq(usersModel.email, email));

    if (existingUser) {
      throw new ConflictError("Email already in use");
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Insert the new user
    const inserted = await db
      .insert(usersModel)
      //@ts-ignore
      .values({
        firstName,
        lastName,
        avatar,
        businessName,
        email,
        phone,
        passwordHash,
      })
      .returning();

    const createdUser = Array.isArray(inserted) ? inserted[0] : inserted;

    // Assign subscription to user (with error handling to not break registration)
    try {
      await RegistrationService.assignSubscriptionToUser(createdUser.id, undefined, promoCode);
    } catch (subscriptionError: any) {
      // Silently handle subscription assignment errors to not break registration
      // Note: In production, you might want to add this to a retry queue
    }

    // Issue JWT
    const token = signJwt({ sub: createdUser.id, email: createdUser.email });

    return {
      user: {
        id: createdUser.id,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        avatar: createdUser.avatar,
        email: createdUser.email,
        phone: createdUser.phone,
      },
      token,
    };
  };
  getUsers = async () => {
    try {
      const allUsers = await db.select().from(usersModel);

      return allUsers;
    } catch (error) {
      return [];
    }
  };
  getUserWithId = async (userId: number) => {
    try {
      const user = await db
        .select()
        .from(usersModel)
        .where(eq(usersModel.id, userId));
      return user;
    } catch (error: any) {
      throw new BadRequestError(error.message || "No user found");
    }
  };
  updateUser = async (userId: number, userData: UpdateUser) => {
    try {
      const [user] = await db
        .select()
        .from(usersModel)
        .where(eq(usersModel.id, userId));

      if (!user) {
        throw new NotFoundError("User not found");
      }
      const updatedUser = await db
        .update(usersModel)
        .set(userData)
        .where(eq(usersModel.id, userId))
        .returning();
      return updatedUser;
    } catch (error: any) {
      if (error.message) {
        throw new BadRequestError(error.message);
      }
      throw error;
    }
  };

  updateLastLogin = async (email: string) => {
    try {
      const updatedLogin = await db
        .update(usersModel)
        .set({ lastLogin: new Date() })
        .where(eq(usersModel.email, email))
        .returning();
      return updatedLogin;
    } catch (error: any) {
      throw error;
    }
  };

  resetPassword = async (email: string, password: string) => {
    if (!password) {
      throw new BadRequestError("Enter a valid password");
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    try {
      // Update password
      const [updatedUser] = await db
        .update(usersModel)
        .set({ passwordHash })
        .where(eq(usersModel.email, email))
        .returning();

      if (!updatedUser) {
        throw new NotFoundError("User not found");
      }

      // Update last login timestamp
      await this.updateLastLogin(email);

      // Generate JWT token for automatic login
      const token = signJwt({
        sub: updatedUser.id,
        id: updatedUser.id,
        email: updatedUser.email,
      });

      return {
        user: {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          avatar: updatedUser.avatar,
          email: updatedUser.email,
          phone: updatedUser.phone,
        },
        token,
      };
    } catch (error: any) {
      if (error.message.includes("users")) {
        throw new InternalServerError("Users table not found in the database");
      }
      throw new InternalServerError("Unable to reset password");
    }
  };

  changePassword = async (
    userId: number,
    oldPassword: string,
    newPassword: string
  ) => {
    try {
      const [user] = await db
        .select()
        .from(usersModel)
        .where(eq(usersModel.id, userId));

      if (!user) {
        throw new NotFoundError("User not found");
      }
      //@ts-ignore
      const isMatch = await verifyPassword(oldPassword, user.passwordHash);
      if (!isMatch) {
        throw new BadRequestError("Old password is incorrect");
      }
      const hashed = await hashPassword(newPassword);

      // 4. Update password
      const response = await db
        .update(usersModel)
        .set({ passwordHash: hashed })
        .where(eq(usersModel.id, userId));
      return response;
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  };

  findOrCreateGoogleUser = async ({
    googleId,
    email,
    firstName,
    lastName,
    avatar,
  }: {
    googleId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string | null;
  }) => {
    try {
      if (!email || !googleId) {
        throw new BadRequestError("Email and Google ID are required");
      }

      // Check if user exists by providerId or email
      const [existingUser] = await db
        .select()
        .from(usersModel)
        .where(
          or(
            eq(usersModel.providerId, googleId),
            eq(usersModel.email, email)
          )
        )
        .limit(1);

      if (existingUser) {
        // If user exists but doesn't have provider set, update it
        if (!existingUser.provider || existingUser.provider === 'credentials') {
          await db
            .update(usersModel)
            .set({
              provider: 'google',
              providerId: googleId,
              ...(avatar && { avatar }),
            })
            .where(eq(usersModel.id, existingUser.id));

          const [updatedUser] = await db
            .select()
            .from(usersModel)
            .where(eq(usersModel.id, existingUser.id))
            .limit(1);

          return updatedUser || existingUser;
        }
        return existingUser;
      }

      // Create new user
      // For OAuth users, use a placeholder passwordHash since they don't have passwords
      const placeholderPassword = `oauth_${googleId}_${Date.now()}`;
      const passwordHash = await hashPassword(placeholderPassword);

      const [newUser] = await db
        .insert(usersModel)
        .values({
          email,
          firstName: firstName || '',
          lastName: lastName || '',
          avatar: avatar || null,
          provider: 'google',
          providerId: googleId,
          passwordHash,
          isActive: true,
          isBanned: false,
        })
        .returning();

      // Assign subscription to user (with error handling to not break registration)
      try {
        await RegistrationService.assignSubscriptionToUser(newUser.id);
      } catch (subscriptionError: any) {
        // Silently handle subscription assignment errors to not break registration
        // Note: In production, you might want to add this to a retry queue
      }

      return newUser;
    } catch (error: any) {
      throw new BadRequestError(error.message || "Failed to find or create Google user");
    }
  };

  completeOnboarding = async (userId: number) => {
    try {
      const [user] = await db
        .select()
        .from(usersModel)
        .where(eq(usersModel.id, userId));

      if (!user) {
        throw new NotFoundError("User not found");
      }

      const updatedUser = await db
        .update(usersModel)
        .set({ onboardingCompleted: true })
        .where(eq(usersModel.id, userId))
        .returning();

      return updatedUser;
    } catch (error: any) {
      throw new BadRequestError(error.message || "Unable to complete onboarding");
    }
  };

  forgotPassword = async (email: string) => {
      const [user] = await db
        .select()
        .from(usersModel)
        .where(eq(usersModel.email, email));

      if (!user) {
        throw new NotFoundError("User not found");
      }
      
      // Generate reset token with email embedded, expires in 24 hours
      const resetToken = signJwt(
        { email: user.email, type: "password-reset" },
        "24h"
      );

      // Send email with reset password link containing token
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const resetPasswordLink = `${frontendUrl}/reset-password?token=${resetToken}`;
      await emailService.sendPasswordResetEmail(user.email, resetPasswordLink);
      return true;
  };

  verifyResetToken = async (token: string) => {
    try {
      const decodedToken = verifyJwt(token);
      return decodedToken;
    } catch (error) {
      throw new BadRequestError("Invalid token");
    }
  };
}


export const userServices = new UserServices();
