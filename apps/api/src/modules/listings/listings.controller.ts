import type { Request, Response } from "express";
import type {
  ListingDraftInput,
  ListingUpdateInput,
  ListingSearchQuery,
  ListingReviewInput,
} from "@muzzap/shared";
import { listingsService } from "./listings.service.js";
import { toListingCard, toListingDetail } from "./listings.mapper.js";
import { ForbiddenError, NotFoundError } from "../../lib/errors.js";
import { halalAuditService } from "../halal-audit/halal-audit.service.js";
import { aiService } from "../ai/ai.service.js";
import { logger } from "../../config/logger.js";

function paramId(req: Request): string {
  return req.params.id as string;
}

function viewerContext(req: Request) {
  const roles = req.auth?.roles ?? [];
  return {
    userId: req.auth?.userId,
    isSubscriber: roles.includes("subscriber"),
    isAdmin: roles.includes("admin") || roles.includes("superadmin"),
    isAuditor: roles.includes("halal_auditor"),
  };
}

export const listingsController = {
  async create(req: Request, res: Response) {
    const listing = await listingsService.createDraft(
      req.auth!.userId,
      req.body as ListingDraftInput,
    );
    res.status(201).json({ success: true, data: { listing: toListingDetail(listing, viewerContext(req)) } });
  },

  async update(req: Request, res: Response) {
    const listing = await listingsService.updateDraft(
      paramId(req),
      req.auth!.userId,
      req.body as ListingUpdateInput,
    );
    res.status(200).json({ success: true, data: { listing: toListingDetail(listing, viewerContext(req)) } });
  },

  async submit(req: Request, res: Response) {
    const listing = await listingsService.submit(paramId(req), req.auth!.userId);
    await halalAuditService.createForListing(listing._id.toString(), req.auth!.userId);

    // Best-effort: the coherence pre-analysis assists the auditor but must never block submission.
    aiService.analyzeListingCoherence(listing._id.toString(), req.auth!.userId).catch((err) => {
      logger.warn({ err, listingId: listing._id.toString() }, "Pré-analyse IA indisponible");
    });

    res.status(200).json({ success: true, data: { listing: toListingDetail(listing, viewerContext(req)) } });
  },

  async mine(req: Request, res: Response) {
    const listings = await listingsService.getMine(req.auth!.userId);
    const viewer = viewerContext(req);
    res.status(200).json({
      success: true,
      data: { listings: listings.map((l) => toListingDetail(l, viewer)) },
    });
  },

  async search(req: Request, res: Response) {
    const query = (req as Request & { validatedQuery: ListingSearchQuery }).validatedQuery;
    const { items, total } = await listingsService.search(query);
    res.status(200).json({
      success: true,
      data: { listings: items.map(toListingCard) },
      meta: { page: query.page, pageSize: query.pageSize, total },
    });
  },

  async getById(req: Request, res: Response) {
    const listing = await listingsService.getByIdOrThrow(paramId(req));
    const viewer = viewerContext(req);

    const isOwner = viewer.userId === listing.sellerId.toString();
    const canView = listing.status === "published" || isOwner || viewer.isAdmin || viewer.isAuditor;
    if (!canView) throw new NotFoundError("Annonce introuvable");

    if (listing.status === "published" && !isOwner) {
      await listingsService.incrementViews(listing);
    }

    res.status(200).json({ success: true, data: { listing: toListingDetail(listing, viewer) } });
  },

  async auditStatus(req: Request, res: Response) {
    const listing = await listingsService.getByIdOrThrow(paramId(req));
    const viewer = viewerContext(req);
    const isOwner = viewer.userId === listing.sellerId.toString();
    if (!isOwner && !viewer.isAdmin && !viewer.isAuditor) {
      throw new ForbiddenError();
    }
    const position = await halalAuditService.getQueuePosition(paramId(req));
    res.status(200).json({ success: true, data: { position } });
  },

  async review(req: Request, res: Response) {
    const { decision, rejectionReason } = req.body as ListingReviewInput;
    if (decision === "reject" && !rejectionReason) {
      throw new ForbiddenError("Un motif de rejet est requis");
    }
    const listing =
      decision === "approve"
        ? await listingsService.publish(paramId(req))
        : await listingsService.reject(paramId(req), rejectionReason!);
    res.status(200).json({ success: true, data: { listing: toListingDetail(listing, viewerContext(req)) } });
  },

  async setFeatured(req: Request, res: Response) {
    const { isFeatured } = req.body as { isFeatured: boolean };
    const listing = await listingsService.setFeatured(paramId(req), isFeatured);
    res.status(200).json({ success: true, data: { listing: toListingDetail(listing, viewerContext(req)) } });
  },
};
