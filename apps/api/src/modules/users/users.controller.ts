import type { Request, Response } from "express";
import type { UpdateProfileInput, DeleteAccountInput } from "@muzzap/shared";
import { usersService } from "./users.service.js";
import { toUserPublic } from "./users.mapper.js";
import { clearRefreshCookie } from "../../lib/cookies.js";
import { BadRequestError } from "../../lib/errors.js";

export const usersController = {
  async me(req: Request, res: Response) {
    const user = await usersService.getById(req.auth!.userId);
    res.status(200).json({ success: true, data: { user: toUserPublic(user) } });
  },

  async updateMe(req: Request, res: Response) {
    const user = await usersService.updateProfile(req.auth!.userId, req.body as UpdateProfileInput);
    res.status(200).json({ success: true, data: { user: toUserPublic(user) } });
  },

  async uploadAvatar(req: Request, res: Response) {
    if (!req.file) throw new BadRequestError("Aucun fichier reçu");
    const user = await usersService.updateAvatar(req.auth!.userId, {
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
    });
    res.status(200).json({ success: true, data: { user: toUserPublic(user) } });
  },

  async exportMyData(req: Request, res: Response) {
    const data = await usersService.exportPersonalData(req.auth!.userId);
    res.setHeader("Content-Disposition", "attachment; filename=muzzap-donnees-personnelles.json");
    res.status(200).json({ success: true, data });
  },

  async deleteMe(req: Request, res: Response) {
    const { password } = req.body as DeleteAccountInput;
    await usersService.deleteAccount(req.auth!.userId, password);
    clearRefreshCookie(res);
    res.status(204).send();
  },
};
