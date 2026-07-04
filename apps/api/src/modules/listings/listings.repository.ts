import type { FilterQuery } from "mongoose";
import { ListingModel, type ListingDocument } from "../../models/listing.model.js";
import type { ListingSearchQuery } from "@muzzap/shared";

export const listingsRepository = {
  create(data: Record<string, unknown>) {
    return ListingModel.create(data);
  },

  findById(id: string) {
    return ListingModel.findById(id).exec();
  },

  findBySellerId(sellerId: string) {
    return ListingModel.find({ sellerId }).sort({ createdAt: -1 }).exec();
  },

  async search(query: ListingSearchQuery) {
    const filter: FilterQuery<ListingDocument> = { status: "published" };

    if (query.q) filter.$text = { $search: query.q };
    if (query.type) filter.type = query.type;
    if (query.sector) filter.sector = query.sector;
    if (query.halalVerifiedOnly) filter.halalVerified = true;
    if (query.minPrice != null || query.maxPrice != null) {
      filter["financials.askingPrice"] = {
        ...(query.minPrice != null ? { $gte: query.minPrice } : {}),
        ...(query.maxPrice != null ? { $lte: query.maxPrice } : {}),
      };
    }
    if (query.minProfit != null) {
      filter["financials.annualProfit"] = { $gte: query.minProfit };
    }

    const sort: Record<string, 1 | -1> =
      query.sortBy === "price_asc"
        ? { "financials.askingPrice": 1 }
        : query.sortBy === "price_desc"
          ? { "financials.askingPrice": -1 }
          : query.sortBy === "profit_desc"
            ? { "financials.annualProfit": -1 }
            : { publishedAt: -1 };

    const skip = (query.page - 1) * query.pageSize;

    const [items, total] = await Promise.all([
      ListingModel.find(filter).sort(sort).skip(skip).limit(query.pageSize).exec(),
      ListingModel.countDocuments(filter).exec(),
    ]);

    return { items, total };
  },

  async save(listing: ListingDocument) {
    await listing.save();
    return listing;
  },
};
