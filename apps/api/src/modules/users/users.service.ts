import { randomUUID } from "node:crypto";
import { UserModel } from "../../models/user.model.js";
import { AuditLogModel } from "../../models/audit-log.model.js";
import { verifyPassword, hashPassword } from "../../lib/password.js";
import { storageProvider } from "../../lib/providers/storage-provider.js";
import { env } from "../../config/env.js";
import { NotFoundError, UnauthorizedError, BadRequestError } from "../../lib/errors.js";
import type { UpdateProfileInput } from "@muzzap/shared";

const ALLOWED_AVATAR_MIME_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export const usersService = {
  async getById(userId: string) {
    const user = await UserModel.findById(userId).exec();
    if (!user) throw new NotFoundError("Utilisateur introuvable");
    return user;
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await UserModel.findById(userId).exec();
    if (!user) throw new NotFoundError("Utilisateur introuvable");
    if (input.fullName) user.fullName = input.fullName;
    if (input.locale) user.locale = input.locale;
    if (input.capacities) user.capacities = input.capacities;
    await user.save();
    return user;
  },

  async updateAvatar(userId: string, file: { buffer: Buffer; mimetype: string }) {
    const extension = ALLOWED_AVATAR_MIME_TYPES[file.mimetype];
    if (!extension) throw new BadRequestError("Format d'image non supporté (PNG, JPEG ou WebP requis)");

    const user = await UserModel.findById(userId).exec();
    if (!user) throw new NotFoundError("Utilisateur introuvable");

    const storageKey = `avatars/${userId}-${Date.now()}.${extension}`;
    await storageProvider.putObject(storageKey, file.buffer, file.mimetype);

    user.avatarUrl = `${env.API_URL}/uploads/${storageKey}`;
    await user.save();
    return user;
  },

  /** RGPD: full personal-data export for the requesting user. */
  async exportPersonalData(userId: string) {
    const user = await UserModel.findById(userId).exec();
    if (!user) throw new NotFoundError("Utilisateur introuvable");
    await AuditLogModel.create({
      actorId: user._id,
      action: "user.data_export",
      targetType: "User",
      targetId: user._id,
    });
    return {
      email: user.email,
      fullName: user.fullName,
      pseudonym: user.pseudonym,
      locale: user.locale,
      roles: user.roles,
      capacities: user.capacities,
      kycStatus: user.kycStatus,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  },

  /** RGPD: account deletion after password confirmation. Anonymizes rather than hard-deletes to preserve transaction integrity. */
  async deleteAccount(userId: string, password: string) {
    const user = await UserModel.findById(userId).select("+passwordHash").exec();
    if (!user) throw new NotFoundError("Utilisateur introuvable");
    const valid = await verifyPassword(user.passwordHash, password);
    if (!valid) throw new UnauthorizedError("Mot de passe incorrect");

    user.email = `deleted-${user._id.toString()}@muzzap.invalid`;
    user.fullName = "Compte supprimé";
    user.passwordHash = await hashPassword(randomUUID());
    user.avatarUrl = null;
    user.isBanned = true;
    user.banReason = "Suppression de compte à la demande de l'utilisateur (RGPD)";
    user.refreshTokens.splice(0, user.refreshTokens.length);
    await user.save();

    await AuditLogModel.create({
      actorId: user._id,
      action: "user.account_deleted",
      targetType: "User",
      targetId: user._id,
    });
  },
};
