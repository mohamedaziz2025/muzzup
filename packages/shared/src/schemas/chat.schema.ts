import { z } from "zod";
import { REVEAL_PHASES } from "../constants/listings.js";

export const startConversationSchema = z.object({
  listingId: z.string().regex(/^[a-f\d]{24}$/i),
});
export type StartConversationInput = z.infer<typeof startConversationSchema>;

export const sendMessageSchema = z.object({
  body: z.string().trim().min(1).max(4000),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const proposeRevealSchema = z.object({
  targetPhase: z.enum(REVEAL_PHASES),
});
export type ProposeRevealInput = z.infer<typeof proposeRevealSchema>;

export const respondRevealSchema = z.object({
  accept: z.boolean(),
});
export type RespondRevealInput = z.infer<typeof respondRevealSchema>;
