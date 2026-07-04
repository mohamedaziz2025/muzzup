import type { Request, Response } from "express";
import type { SystemRole, MemberCapacity } from "@muzzap/shared";
import { adminService } from "./admin.service.js";
import { listingsService } from "../listings/listings.service.js";
import { chatService } from "../chat/chat.service.js";
import { reportsService } from "../reports/reports.service.js";
import { cmsService } from "../cms/cms.service.js";
import type { CmsLocale } from "../../models/cms-content.model.js";
import { AuditLogModel } from "../../models/audit-log.model.js";

function paramId(req: Request): string {
  return req.params.id as string;
}

function paginationOf(req: Request): { page: number; pageSize: number } {
  const { page, pageSize } = req.query as { page?: string; pageSize?: string };
  return {
    page: page ? Number(page) : 1,
    pageSize: pageSize ? Number(pageSize) : 20,
  };
}

export const adminController = {
  async kpis(_req: Request, res: Response) {
    const kpis = await adminService.getKpis();
    res.status(200).json({ success: true, data: kpis });
  },

  // -- Users ---------------------------------------------------------------------------------

  async listUsers(req: Request, res: Response) {
    const { q, role, status } = req.query as {
      q?: string;
      role?: SystemRole;
      status?: "banned" | "active";
    };
    const { items, total } = await adminService.listUsers({ q, role, status, ...paginationOf(req) });
    res.status(200).json({ success: true, data: { users: items }, meta: { total } });
  },

  async createUser(req: Request, res: Response) {
    const { email, fullName, password, roles } = req.body as {
      email: string;
      fullName: string;
      password: string;
      roles: SystemRole[];
    };
    const user = await adminService.createUser({ email, fullName, password, roles }, req.auth!.userId);
    res.status(201).json({ success: true, data: { user } });
  },

  async updateUser(req: Request, res: Response) {
    const patch = req.body as { fullName?: string; roles?: SystemRole[]; capacities?: MemberCapacity[] };
    const user = await adminService.updateUser(paramId(req), patch, req.auth!.userId);
    res.status(200).json({ success: true, data: { user } });
  },

  async verifyUser(req: Request, res: Response) {
    const user = await adminService.verifyUser(paramId(req), req.auth!.userId);
    res.status(200).json({ success: true, data: { user } });
  },

  async userHistory(req: Request, res: Response) {
    const entries = await adminService.getUserHistory(paramId(req));
    res.status(200).json({ success: true, data: { entries } });
  },

  async banUser(req: Request, res: Response) {
    const { reason } = req.body as { reason: string };
    const user = await adminService.banUser(paramId(req), req.auth!.userId, reason);
    res.status(200).json({ success: true, data: { user: { id: user._id, isBanned: user.isBanned } } });
  },

  async unbanUser(req: Request, res: Response) {
    const user = await adminService.unbanUser(paramId(req), req.auth!.userId);
    res.status(200).json({ success: true, data: { user: { id: user._id, isBanned: user.isBanned } } });
  },

  async impersonate(req: Request, res: Response) {
    const data = await adminService.impersonate(paramId(req), req.auth!.userId);
    res.status(200).json({ success: true, data });
  },

  async exportUsers(_req: Request, res: Response) {
    const csv = await adminService.exportUsersCsv();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=muzzap-utilisateurs.csv");
    res.status(200).send(csv);
  },

  // -- Listings --------------------------------------------------------------------------------

  async listListings(req: Request, res: Response) {
    const { status, sector, q } = req.query as { status?: string; sector?: string; q?: string };
    const { items, total } = await adminService.listListings({ status, sector, q, ...paginationOf(req) });
    res.status(200).json({ success: true, data: { listings: items }, meta: { total } });
  },

  async approveListing(req: Request, res: Response) {
    const listing = await listingsService.publish(paramId(req));
    await adminService.logListingAction(req.auth!.userId, "admin.listing_approved", paramId(req));
    res.status(200).json({ success: true, data: { listing } });
  },

  async rejectListing(req: Request, res: Response) {
    const { reason } = req.body as { reason: string };
    const listing = await listingsService.reject(paramId(req), reason);
    await adminService.logListingAction(req.auth!.userId, "admin.listing_rejected", paramId(req), { reason });
    res.status(200).json({ success: true, data: { listing } });
  },

  async archiveListing(req: Request, res: Response) {
    const listing = await listingsService.archive(paramId(req));
    await adminService.logListingAction(req.auth!.userId, "admin.listing_archived", paramId(req));
    res.status(200).json({ success: true, data: { listing } });
  },

  async featureListing(req: Request, res: Response) {
    const { isFeatured } = req.body as { isFeatured: boolean };
    const listing = await listingsService.setFeatured(paramId(req), isFeatured);
    await adminService.logListingAction(req.auth!.userId, "admin.listing_featured", paramId(req), { isFeatured });
    res.status(200).json({ success: true, data: { listing } });
  },

  async verifyShariaListing(req: Request, res: Response) {
    const listing = await listingsService.markHalalVerified(paramId(req));
    await adminService.logListingAction(req.auth!.userId, "admin.listing_sharia_verified", paramId(req));
    res.status(200).json({ success: true, data: { listing } });
  },

  async deleteListing(req: Request, res: Response) {
    await adminService.deleteListing(paramId(req), req.auth!.userId);
    res.status(200).json({ success: true, data: { deleted: true } });
  },

  // -- Sharia verification workspace ------------------------------------------------------------

  async listHalalAudits(req: Request, res: Response) {
    const { status } = req.query as { status?: string };
    const { items, total } = await adminService.listHalalAudits({ status, ...paginationOf(req) });
    res.status(200).json({ success: true, data: { audits: items }, meta: { total } });
  },

  async getHalalAuditDetail(req: Request, res: Response) {
    const result = await adminService.getHalalAuditDetail(paramId(req));
    res.status(200).json({ success: true, data: result });
  },

  async addAuditComment(req: Request, res: Response) {
    const { text } = req.body as { text: string };
    const audit = await adminService.addAuditComment(paramId(req), req.auth!.userId, text);
    res.status(200).json({ success: true, data: { audit } });
  },

  // -- Deals -----------------------------------------------------------------------------------

  async listDeals(req: Request, res: Response) {
    const { status, stage } = req.query as { status?: string; stage?: string };
    const { items, total } = await adminService.listDeals({ status, stage, ...paginationOf(req) });
    res.status(200).json({ success: true, data: { deals: items }, meta: { total } });
  },

  async getDeal(req: Request, res: Response) {
    const result = await adminService.getDeal(paramId(req));
    res.status(200).json({ success: true, data: result });
  },

  async setDealPrice(req: Request, res: Response) {
    const { agreedPrice } = req.body as { agreedPrice: number };
    const deal = await adminService.setDealPrice(paramId(req), agreedPrice, req.auth!.userId);
    res.status(200).json({ success: true, data: { deal } });
  },

  // -- Messages moderation -----------------------------------------------------------------------

  async listConversations(req: Request, res: Response) {
    const { flaggedOnly, q } = req.query as { flaggedOnly?: string; q?: string };
    const { items, total } = await adminService.listConversations({
      flaggedOnly: flaggedOnly === undefined ? undefined : flaggedOnly === "true",
      q,
      ...paginationOf(req),
    });
    res.status(200).json({ success: true, data: { conversations: items }, meta: { total } });
  },

  async getConversationMessages(req: Request, res: Response) {
    const messages = await chatService.getMessagesForAdmin(paramId(req));
    res.status(200).json({ success: true, data: { messages } });
  },

  async blockConversation(req: Request, res: Response) {
    const { reason } = req.body as { reason: string };
    const conversation = await adminService.blockConversation(paramId(req), reason, req.auth!.userId);
    res.status(200).json({ success: true, data: { conversation } });
  },

  async unblockConversation(req: Request, res: Response) {
    const conversation = await adminService.unblockConversation(paramId(req), req.auth!.userId);
    res.status(200).json({ success: true, data: { conversation } });
  },

  async deleteMessage(req: Request, res: Response) {
    const message = await adminService.deleteMessage(
      paramId(req),
      req.params.messageId as string,
      req.auth!.userId,
    );
    res.status(200).json({ success: true, data: { message } });
  },

  // -- Reports -----------------------------------------------------------------------------------

  async listReports(req: Request, res: Response) {
    const { status, targetType } = req.query as { status?: string; targetType?: string };
    const { items, total } = await reportsService.list({ status, targetType, ...paginationOf(req) });
    res.status(200).json({ success: true, data: { reports: items }, meta: { total } });
  },

  async resolveReport(req: Request, res: Response) {
    const { action, note } = req.body as { action: "resolve" | "dismiss"; note?: string };
    const report = await reportsService.resolve(paramId(req), req.auth!.userId, action, note);
    await AuditLogModel.create({
      actorId: req.auth!.userId,
      action: action === "resolve" ? "admin.report_resolved" : "admin.report_dismissed",
      targetType: "Report",
      targetId: report._id,
      metadata: { note },
    });
    res.status(200).json({ success: true, data: { report } });
  },

  // -- CMS ---------------------------------------------------------------------------------------

  async listCms(req: Request, res: Response) {
    const { locale } = req.query as { locale?: CmsLocale };
    const entries = await cmsService.listAdmin(locale);
    res.status(200).json({ success: true, data: { entries } });
  },

  async upsertCms(req: Request, res: Response) {
    const { key, locale, value } = req.body as { key: string; locale: CmsLocale; value: string };
    const entry = await cmsService.upsert(key, locale, value, req.auth!.userId);
    await AuditLogModel.create({
      actorId: req.auth!.userId,
      action: "admin.cms_updated",
      targetType: "CmsContent",
      targetId: entry._id,
      metadata: { key, locale },
    });
    res.status(200).json({ success: true, data: { entry } });
  },

  // -- Logs ---------------------------------------------------------------------------------------

  async listLogs(req: Request, res: Response) {
    const { action, actorId, from, to } = req.query as {
      action?: string;
      actorId?: string;
      from?: string;
      to?: string;
    };
    const { page, pageSize } = paginationOf(req);
    const { items, total } = await adminService.listLogs({
      action,
      actorId,
      from,
      to,
      page,
      pageSize: Math.min(pageSize || 50, 200),
    });
    res.status(200).json({ success: true, data: { logs: items }, meta: { total } });
  },

  // -- Analytics -----------------------------------------------------------------------------------

  async analytics(req: Request, res: Response) {
    const { range } = req.query as { range?: "7d" | "30d" | "90d" };
    const data = await adminService.getAnalytics(range ?? "30d");
    res.status(200).json({ success: true, data });
  },
};
