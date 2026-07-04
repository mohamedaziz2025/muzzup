import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { usersRouter } from "../modules/users/users.routes.js";
import { listingsRouter } from "../modules/listings/listings.routes.js";
import { billingRouter } from "../modules/billing/billing.routes.js";
import { notificationsRouter } from "../modules/notifications/notifications.routes.js";
import { halalAuditRouter } from "../modules/halal-audit/halal-audit.routes.js";
import { checklistTemplatesRouter } from "../modules/halal-audit/checklist-templates.routes.js";
import { dataRoomRouter } from "../modules/data-room/data-room.routes.js";
import { listingDocumentsRouter } from "../modules/listing-documents/listing-documents.routes.js";
import { chatRouter } from "../modules/chat/chat.routes.js";
import { buyerSeriousnessRouter } from "../modules/buyer-seriousness/buyer-seriousness.routes.js";
import { dealPipelineRouter } from "../modules/deal-pipeline/deal-pipeline.routes.js";
import { providersRouter } from "../modules/providers/providers.routes.js";
import { aiRouter } from "../modules/ai/ai.routes.js";
import { adminRouter } from "../modules/admin/admin.routes.js";
import { reportsRouter } from "../modules/reports/reports.routes.js";
import { cmsRouter } from "../modules/cms/cms.routes.js";
import { platformSettingsRouter } from "../modules/platform-settings/platform-settings.routes.js";
import { favoritesRouter } from "../modules/favorites/favorites.routes.js";

export const apiV1Router: Router = Router();

apiV1Router.get("/health", (_req, res) => {
  res.status(200).json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
});

apiV1Router.use("/auth", authRouter);
apiV1Router.use("/users", usersRouter);
apiV1Router.use("/listings", listingsRouter);
apiV1Router.use("/billing", billingRouter);
apiV1Router.use("/notifications", notificationsRouter);
apiV1Router.use("/halal-audits", halalAuditRouter);
apiV1Router.use("/admin/checklist-templates", checklistTemplatesRouter);
apiV1Router.use("/listings/:listingId/data-room", dataRoomRouter);
apiV1Router.use("/listings/:listingId/documents", listingDocumentsRouter);
apiV1Router.use("/chat", chatRouter);
apiV1Router.use("/buyer-seriousness", buyerSeriousnessRouter);
apiV1Router.use("/deal-pipelines", dealPipelineRouter);
apiV1Router.use("/providers", providersRouter);
apiV1Router.use(aiRouter);
apiV1Router.use("/reports", reportsRouter);
apiV1Router.use("/cms", cmsRouter);
apiV1Router.use("/admin/settings", platformSettingsRouter);
apiV1Router.use("/admin", adminRouter);
apiV1Router.use("/favorites", favoritesRouter);
