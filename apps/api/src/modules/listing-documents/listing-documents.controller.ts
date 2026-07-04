import type { Request, Response } from "express";
import { BadRequestError } from "../../lib/errors.js";
import { listingDocumentsService } from "./listing-documents.service.js";

export const listingDocumentsController = {
  async analyze(req: Request, res: Response) {
    const file = req.file;
    if (!file) {
      throw new BadRequestError("Aucun fichier reçu");
    }

    const result = await listingDocumentsService.analyzeAndStore({
      listingId: req.params.listingId as string,
      userId: req.auth!.userId,
      fileName: file.originalname,
      mimeType: file.mimetype,
      buffer: file.buffer,
    });

    res.status(201).json({ success: true, data: result });
  },
};
