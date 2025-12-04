import { userController } from "@/controllers/users.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import {
  loginUserValidator,
  registerUserValidator,
  validate,
} from "@/middlewares/validate";
import { Router } from "express";

const router = Router();

router.get("/", userController.getUsers);
router.post(
  "/register",
  validate(registerUserValidator),
  userController.registerUser
);
router.post("/login", validate(loginUserValidator), userController.loginUser);
router
  .route("/me")
  .get(authenticate, userController.getUserWithId)
  .patch(authenticate, userController.updateUser);
// router.patch("/me", authenticate, userController.updateUser);
router.patch("/reset-password", userController.resetPassword);
router.patch("/change-password", authenticate, userController.changePassword);
router.post("/complete-onboarding", authenticate, userController.completeOnboarding);
router.post("/forgot-password", userController.forgotPassword);

export default router;
