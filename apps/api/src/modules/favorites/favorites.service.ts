import { FavoriteModel } from "../../models/favorite.model.js";
import { ListingModel } from "../../models/listing.model.js";
import { NotFoundError } from "../../lib/errors.js";

export const favoritesService = {
  async toggle(userId: string, listingId: string) {
    const listing = await ListingModel.findById(listingId).exec();
    if (!listing) throw new NotFoundError("Annonce introuvable");

    const existing = await FavoriteModel.findOne({ userId, listingId }).exec();
    if (existing) {
      await existing.deleteOne();
      return { favorited: false };
    }
    await FavoriteModel.create({ userId, listingId });
    return { favorited: true };
  },

  async listMine(userId: string) {
    const favorites = await FavoriteModel.find({ userId }).sort({ createdAt: -1 }).exec();
    const listingIds = favorites.map((f) => f.listingId);
    const listings = await ListingModel.find({ _id: { $in: listingIds } }).exec();
    return listings;
  },

  async myFavoriteIds(userId: string) {
    const favorites = await FavoriteModel.find({ userId }).select("listingId").exec();
    return favorites.map((f) => f.listingId.toString());
  },

  countForUser(userId: string) {
    return FavoriteModel.countDocuments({ userId }).exec();
  },
};
