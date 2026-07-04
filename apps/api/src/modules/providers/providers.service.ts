import type { FilterQuery } from "mongoose";
import {
  ServiceProviderModel,
  type ServiceProviderDocument,
} from "../../models/service-provider.model.js";
import { ReviewModel } from "../../models/review.model.js";
import { SponsoredPlacementModel } from "../../models/sponsored-placement.model.js";
import { stripeClient } from "../../lib/stripe.js";
import { env } from "../../config/env.js";
import type { UpsertProviderProfileInput, ProviderSearchQuery, CreateReviewInput } from "@muzzap/shared";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../../lib/errors.js";

const SPONSORSHIP_PRICE_CENTS = 4900;
const SPONSORSHIP_DAYS = 30;

export const providersService = {
  async upsertMyProfile(userId: string, input: UpsertProviderProfileInput) {
    const provider = await ServiceProviderModel.findOneAndUpdate(
      { userId },
      { $set: input },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).exec();
    return provider;
  },

  getMyProfile(userId: string) {
    return ServiceProviderModel.findOne({ userId }).exec();
  },

  async getByIdOrThrow(id: string) {
    const provider = await ServiceProviderModel.findById(id).exec();
    if (!provider) throw new NotFoundError("Prestataire introuvable");
    return provider;
  },

  async search(query: ProviderSearchQuery) {
    const filter: FilterQuery<ServiceProviderDocument> = { status: "published" };
    if (query.q) filter.$text = { $search: query.q };
    if (query.specialty) filter.specialties = query.specialty;

    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await Promise.all([
      ServiceProviderModel.find(filter)
        .sort({ isSponsored: -1, ratingAverage: -1 })
        .skip(skip)
        .limit(query.pageSize)
        .exec(),
      ServiceProviderModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  async createReview(providerId: string, authorId: string, input: CreateReviewInput) {
    const provider = await this.getByIdOrThrow(providerId);
    if (provider.userId.toString() === authorId) {
      throw new ForbiddenError("Vous ne pouvez pas noter votre propre fiche");
    }

    try {
      await ReviewModel.create({ providerId, authorId, ...input });
    } catch (err) {
      if (err && typeof err === "object" && "code" in err && err.code === 11000) {
        throw new ConflictError("Vous avez déjà laissé un avis pour ce prestataire");
      }
      throw err;
    }

    const stats = await ReviewModel.aggregate<{ _id: null; avg: number; count: number }>([
      { $match: { providerId: provider._id } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    provider.ratingAverage = stats[0]?.avg ?? 0;
    provider.ratingCount = stats[0]?.count ?? 0;
    await provider.save();

    return provider;
  },

  listReviews(providerId: string) {
    return ReviewModel.find({ providerId }).sort({ createdAt: -1 }).exec();
  },

  async createSponsoredCheckout(providerId: string, userId: string) {
    if (!stripeClient) {
      throw new BadRequestError("La facturation Stripe n'est pas configurée sur cet environnement");
    }
    const provider = await this.getByIdOrThrow(providerId);
    if (provider.userId.toString() !== userId) {
      throw new ForbiddenError("Vous ne pouvez sponsoriser que votre propre fiche");
    }

    const session = await stripeClient.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "Mise en avant prestataire MUZZUP — 30 jours" },
            unit_amount: SPONSORSHIP_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: { type: "sponsorship", providerId },
      success_url: `${env.WEB_URL}/prestataires/${providerId}?sponsorship=success`,
      cancel_url: `${env.WEB_URL}/prestataires/${providerId}?sponsorship=cancelled`,
    });

    await SponsoredPlacementModel.create({
      providerId,
      stripeCheckoutSessionId: session.id,
      status: "pending",
    });

    return { url: session.url };
  },

  async activateSponsorship(providerId: string, checkoutSessionId: string) {
    const placement = await SponsoredPlacementModel.findOne({
      providerId,
      stripeCheckoutSessionId: checkoutSessionId,
    }).exec();
    if (!placement) return;

    const now = new Date();
    const until = new Date(now.getTime() + SPONSORSHIP_DAYS * 24 * 60 * 60 * 1000);
    placement.status = "active";
    placement.activeFrom = now;
    placement.activeUntil = until;
    await placement.save();

    await ServiceProviderModel.findByIdAndUpdate(providerId, {
      isSponsored: true,
      sponsoredUntil: until,
    }).exec();
  },
};
