import { v4 as uuid } from "uuid";
import type { RegisterInput, LoginInput } from "@muzzap/shared";
import { authRepository } from "./auth.repository.js";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import { generatePseudonym } from "../../lib/pseudonym.js";
import { generateOpaqueToken, hashToken, encryptSecret, decryptSecret } from "../../lib/crypto.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type AccessTokenPayload,
} from "./jwt.js";
import { generateTotpSecret, buildOtpAuthUrl, generateQrCodeDataUrl, verifyTotpToken } from "./totp.js";
import { emailProvider } from "../../lib/providers/email-provider.js";
import { env } from "../../config/env.js";
import { BadRequestError, ConflictError, UnauthorizedError } from "../../lib/errors.js";
import type { UserDocument } from "../../models/user.model.js";
// Queried directly (not via platform-settings.service.ts) to avoid a module import cycle with auth.
import { PlatformSettingsModel } from "../../models/platform-settings.model.js";

const EMAIL_VERIFICATION_TTL_HOURS = 48;
const PASSWORD_RESET_TTL_MINUTES = 30;

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RequestContext {
  ip: string | undefined;
  userAgent: string | undefined;
}

function toAccessTokenPayload(user: UserDocument): AccessTokenPayload {
  return {
    sub: user._id.toString(),
    roles: user.roles as AccessTokenPayload["roles"],
    capacities: user.capacities as AccessTokenPayload["capacities"],
  };
}

async function issueTokenPair(user: UserDocument, ctx: RequestContext): Promise<TokenPair> {
  const jti = uuid();
  const refreshToken = signRefreshToken({ sub: user._id.toString(), jti });
  const expiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

  user.refreshTokens.push({
    tokenHash: hashToken(refreshToken),
    expiresAt,
    userAgent: ctx.userAgent,
    ip: ctx.ip,
    revokedAt: null,
    replacedByTokenHash: null,
  } as (typeof user.refreshTokens)[number]);

  // Keep only the 10 most recent sessions to bound document growth.
  if (user.refreshTokens.length > 10) {
    user.refreshTokens = user.refreshTokens.slice(-10) as typeof user.refreshTokens;
  }

  await user.save();

  return { accessToken: signAccessToken(toAccessTokenPayload(user)), refreshToken };
}

