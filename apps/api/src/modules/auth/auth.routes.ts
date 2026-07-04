import { Router } from "express";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  enable2faConfirmSchema,
  disable2faSchema,
} from "@muzzap/shared";
import { authController } from "./auth.controller.js";
import { validate } from "../../middlewares/validate.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { authRateLimiter } from "../../middlewares/rate-limit.js";

export const authRouter: Router = Router();

authRouter.post(
  "/register",
  authRateLimiter,
  validate({ body: registerSchema }),
  authController.register,
);
authRouter.post("/login", authRateLimiter, validate({ body: loginSchema }), authController.login);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.post(
  "/verify-email",
  validate({ body: verifyEmailSchema }),
  authController.verifyEmail,
);
authRouter.post(
  "/password-reset/request",
  authRateLimiter,
  validate({ body: requestPasswordResetSchema }),
  authController.requestPasswordReset,
);
authRouter.post(
  "/password-reset/confirm",
  authRateLimiter,
  validate({ body: resetPasswordSchema }),
  authController.resetPassword,
);

authRouter.post("/2fa/init", requireAuth, authController.init2fa);
authRouter.post(
  "/2fa/confirm",
  requireAuth,
  validate({ body: enable2faConfirmSchema }),
  authController.confirm2fa,
);
authRouter.post(
  "/2fa/disable",
  requireAuth,
  validate({ body: disable2faSchema }),
  authController.disable2fa,
);
