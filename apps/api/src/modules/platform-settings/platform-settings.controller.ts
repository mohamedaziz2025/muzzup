import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { platformSettingsService, type PlatformSettingsPatch } from "./platform-settings.service.js";

export const platformSettingsController = {
  async getSettings(_req: Request, res: Response) {
    const settings = await platformSettingsService.getSettings();
    res.status(200).json({ success: true, data: { settings } });
  },

  async updateSettings(req: Request, res: Response) {
    const patch = req.body as PlatformSettingsPatch;
    const settings = await platformSettingsService.updateSettings(patch, req.auth!.userId);
    res.status(200).json({ success: true, data: { settings } });
  },

  /** Read-only, non-secret provider labels — never exposes actual credential values. */
  async infrastructure(_req: Request, res: Response) {
    res.status(200).json({
      success: true,
      data: {
        emailProvider: "console",
        aiProvider: env.GEMINI_API_KEY ? "gemini" : "console",
        storageProvider: "local",
      },
    });
  },
};
