import type { Request, Response } from "express";
import type {
  RegisterInput,
  LoginInput,
  VerifyEmailInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
  Enable2faConfirmInput,
  Disable2faInput,
} from "@muzzap/shared";
import { authService } from "./auth.service.js";
import { toUserPublic } from "../users/users.mapper.js";
import { setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE_NAME } from "../../lib/cookies.js";
import { UnauthorizedError } from "../../lib/errors.js";

function requestContext(req: Request) {
  return { ip: req.ip, userAgent: req.get("user-agent") ?? undefined };
}

export const authController = {
  async register(req: Request, res: Response) {
    const { user, tokens } = await authService.register(
      req.body as RegisterInput,
      requestContext(req),
    );
    setRefreshCookie(res, tokens.refreshToken);
    res.status(201).json({
      success: true,
      data: { user: toUserPublic(user), accessToken: tokens.accessToken },
    });
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body as LoginInput, requestContext(req));
    if (result.requiresTotp) {
      res.status(200).json({ success: true, data: { requiresTotp: true } });
      return;
    }
    setRefreshCookie(res, result.tokens.refreshToken);
    res.status(200).json({
      success: true,
      data: { user: toUserPublic(result.user), accessToken: result.tokens.accessToken },
    });
  },

  async refresh(req: Request, res: Response) {
    const token = (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE_NAME];
    if (!token) throw new UnauthorizedError("Aucune session active");
    const { user, tokens } = await authService.refresh(token, requestContext(req));
    setRefreshCookie(res, tokens.refreshToken);
    res.status(200).json({
      success: true,
      data: { user: toUserPublic(user), accessToken: tokens.accessToken },
    });
  },

  async logout(req: Request, res: Response) {
    const token = (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE_NAME];
    if (token) await authService.logout(token);
    clearRefreshCookie(res);
    res.status(204).send();
  },

  async verifyEmail(req: Request, res: Response) {
    const { token } = req.body as VerifyEmailInput;
    const user = await authService.verifyEmail(token);
    res.status(200).json({ success: true, data: { user: toUserPublic(user) } });
  },

  async requestPasswordReset(req: Request, res: Response) {
    const { email } = req.body as RequestPasswordResetInput;
    await authService.requestPasswordReset(email);
    res.status(202).json({
      success: true,
      data: { message: "Si ce compte existe, un email a été envoyé" },
    });
  },

  async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body as ResetPasswordInput;
    await authService.resetPassword(token, newPassword);
    res.status(200).json({ success: true, data: { message: "Mot de passe réinitialisé" } });
  },

  async init2fa(req: Request, res: Response) {
    const data = await authService.init2fa(req.auth!.userId);
    res.status(200).json({ success: true, data });
  },

  async confirm2fa(req: Request, res: Response) {
    const { totpCode } = req.body as Enable2faConfirmInput;
    await authService.confirm2fa(req.auth!.userId, totpCode);
    res.status(200).json({ success: true, data: { message: "2FA activée" } });
  },

  async disable2fa(req: Request, res: Response) {
    const { totpCode } = req.body as Disable2faInput;
    await authService.disable2fa(req.auth!.userId, totpCode);
    res.status(200).json({ success: true, data: { message: "2FA désactivée" } });
  },
};
