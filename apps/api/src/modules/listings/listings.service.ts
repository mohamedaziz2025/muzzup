import type { ListingDraftInput, ListingUpdateInput, ListingSearchQuery } from "@muzzap/shared";
import { listingsRepository } from "./listings.repository.js";
import { ForbiddenError, NotFoundError, BadRequestError } from "../../lib/errors.js";
import type { ListingDocument } from "../../models/listing.model.js";
import { notificationsService } from "../notifications/notifications.service.js";

function assertOwner(listing: ListingDocument, userId: string) {
  if (listing.sellerId.toString() !== userId) {
    throw new ForbiddenError("Vous n'êtes pas propriétaire de cette annonce");
  }
}

export const listingsService = {
  async createDraft(sellerId: string, input: ListingDraftInput) {
    return listingsRepository.create({
      sellerId,
      type: input.type,
      title: input.title,
      summary: input.summary,
      sector: input.sector,
      foundedAt: input.foundedAt,
      acquisitionChannels: input.acquisitionChannels,
      financials: input.financials,
      halalSelfChecklist: input.halalSelfChecklist,
      status: "draft",
    });
  },

  async updateDraft(id: string, sellerId: string, input: ListingUpdateInput) {
    const listing = await listingsRepository.findById(id);
    if (!listing) throw new NotFoundError("Annonce introuvable");
    assertOwner(listing, sellerId);
    if (!["draft", "rejected"].includes(listing.status)) {
      throw new BadRequestError("Cette annonce ne peut plus être modifiée à ce stade");
    }

    listing.versions.push({
      snapshot: listing.toObject(),
      editedBy: listing.sellerId,
      editedAt: new Date(),
    } as (typeof listing.versions)[number]);

    Object.assign(listing, input);
    return listingsRepository.save(listing);
  },

  async submit(id: string, sellerId: string) {
    const listing = await listingsRepository.findById(id);
    if (!listing) throw new NotFoundError("Annonce introuvable");
    assertOwner(listing, sellerId);
    if (!["draft", "rejected"].includes(listing.status)) {
      throw new BadRequestError("Cette annonce a déjà été soumise");
    }
    const checklistValues = Array.from(listing.halalSelfChecklist.values());
    if (checklistValues.length === 0 || checklistValues.some((v) => v !== true)) {
      throw new BadRequestError(
        "La checklist déclarative Sharia doit être entièrement validée avant soumission",
      );
    }
    listing.status = "submitted";
    listing.rejectionReason = null;
    return listingsRepository.save(listing);
  },

  async getMine(sellerId: string) {
    return listingsRepository.findBySellerId(sellerId);
  },

  async getByIdOrThrow(id: string) {
    const listing = await listingsRepository.findById(id);
    if (!listing) throw new NotFoundError("Annonce introuvable");
    return listing;
  },

  async incrementViews(listing: ListingDocument) {
    listing.viewsCount += 1;
    await listingsRepository.save(listing);
  },

  search(query: ListingSearchQuery) {
    return listingsRepository.search(query);
  },

  async publish(id: string) {
    const listing = await listingsRepository.findById(id);
    if (!listing) throw new NotFoundError("Annonce introuvable");
    listing.status = "published";
    listing.publishedAt = new Date();
    await listingsRepository.save(listing);
    await notificationsService.create(
      listing.sellerId.toString(),
      "listing_published",
      "Votre annonce est publiée",
      `« ${listing.title} » est maintenant visible sur la marketplace.`,
      `/annonces/${listing._id.toString()}`,
    );
    return listing;
  },

  async markHalalVerified(id: string) {
    const listing = await listingsRepository.findById(id);
    if (!listing) throw new NotFoundError("Annonce introuvable");
    listing.halalVerified = true;
    return listingsRepository.save(listing);
  },

  async reject(id: string, reason: string) {
    const listing = await listingsRepository.findById(id);
    if (!listing) throw new NotFoundError("Annonce introuvable");
    listing.status = "rejected";
    listing.rejectionReason = reason;
    await listingsRepository.save(listing);
    await notificationsService.create(
      listing.sellerId.toString(),
      "listing_rejected",
      "Votre annonce nécessite des corrections",
      reason,
      `/vendre/${listing._id.toString()}`,
    );
    return listing;
  },

  async setFeatured(id: string, isFeatured: boolean) {
    const listing = await listingsRepository.findById(id);
    if (!listing) throw new NotFoundError("Annonce introuvable");
    listing.isFeatured = isFeatured;
    return listingsRepository.save(listing);
  },

  async archive(id: string) {
    const listing = await listingsRepository.findById(id);
    if (!listing) throw new NotFoundError("Annonce introuvable");
    listing.status = "archived";
    return listingsRepository.save(listing);
  },
};
