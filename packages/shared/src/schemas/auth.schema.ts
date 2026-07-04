import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(12, "Le mot de passe doit contenir au moins 12 caractères")
  .max(128)
  .regex(/[a-z]/, "Le mot de passe doit contenir une minuscule")
  .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre")
  .regex(/[^a-zA-Z0-9]/, "Le mot de passe doit contenir un caractère spécial");

export const emailSchema = z.string().trim().toLowerCase().email("Email invalide");

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().trim().min(2).max(120),
  locale: z.enum(["fr", "en", "ar"]).default("fr"),
  acceptedTermsAt: z.coerce.date(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Mot de passe requis"),
  totpCode: z
    .string()
    .regex(/^\d{6}$/)
    .optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(20).optional(),
});
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(20),
});
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  newPassword: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const enable2faInitSchema = z.object({});

export const enable2faConfirmSchema = z.object({
  totpCode: z.string().regex(/^\d{6}$/, "Code à 6 chiffres requis"),
});
export type Enable2faConfirmInput = z.infer<typeof enable2faConfirmSchema>;

export const disable2faSchema = z.object({
  totpCode: z.string().regex(/^\d{6}$/, "Code à 6 chiffres requis"),
});
export type Disable2faInput = z.infer<typeof disable2faSchema>;
