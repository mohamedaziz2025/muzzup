import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { SYSTEM_ROLES, MEMBER_CAPACITIES } from "@muzzap/shared";

const encryptedPayloadSchema = new Schema(
  {
    ciphertext: { type: String, required: true },
    iv: { type: String, required: true },
    authTag: { type: String, required: true },
  },
  { _id: false },
);

const twoFactorSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    secret: { type: encryptedPayloadSchema, default: null, select: false },
    pendingSecret: { type: encryptedPayloadSchema, default: null, select: false },
    recoveryCodeHashes: { type: [String], default: [], select: false },
  },
  { _id: false },
);

const refreshTokenSchema = new Schema(
  {
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    userAgent: { type: String },
    ip: { type: String },
    revokedAt: { type: Date, default: null },
    replacedByTokenHash: { type: String, default: null },
  },
  { _id: true, timestamps: { createdAt: true, updatedAt: false } },
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    pseudonym: { type: String, required: true, unique: true },
    avatarUrl: { type: String, default: null },
    locale: { type: String, enum: ["fr", "en", "ar"], default: "fr" },

    roles: {
      type: [{ type: String, enum: SYSTEM_ROLES }],
      default: ["member"],
    },
    capacities: {
      type: [{ type: String, enum: MEMBER_CAPACITIES }],
      default: [],
    },

    emailVerifiedAt: { type: Date, default: null },
    emailVerificationTokenHash: { type: String, default: null, select: false },
    emailVerificationExpiresAt: { type: Date, default: null },

    passwordResetTokenHash: { type: String, default: null, select: false },
    passwordResetExpiresAt: { type: Date, default: null },

    twoFactor: { type: twoFactorSchema, required: true, default: () => ({}) },

    kycStatus: {
      type: String,
      enum: ["not_started", "pending", "verified", "rejected"],
      default: "not_started",
    },

    stripeCustomerId: { type: String, default: null },

    refreshTokens: { type: [refreshTokenSchema], default: [] },

    isBanned: { type: Boolean, default: false },
    bannedAt: { type: Date, default: null },
    banReason: { type: String, default: null },

    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// email/pseudonym already get a unique index from `unique: true` on the field definitions.
userSchema.index({ roles: 1 });
userSchema.index({ createdAt: -1 });

export type UserDocument = HydratedDocument<InferSchemaType<typeof userSchema>>;

export const UserModel = model("User", userSchema);
