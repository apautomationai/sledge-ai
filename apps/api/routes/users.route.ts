import { userController } from "@/controllers/users.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import {
  loginUserValidator,
  registerUserValidator,
  validate,
} from "@/middlewares/validate";
import {
  loginRateLimiter,
  registerRateLimiter,
  passwordResetRateLimiter,
  emailVerificationRateLimiter,
} from "@/middlewares/rate-limit.middleware";
import { Router } from "express";

const router = Router();

router.get("/", userController.getUsers);
router.post(
  "/register",
  registerRateLimiter,
  validate(registerUserValidator),
  userController.registerUser
);
router.post(
  "/login",
  loginRateLimiter,
  validate(loginUserValidator),
  userController.loginUser
);
router
  .route("/me")
  .get(authenticate, userController.getUserWithId)
  .patch(authenticate, userController.updateUser);
// router.patch("/me", authenticate, userController.updateUser);
router.patch("/reset-password", passwordResetRateLimiter, userController.resetPassword);
router.patch("/change-password", authenticate, userController.changePassword);
router.post("/complete-onboarding", authenticate, userController.completeOnboarding);
router.post("/forgot-password", passwordResetRateLimiter, userController.forgotPassword);
router.post("/verify-email", emailVerificationRateLimiter, userController.verifyEmail);
router.post("/resend-verification-email", emailVerificationRateLimiter, userController.resendVerificationEmail);

export default router;
