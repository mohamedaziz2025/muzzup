import { z } from "zod";
import { SYSTEM_ROLES, MEMBER_CAPACITIES } from "../constants/roles.js";

export const userPublicSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  pseudonym: z.string(),
  roles: z.array(z.enum(SYSTEM_ROLES)),
  capacities: z.array(z.enum(MEMBER_CAPACITIES)),
  avatarUrl: z.string().url().nullable(),
  isSubscribed: z.boolean(),
  createdAt: z.coerce.date(),
});
export type UserPublic = z.infer<typeof userPublicSchema>;

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  locale: z.enum(["fr", "en", "ar"]).optional(),
  capacities: z.array(z.enum(MEMBER_CAPACITIES)).min(1).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const deleteAccountSchema = z.object({
  password: z.string().min(1),
  confirmation: z.literal("SUPPRIMER"),
});
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
