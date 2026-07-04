import type { Request, Response } from "express";
import { dataRoomService } from "./data-room.service.js";

function accessContext(req: Request) {
  const roles = req.auth!.roles;
  return {
    userId: req.auth!.userId,
    isAdmin: roles.includes("admin") || roles.includes("superadmin"),
    isAuditor: roles.includes("halal_auditor"),
  };
}

export const dataRoomController = {
  async get(req: Request, res: Response) {
    const room = await dataRoomService.getOrCreate(req.params.listingId as string, accessContext(req));
    res.status(200).json({ success: true, data: { dataRoom: room } });
  },

  async requestUpload(req: Request, res: Response) {
    const { fileName, contentType } = req.body as { fileName: string; contentType: string };
    const data = await dataRoomService.requestUpload(
      req.params.listingId as string,
      accessContext(req),
      fileName,
      contentType,
    );
    res.status(200).json({ success: true, data });
  },

  async registerDocument(req: Request, res: Response) {
    const { fileName, storageKey, contentType } = req.body as {
      fileName: string;
      storageKey: string;
      contentType: string;
    };
    const room = await dataRoomService.registerDocument(
      req.params.listingId as string,
      accessContext(req),
      fileName,
      storageKey,
      contentType,
    );
    res.status(201).json({ success: true, data: { dataRoom: room } });
  },

  async download(req: Request, res: Response) {
    const url = await dataRoomService.getDownloadUrl(
      req.params.listingId as string,
      req.params.documentId as string,
      accessContext(req),
    );
    res.status(200).json({ success: true, data: { url } });
  },
};
