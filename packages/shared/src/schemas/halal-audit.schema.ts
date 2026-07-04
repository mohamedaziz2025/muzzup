import { z } from "zod";

export const checklistItemSchema = z.object({
  key: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(200),
  description: z.string().trim().max(500).optional(),
  order: z.number().int().nonnegative().optional(),
});
export type ChecklistItem = z.infer<typeof checklistItemSchema>;

export const createChecklistTemplateSchema = z.object({
  name: z.string().trim().min(3).max(120),
  items: z.array(checklistItemSchema).min(1),
});
export type CreateChecklistTemplateInput = z.infer<typeof createChecklistTemplateSchema>;

export const updateAuditItemsSchema = z.object({
  items: z
    .array(
      z.object({
        key: z.string(),
        passed: z.boolean(),
        note: z.string().trim().max(500).optional(),
      }),
    )
    .min(1),
});
export type UpdateAuditItemsInput = z.infer<typeof updateAuditItemsSchema>;

export const completeAuditSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  vigilancePoints: z.array(z.string().trim().max(300)).default([]),
  reportSummary: z.string().trim().min(10).max(2000),
});
export type CompleteAuditInput = z.infer<typeof completeAuditSchema>;
