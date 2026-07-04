import { UserModel, type UserDocument } from "../../models/user.model.js";

export const authRepository = {
  findByEmail(email: string, withSecrets = false) {
    const query = UserModel.findOne({ email: email.toLowerCase() });
    if (withSecrets) {
      query.select(
        "+passwordHash +twoFactor.secret +twoFactor.pendingSecret +twoFactor.recoveryCodeHashes",
      );
    }
    return query.exec();
  },

  findById(id: string, withSecrets = false) {
    const query = UserModel.findById(id);
    if (withSecrets) {
      query.select(
        "+passwordHash +twoFactor.secret +twoFactor.pendingSecret +twoFactor.recoveryCodeHashes",
      );
    }
    return query.exec();
  },

  findByEmailVerificationTokenHash(tokenHash: string) {
    return UserModel.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: { $gt: new Date() },
    }).exec();
  },

  findByPasswordResetTokenHash(tokenHash: string) {
    return UserModel.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    })
      .select("+passwordHash")
      .exec();
  },

  async create(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    pseudonym: string;
    locale: "fr" | "en" | "ar";
    emailVerificationTokenHash: string;
    emailVerificationExpiresAt: Date;
  }): Promise<UserDocument> {
    return UserModel.create(data);
  },

  findByRefreshTokenHash(tokenHash: string) {
    return UserModel.findOne({ "refreshTokens.tokenHash": tokenHash }).exec();
  },
};
