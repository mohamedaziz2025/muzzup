import type { Request, Response } from "express";
import { favoritesService } from "./favorites.service.js";
import { toListingCard } from "../listings/listings.mapper.js";

export const favoritesController = {
  async toggle(req: Request, res: Response) {
    const result = await favoritesService.toggle(req.auth!.userId, req.params.listingId as string);
    res.status(200).json({ success: true, data: result });
  },

  async mine(req: Request, res: Response) {
    const listings = await favoritesService.listMine(req.auth!.userId);
    res.status(200).json({ success: true, data: { listings: listings.map(toListingCard) } });
  },

  async mineIds(req: Request, res: Response) {
    const listingIds = await favoritesService.myFavoriteIds(req.auth!.userId);
    res.status(200).json({ success: true, data: { listingIds } });
  },
};