export const authService = {
  async register(input: RegisterInput, ctx: RequestContext) {
    const settings = await PlatformSettingsModel.findOne({}).select("registrationOpen").exec();
    if (settings?.registrationOpen === false) {
      throw new BadRequestError("Les inscriptions sont temporairement fermées");
    }

    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("Un compte existe déjà avec cet email");
    }

    const passwordHash = await hashPassword(input.password);
    const verificationToken = generateOpaqueToken();

    const user = await authRepository.create({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      pseudonym: generatePseudonym(),
      locale: input.locale,
      emailVerificationTokenHash: hashToken(verificationToken),
      emailVerificationExpiresAt: new Date(
        Date.now() + EMAIL_VERIFICATION_TTL_HOURS * 60 * 60 * 1000,
      ),
    });

    await emailProvider.send({
      to: user.email,
      subject: "Confirmez votre adresse email — MUZZUP",
      templateId: "email-verification",
      variables: {
        fullName: user.fullName,
        verificationUrl: `${env.WEB_URL}/verifier-email?token=${verificationToken}`,
      },
    });

    const tokens = await issueTokenPair(user, ctx);
    return { user, tokens };
  },

  async verifyEmail(token: string) {
    const user = await authRepository.findByEmailVerificationTokenHash(hashToken(token));
    if (!user) {
      throw new BadRequestError("Lien de vérification invalide ou expiré");
    }
    user.emailVerifiedAt = new Date();
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpiresAt = null;
    await user.save();
    return user;
  },

  async login(input: LoginInput, ctx: RequestContext) {
    const user = await authRepository.findByEmail(input.email, true);
    // Constant-shape error to avoid leaking whether the email is registered.
    if (!user) {
      throw new UnauthorizedError("Identifiants invalides");
    }
    if (user.isBanned) {
      throw new UnauthorizedError("Ce compte a été suspendu");
    }

    const passwordValid = await verifyPassword(user.passwordHash, input.password);
    if (!passwordValid) {
      throw new UnauthorizedError("Identifiants invalides");
    }

    if (user.twoFactor.enabled) {
      if (!input.totpCode) {
        return { requiresTotp: true as const };
      }
      const secret = decryptSecret(
        user.twoFactor.secret as unknown as Parameters<typeof decryptSecret>[0],
      );
      if (!verifyTotpToken(input.totpCode, secret)) {
        throw new UnauthorizedError("Code d'authentification invalide");
      }
    }

    user.lastLoginAt = new Date();
    const tokens = await issueTokenPair(user, ctx);
    return { requiresTotp: false as const, user, tokens };
  },

  async refresh(refreshToken: string, ctx: RequestContext) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Session expirée, reconnectez-vous");
    }

    const tokenHash = hashToken(refreshToken);
    const user = await authRepository.findByRefreshTokenHash(tokenHash);
    if (!user || user._id.toString() !== payload.sub) {
      throw new UnauthorizedError("Session invalide");
    }

    const stored = user.refreshTokens.find((rt) => rt.tokenHash === tokenHash);
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      // Reuse of a revoked/expired token is a strong signal of theft: revoke the whole session set.
      user.refreshTokens.forEach((rt) => {
        rt.revokedAt = rt.revokedAt ?? new Date();
      });
      await user.save();
      throw new UnauthorizedError("Session invalide, reconnectez-vous");
    }

    stored.revokedAt = new Date();
    const tokens = await issueTokenPair(user, ctx);
    stored.replacedByTokenHash = hashToken(tokens.refreshToken);
    await user.save();

    return { user, tokens };
  },

  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const user = await authRepository.findByRefreshTokenHash(tokenHash);
    if (!user) return;
    const stored = user.refreshTokens.find((rt) => rt.tokenHash === tokenHash);
    if (stored) stored.revokedAt = new Date();
    await user.save();
  },

  async requestPasswordReset(email: string) {
    const user = await authRepository.findByEmail(email);
    if (!user) return; // Do not reveal whether the account exists.

    const resetToken = generateOpaqueToken();
    user.passwordResetTokenHash = hashToken(resetToken);
    user.passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);
    await user.save();

    await emailProvider.send({
      to: user.email,
      subject: "Réinitialisation de votre mot de passe — MUZZUP",
      templateId: "password-reset",
      variables: {
        fullName: user.fullName,
        resetUrl: `${env.WEB_URL}/reinitialiser-mot-de-passe?token=${resetToken}`,
      },
    });
  },

  async resetPassword(token: string, newPassword: string) {
    const user = await authRepository.findByPasswordResetTokenHash(hashToken(token));
    if (!user) {
      throw new BadRequestError("Lien de réinitialisation invalide ou expiré");
    }
    user.passwordHash = await hashPassword(newPassword);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    // Revoke all active sessions on password change.
    user.refreshTokens.forEach((rt) => {
      rt.revokedAt = rt.revokedAt ?? new Date();
    });
    await user.save();
  },

  async init2fa(userId: string) {
    const user = await authRepository.findById(userId, true);
    if (!user) throw new UnauthorizedError();
    if (user.twoFactor.enabled) {
      throw new ConflictError("La double authentification est déjà activée");
    }

    const secret = generateTotpSecret();
    user.twoFactor.pendingSecret = encryptSecret(secret) as unknown as NonNullable<
      typeof user.twoFactor.pendingSecret
    >;
    await user.save();

    const otpAuthUrl = buildOtpAuthUrl(user.email, secret);
    const qrCodeDataUrl = await generateQrCodeDataUrl(otpAuthUrl);
    return { otpAuthUrl, qrCodeDataUrl };
  },

  async confirm2fa(userId: string, totpCode: string) {
    const user = await authRepository.findById(userId, true);
    if (!user || !user.twoFactor.pendingSecret) {
      throw new BadRequestError("Aucune procédure d'activation 2FA en cours");
    }

    const secret = decryptSecret(
      user.twoFactor.pendingSecret as unknown as Parameters<typeof decryptSecret>[0],
    );
    if (!verifyTotpToken(totpCode, secret)) {
      throw new UnauthorizedError("Code d'authentification invalide");
    }

    user.twoFactor.secret = user.twoFactor.pendingSecret;
    user.twoFactor.pendingSecret = null;
    user.twoFactor.enabled = true;
    await user.save();
  },

  async disable2fa(userId: string, totpCode: string) {
    const user = await authRepository.findById(userId, true);
    if (!user || !user.twoFactor.enabled || !user.twoFactor.secret) {
      throw new BadRequestError("La double authentification n'est pas activée");
    }
    const secret = decryptSecret(
      user.twoFactor.secret as unknown as Parameters<typeof decryptSecret>[0],
    );
    if (!verifyTotpToken(totpCode, secret)) {
      throw new UnauthorizedError("Code d'authentification invalide");
    }
    user.twoFactor.enabled = false;
    user.twoFactor.secret = null;
    await user.save();
  },
};
