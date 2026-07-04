import { UserModel } from "../../models/user.model.js";
import { SubscriptionModel } from "../../models/subscription.model.js";
import { ListingModel } from "../../models/listing.model.js";
import { DealPipelineModel } from "../../models/deal-pipeline.model.js";
import { HalalAuditModel } from "../../models/halal-audit.model.js";
import { AiAnalysisModel } from "../../models/ai-analysis.model.js";
import { ConversationModel } from "../../models/conversation.model.js";
import { MessageModel } from "../../models/message.model.js";
import { AuditLogModel } from "../../models/audit-log.model.js";
import { NotFoundError, BadRequestError } from "../../lib/errors.js";
import { signAccessToken } from "../auth/jwt.js";
import { hashPassword } from "../../lib/password.js";
import { generatePseudonym } from "../../lib/pseudonym.js";
import { platformSettingsService } from "../platform-settings/platform-settings.service.js";
import type { SystemRole, MemberCapacity } from "@muzzap/shared";

const SUBSCRIPTION_PRICE_EUR = 29;
const ANALYTICS_RANGE_DAYS: Record<"7d" | "30d" | "90d", number> = { "7d": 7, "30d": 30, "90d": 90 };

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Zero-fills every day in [from, to] so charts get a continuous x-axis. */
function buildZeroFilledSeries(
  from: Date,
  to: Date,
  counts: { _id: string; count: number }[],
): { date: string; count: number }[] {
  const byDay = new Map(counts.map((row) => [row._id, row.count]));
  const series: { date: string; count: number }[] = [];
  const cursor = startOfDay(from);
  const end = startOfDay(to);
  while (cursor <= end) {
    const key = dateKey(cursor);
    series.push({ date: key, count: byDay.get(key) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return series;
}

function dailyCountAggregation(dateField: string, match: Record<string, unknown>) {
  return [
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` } },
        count: { $sum: 1 },
      },
    },
  ];
}

export const adminService = {
  async getKpis() {
    const [
      activeSubscriptions,
      totalUsers,
      subscriberCount,
      listingsByStatus,
      dealsByStage,
      publishedListings,
      submittedListings,
      commissionAgg,
      commissionRate,
    ] = await Promise.all([
      SubscriptionModel.countDocuments({ status: { $in: ["active", "trialing"] } }).exec(),
      UserModel.countDocuments().exec(),
      UserModel.countDocuments({ roles: "subscriber" }).exec(),
      ListingModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      DealPipelineModel.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$stage", count: { $sum: 1 } } },
      ]),
      ListingModel.countDocuments({ status: { $in: ["published", "sold"] } }).exec(),
      ListingModel.countDocuments({
        status: { $in: ["submitted", "under_audit", "published", "sold", "rejected"] },
      }).exec(),
      DealPipelineModel.aggregate([
        { $match: { agreedPrice: { $ne: null } } },
        { $group: { _id: null, total: { $sum: "$agreedPrice" } } },
      ]),
      platformSettingsService.getCommissionRate(),
    ]);

    const agreedPriceTotal = (commissionAgg[0] as { total: number } | undefined)?.total ?? 0;
    const revenueEstimateEur =
      activeSubscriptions * SUBSCRIPTION_PRICE_EUR + agreedPriceTotal * commissionRate;

    return {
      mrrEur: activeSubscriptions * SUBSCRIPTION_PRICE_EUR,
      activeSubscriptions,
      totalUsers,
      subscriberCount,
      listingsByStatus: Object.fromEntries(
        listingsByStatus.map((row: { _id: string; count: number }) => [row._id, row.count]),
      ),
      dealsByStage: Object.fromEntries(
        dealsByStage.map((row: { _id: string; count: number }) => [row._id, row.count]),
      ),
      conversionRate: submittedListings > 0 ? publishedListings / submittedListings : 0,
      revenueEstimateEur,
    };
  },

  async listUsers(query: {
    q: string | undefined;
    role: SystemRole | undefined;
    status: "banned" | "active" | undefined;
    page: number;
    pageSize: number;
  }) {
    const filter: Record<string, unknown> = {};
    if (query.q) {
      filter.$or = [{ email: new RegExp(query.q, "i") }, { fullName: new RegExp(query.q, "i") }];
    }
    if (query.role) filter.roles = query.role;
    if (query.status === "banned") filter.isBanned = true;
    if (query.status === "active") filter.isBanned = false;

    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await Promise.all([
      UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.pageSize).exec(),
      UserModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  async createUser(input: {
    email: string;
    fullName: string;
    password: string;
    roles: SystemRole[];
  }, actorId: string) {
    const existing = await UserModel.findOne({ email: input.email.toLowerCase() }).exec();
    if (existing) throw new BadRequestError("Un compte existe déjà avec cet email");

    const user = await UserModel.create({
      email: input.email,
      passwordHash: await hashPassword(input.password),
      fullName: input.fullName,
      pseudonym: generatePseudonym(),
      roles: input.roles,
      emailVerifiedAt: new Date(),
    });

    await AuditLogModel.create({
      actorId,
      action: "admin.user_created",
      targetType: "User",
      targetId: user._id,
      metadata: { email: user.email, roles: input.roles },
    });
    return user;
  },

  async updateUser(
    userId: string,
    patch: { fullName?: string; roles?: SystemRole[]; capacities?: MemberCapacity[] },
    actorId: string,
  ) {
    const user = await UserModel.findById(userId).exec();
    if (!user) throw new NotFoundError("Utilisateur introuvable");

    const changed: string[] = [];
    if (patch.fullName !== undefined) {
      user.fullName = patch.fullName;
      changed.push("fullName");
    }
    if (patch.roles !== undefined) {
      user.roles = patch.roles;
      changed.push("roles");
    }
    if (patch.capacities !== undefined) {
      user.capacities = patch.capacities;
      changed.push("capacities");
    }
    await user.save();

    await AuditLogModel.create({
      actorId,
      action: "admin.user_updated",
      targetType: "User",
      targetId: user._id,
      metadata: { changed },
    });
    return user;
  },

  async verifyUser(userId: string, actorId: string) {
    const user = await UserModel.findById(userId).exec();
    if (!user) throw new NotFoundError("Utilisateur introuvable");
    if (!user.emailVerifiedAt) {
      user.emailVerifiedAt = new Date();
      await user.save();
    }

    await AuditLogModel.create({
      actorId,
      action: "admin.user_verified",
      targetType: "User",
      targetId: user._id,
    });
    return user;
  },

  async getUserHistory(userId: string) {
    return AuditLogModel.find({ $or: [{ targetId: userId }, { actorId: userId }] })
      .sort({ createdAt: -1 })
      .limit(200)
      .exec();
  },

  async banUser(userId: string, actorId: string, reason: string) {
    const user = await UserModel.findById(userId).exec();
    if (!user) throw new NotFoundError("Utilisateur introuvable");
    user.isBanned = true;
    user.bannedAt = new Date();
    user.banReason = reason;
    user.refreshTokens.splice(0, user.refreshTokens.length);
    await user.save();

    await AuditLogModel.create({
      actorId,
      action: "admin.user_banned",
      targetType: "User",
      targetId: user._id,
      metadata: { reason },
    });
    return user;
  },

  async unbanUser(userId: string, actorId: string) {
    const user = await UserModel.findById(userId).exec();
    if (!user) throw new NotFoundError("Utilisateur introuvable");
    user.isBanned = false;
    user.bannedAt = null;
    user.banReason = null;
    await user.save();

    await AuditLogModel.create({
      actorId,
      action: "admin.user_unbanned",
      targetType: "User",
      targetId: user._id,
    });
    return user;
  },

  /** Issues a short-lived support-impersonation token; every use is journaled for audit. */
  async impersonate(userId: string, actorId: string) {
    const user = await UserModel.findById(userId).exec();
    if (!user) throw new NotFoundError("Utilisateur introuvable");

    await AuditLogModel.create({
      actorId,
      action: "admin.impersonation_started",
      targetType: "User",
      targetId: user._id,
    });

    const accessToken = signAccessToken({
      sub: user._id.toString(),
      roles: user.roles as SystemRole[],
      capacities: user.capacities as MemberCapacity[],
    });
    return { accessToken };
  },

  async exportUsersCsv() {
    const users = await UserModel.find().sort({ createdAt: -1 }).exec();
    const header = "email,fullName,roles,capacities,kycStatus,isBanned,createdAt";
    const rows = users.map((u) =>
      [
        u.email,
        u.fullName.replace(/,/g, " "),
        u.roles.join("|"),
        u.capacities.join("|"),
        u.kycStatus,
        u.isBanned,
        (u.createdAt as Date).toISOString(),
      ].join(","),
    );
    return [header, ...rows].join("\n");
  },

  // ---------------------------------------------------------------------------------------
  // Listings
  // ---------------------------------------------------------------------------------------

  async listListings(query: {
    status: string | undefined;
    sector: string | undefined;
    q: string | undefined;
    page: number;
    pageSize: number;
  }) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.sector) filter.sector = query.sector;
    if (query.q) filter.title = new RegExp(query.q, "i");

    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await Promise.all([
      ListingModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.pageSize)
        .populate("sellerId", "email fullName pseudonym")
        .exec(),
      ListingModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  async deleteListing(listingId: string, actorId: string) {
    const listing = await ListingModel.findById(listingId).exec();
    if (!listing) throw new NotFoundError("Annonce introuvable");

    await AuditLogModel.create({
      actorId,
      action: "admin.listing_deleted",
      targetType: "Listing",
      targetId: listing._id,
      metadata: { title: listing.title, sellerId: listing.sellerId },
    });

    await ListingModel.deleteOne({ _id: listingId }).exec();
  },

  async logListingAction(actorId: string, action: string, listingId: string, metadata?: Record<string, unknown>) {
    await AuditLogModel.create({
      actorId,
      action,
      targetType: "Listing",
      targetId: listingId,
      metadata: metadata ?? {},
    });
  },

  // ---------------------------------------------------------------------------------------
  // Sharia verification workspace
  // ---------------------------------------------------------------------------------------

  async listHalalAudits(query: { status: string | undefined; page: number; pageSize: number }) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;

    const skip = (query.page - 1) * query.pageSize;
    // Fetch un-populated first: we need the raw listingId ObjectIds to join AiAnalysis before
    // .populate() replaces that field with the referenced Listing sub-document.
    const [items, total] = await Promise.all([
      HalalAuditModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.pageSize).exec(),
      HalalAuditModel.countDocuments(filter).exec(),
    ]);

    const listingIds = items.map((a) => a.listingId);
    const analyses = await AiAnalysisModel.find({ listingId: { $in: listingIds } })
      .sort({ createdAt: -1 })
      .exec();
    const analysisByListing = new Map<string, (typeof analyses)[number]>();
    for (const analysis of analyses) {
      const key = analysis.listingId?.toString();
      if (key && !analysisByListing.has(key)) analysisByListing.set(key, analysis);
    }

    const enriched = items.map((audit) => ({
      audit,
      aiAnalysis: analysisByListing.get(audit.listingId.toString()) ?? null,
    }));

    await HalalAuditModel.populate(items, [
      { path: "listingId", select: "title sector" },
      { path: "auditorId", select: "fullName" },
    ]);

    return { items: enriched, total };
  },

  async getHalalAuditDetail(auditId: string) {
    const audit = await HalalAuditModel.findById(auditId).exec();
    if (!audit) throw new NotFoundError("Audit introuvable");

    // Captured before populate() replaces listingId with the referenced Listing sub-document.
    const aiAnalysis = await AiAnalysisModel.findOne({ listingId: audit.listingId })
      .sort({ createdAt: -1 })
      .exec();

    await audit.populate([
      { path: "listingId", select: "title sector" },
      { path: "auditorId", select: "fullName" },
    ]);

    return { audit, aiAnalysis };
  },

  async addAuditComment(auditId: string, actorId: string, text: string) {
    const audit = await HalalAuditModel.findById(auditId).exec();
    if (!audit) throw new NotFoundError("Audit introuvable");

    audit.journal.push({
      action: "admin_comment",
      actorId,
      metadata: { text },
    } as unknown as (typeof audit.journal)[number]);
    await audit.save();
    return audit;
  },

  // ---------------------------------------------------------------------------------------
  // Transactions (deal pipeline)
  // ---------------------------------------------------------------------------------------

  async listDeals(query: { status: string | undefined; stage: string | undefined; page: number; pageSize: number }) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.stage) filter.stage = query.stage;

    const skip = (query.page - 1) * query.pageSize;
    const [items, total, commissionRate] = await Promise.all([
      DealPipelineModel.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(query.pageSize)
        .populate("listingId", "title")
        .populate("buyerId", "fullName email")
        .populate("sellerId", "fullName email")
        .exec(),
      DealPipelineModel.countDocuments(filter).exec(),
      platformSettingsService.getCommissionRate(),
    ]);

    return {
      items: items.map((deal) => ({
        deal,
        commission: deal.agreedPrice != null ? deal.agreedPrice * commissionRate : null,
      })),
      total,
    };
  },

  async getDeal(dealId: string) {
    const deal = await DealPipelineModel.findById(dealId)
      .populate("listingId", "title")
      .populate("buyerId", "fullName email")
      .populate("sellerId", "fullName email")
      .exec();
    if (!deal) throw new NotFoundError("Transaction introuvable");

    const commissionRate = await platformSettingsService.getCommissionRate();
    return { deal, commission: deal.agreedPrice != null ? deal.agreedPrice * commissionRate : null };
  },

  async setDealPrice(dealId: string, agreedPrice: number, actorId: string) {
    const deal = await DealPipelineModel.findById(dealId).exec();
    if (!deal) throw new NotFoundError("Transaction introuvable");
    deal.agreedPrice = agreedPrice;
    await deal.save();

    await AuditLogModel.create({
      actorId,
      action: "admin.deal_price_set",
      targetType: "DealPipeline",
      targetId: deal._id,
      metadata: { agreedPrice },
    });
    return deal;
  },

  // ---------------------------------------------------------------------------------------
  // Messages moderation
  // ---------------------------------------------------------------------------------------

  async listConversations(query: {
    flaggedOnly: boolean | undefined;
    q: string | undefined;
    page: number;
    pageSize: number;
  }) {
    const filter: Record<string, unknown> = {};
    if (query.flaggedOnly) filter.flaggedCount = { $gt: 0 };
    if (query.q) filter.lastMessagePreview = new RegExp(query.q, "i");

    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await Promise.all([
      ConversationModel.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(query.pageSize)
        .populate("listingId", "title")
        .populate("participantIds", "fullName email")
        .exec(),
      ConversationModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  async blockConversation(conversationId: string, reason: string, actorId: string) {
    const conversation = await ConversationModel.findById(conversationId).exec();
    if (!conversation) throw new NotFoundError("Conversation introuvable");
    conversation.adminBlocked = true;
    conversation.adminBlockedReason = reason;
    await conversation.save();

    await AuditLogModel.create({
      actorId,
      action: "admin.conversation_blocked",
      targetType: "Conversation",
      targetId: conversation._id,
      metadata: { reason },
    });
    return conversation;
  },

  async unblockConversation(conversationId: string, actorId: string) {
    const conversation = await ConversationModel.findById(conversationId).exec();
    if (!conversation) throw new NotFoundError("Conversation introuvable");
    conversation.adminBlocked = false;
    conversation.adminBlockedReason = null;
    await conversation.save();

    await AuditLogModel.create({
      actorId,
      action: "admin.conversation_unblocked",
      targetType: "Conversation",
      targetId: conversation._id,
    });
    return conversation;
  },

  async deleteMessage(conversationId: string, messageId: string, actorId: string) {
    const message = await MessageModel.findOne({ _id: messageId, conversationId }).exec();
    if (!message) throw new NotFoundError("Message introuvable");

    message.deletedAt = new Date();
    message.body = "[Message supprimé par un modérateur]";
    await message.save();

    await AuditLogModel.create({
      actorId,
      action: "admin.message_deleted",
      targetType: "Message",
      targetId: message._id,
      metadata: { conversationId },
    });
    return message;
  },

  // ---------------------------------------------------------------------------------------
  // Logs
  // ---------------------------------------------------------------------------------------

  async listLogs(query: {
    action: string | undefined;
    actorId: string | undefined;
    from: string | undefined;
    to: string | undefined;
    page: number;
    pageSize: number;
  }) {
    const filter: Record<string, unknown> = {};
    if (query.action) filter.action = new RegExp(`^${query.action}`, "i");
    if (query.actorId) filter.actorId = query.actorId;
    if (query.from || query.to) {
      filter.createdAt = {
        ...(query.from ? { $gte: new Date(query.from) } : {}),
        ...(query.to ? { $lte: new Date(query.to) } : {}),
      };
    }

    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await Promise.all([
      AuditLogModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.pageSize)
        .populate("actorId", "fullName email")
        .exec(),
      AuditLogModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  // ---------------------------------------------------------------------------------------
  // Analytics
  // ---------------------------------------------------------------------------------------

  async getAnalytics(range: "7d" | "30d" | "90d") {
    const days = ANALYTICS_RANGE_DAYS[range];
    const to = new Date();
    const from = new Date(to.getTime() - (days - 1) * 24 * 60 * 60 * 1000);

    const [signupsRaw, submissionsRaw, completedRaw] = await Promise.all([
      UserModel.aggregate(dailyCountAggregation("createdAt", { createdAt: { $gte: from } })),
      ListingModel.aggregate(
        dailyCountAggregation("createdAt", { createdAt: { $gte: from }, status: { $ne: "draft" } }),
      ),
      // Uses updatedAt as a simpler proxy for "date the deal reached completed" rather than
      // walking stageHistory for the final_validation entry.
      DealPipelineModel.aggregate(
        dailyCountAggregation("updatedAt", { updatedAt: { $gte: from }, status: "completed" }),
      ),
    ]);

    return {
      signups: buildZeroFilledSeries(from, to, signupsRaw as { _id: string; count: number }[]),
      listingSubmissions: buildZeroFilledSeries(from, to, submissionsRaw as { _id: string; count: number }[]),
      completedDeals: buildZeroFilledSeries(from, to, completedRaw as { _id: string; count: number }[]),
    };
  },
};
