import type { Request, Response } from "express";
import type { CmsLocale } from "../../models/cms-content.model.js";
import { cmsService } from "./cms.service.js";

interface PublicQuery {
  locale: CmsLocale;
  keys?: string;
}

export const cmsController = {
  async getPublic(req: Request, res: Response) {
    const { locale, keys } = (req as Request & { validatedQuery: PublicQuery }).validatedQuery;
    const keyList = keys ? keys.split(",").map((k) => k.trim()).filter(Boolean) : undefined;
    const content = await cmsService.getPublic(locale, keyList);
    res.status(200).json({ success: true, data: content });
  },
};
