import type { Request, Response } from "express";
import type {
  UpsertProviderProfileInput,
  ProviderSearchQuery,
  CreateReviewInput,
} from "@muzzap/shared";
import { providersService } from "./providers.service.js";
import { chatService } from "../chat/chat.service.js";

export const providersController = {
  async upsertMyProfile(req: Request, res: Response) {
    const provider = await providersService.upsertMyProfile(
      req.auth!.userId,
      req.body as UpsertProviderProfileInput,
    );
    res.status(200).json({ success: true, data: { provider } });
  },

  async myProfile(req: Request, res: Response) {
    const provider = await providersService.getMyProfile(req.auth!.userId);
    res.status(200).json({ success: true, data: { provider } });
  },

  async search(req: Request, res: Response) {
    const query = (req as Request & { validatedQuery: ProviderSearchQuery }).validatedQuery;
    const { items, total } = await providersService.search(query);
    res.status(200).json({
      success: true,
      data: { providers: items },
      meta: { page: query.page, pageSize: query.pageSize, total },
    });
  },

  async getById(req: Request, res: Response) {
    const provider = await providersService.getByIdOrThrow(req.params.id as string);
    res.status(200).json({ success: true, data: { provider } });
  },

  async listReviews(req: Request, res: Response) {
    const reviews = await providersService.listReviews(req.params.id as string);
    res.status(200).json({ success: true, data: { reviews } });
  },

  async createReview(req: Request, res: Response) {
    const provider = await providersService.createReview(
      req.params.id as string,
      req.auth!.userId,
      req.body as CreateReviewInput,
    );
    res.status(201).json({ success: true, data: { provider } });
  },

  async sponsoredCheckout(req: Request, res: Response) {
    const data = await providersService.createSponsoredCheckout(
      req.params.id as string,
      req.auth!.userId,
    );
    res.status(200).json({ success: true, data });
  },

  async contact(req: Request, res: Response) {
    const provider = await providersService.getByIdOrThrow(req.params.id as string);
    const conversation = await chatService.getOrCreateProviderConversation(
      provider.userId.toString(),
      req.auth!.userId,
    );
    res.status(200).json({ success: true, data: { conversation } });
  },
};
