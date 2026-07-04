import { Router } from "express";
import { z } from "zod";
import { objectIdSchema, SYSTEM_ROLES, MEMBER_CAPACITIES } from "@muzzap/shared";
import { passwordSchema, emailSchema } from "@muzzap/shared";
import { CMS_LOCALES } from "../../models/cms-content.model.js";
import { adminController } from "./admin.controller.js";
import { validate } from "../../middlewares/validate.js";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";

export const adminRouter: Router = Router();

adminRouter.use(requireAuth, requireRole("admin"));

const idParamSchema = z.object({ id: objectIdSchema });
const idAndMessageIdParamSchema = z.object({ id: objectIdSchema, messageId: objectIdSchema });

adminRouter.get("/kpis", adminController.kpis);

// -- Users -------------------------------------------------------------------------------------

adminRouter.get("/users", adminController.listUsers);
adminRouter.get("/users/export", adminController.exportUsers);

adminRouter.post(
  "/users",
  validate({
    body: z.object({
      email: emailSchema,
      fullName: z.string().trim().min(2).max(120),
      password: passwordSchema,
      roles: z.array(z.enum(SYSTEM_ROLES)).min(1),
    }),
  }),
  adminController.createUser,
);

adminRouter.patch(
  "/users/:id",
  validate({
    params: idParamSchema,
    body: z
      .object({
        fullName: z.string().trim().min(2).max(120).optional(),
        roles: z.array(z.enum(SYSTEM_ROLES)).min(1).optional(),
        capacities: z.array(z.enum(MEMBER_CAPACITIES)).optional(),
      })
      .refine((data) => Object.keys(data).length > 0, { message: "Au moins un champ doit être fourni" }),
  }),
  adminController.updateUser,
);

adminRouter.post(
  "/users/:id/verify",
  validate({ params: idParamSchema }),
  adminController.verifyUser,
);

adminRouter.get(
  "/users/:id/history",
  validate({ params: idParamSchema }),
  adminController.userHistory,
);

adminRouter.post(
  "/users/:id/ban",
  validate({ params: idParamSchema, body: z.object({ reason: z.string().min(3).max(500) }) }),
  adminController.banUser,
);
adminRouter.post(
  "/users/:id/unban",
  validate({ params: idParamSchema }),
  adminController.unbanUser,
);
adminRouter.post(
  "/users/:id/impersonate",
  validate({ params: idParamSchema }),
  adminController.impersonate,
);

// -- Listings ------------------------------------------------------------------------------------

adminRouter.get("/listings", adminController.listListings);
adminRouter.post(
  "/listings/:id/approve",
  validate({ params: idParamSchema }),
  adminController.approveListing,
);
adminRouter.post(
  "/listings/:id/reject",
  validate({ params: idParamSchema, body: z.object({ reason: z.string().trim().min(3).max(500) }) }),
  adminController.rejectListing,
);
adminRouter.post(
  "/listings/:id/archive",
  validate({ params: idParamSchema }),
  adminController.archiveListing,
);
adminRouter.post(
  "/listings/:id/feature",
  validate({ params: idParamSchema, body: z.object({ isFeatured: z.boolean() }) }),
  adminController.featureListing,
);
adminRouter.post(
  "/listings/:id/verify-sharia",
  validate({ params: idParamSchema }),
  adminController.verifyShariaListing,
);
adminRouter.delete(
  "/listings/:id",
  validate({ params: idParamSchema }),
  adminController.deleteListing,
);

// -- Sharia verification workspace --------------------------------------------------------------

adminRouter.get("/halal-audits", adminController.listHalalAudits);
adminRouter.get(
  "/halal-audits/:id",
  validate({ params: idParamSchema }),
  adminController.getHalalAuditDetail,
);
adminRouter.post(
  "/halal-audits/:id/comment",
  validate({ params: idParamSchema, body: z.object({ text: z.string().trim().min(1).max(2000) }) }),
  adminController.addAuditComment,
);

// -- Transactions (deal pipeline) ---------------------------------------------------------------

adminRouter.get("/deals", adminController.listDeals);
adminRouter.get("/deals/:id", validate({ params: idParamSchema }), adminController.getDeal);
adminRouter.patch(
  "/deals/:id/price",
  validate({ params: idParamSchema, body: z.object({ agreedPrice: z.number().min(0) }) }),
  adminController.setDealPrice,
);

// -- Messages moderation -------------------------------------------------------------------------

adminRouter.get("/conversations", adminController.listConversations);
adminRouter.get(
  "/conversations/:id/messages",
  validate({ params: idParamSchema }),
  adminController.getConversationMessages,
);
adminRouter.post(
  "/conversations/:id/block",
  validate({ params: idParamSchema, body: z.object({ reason: z.string().trim().min(3).max(500) }) }),
  adminController.blockConversation,
);
adminRouter.post(
  "/conversations/:id/unblock",
  validate({ params: idParamSchema }),
  adminController.unblockConversation,
);
adminRouter.delete(
  "/conversations/:id/messages/:messageId",
  validate({ params: idAndMessageIdParamSchema }),
  adminController.deleteMessage,
);

// -- Reports --------------------------------------------------------------------------------------

adminRouter.get("/reports", adminController.listReports);
adminRouter.post(
  "/reports/:id/resolve",
  validate({
    params: idParamSchema,
    body: z.object({
      action: z.enum(["resolve", "dismiss"]),
      note: z.string().trim().max(1000).optional(),
    }),
  }),
  adminController.resolveReport,
);

// -- CMS -------------------------------------------------------------------------------------------

adminRouter.get("/cms", adminController.listCms);
adminRouter.put(
  "/cms",
  validate({
    body: z.object({
      key: z.string().trim().min(1).max(200),
      locale: z.enum(CMS_LOCALES),
      value: z.string(),
    }),
  }),
  adminController.upsertCms,
);

// -- Logs ------------------------------------------------------------------------------------------

adminRouter.get("/logs", adminController.listLogs);

// -- Analytics ---------------------------------------------------------------------------------------

adminRouter.get("/analytics", adminController.analytics);
