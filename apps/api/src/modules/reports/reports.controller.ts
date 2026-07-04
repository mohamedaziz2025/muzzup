import type { Request, Response } from "express";
import { reportsService, type CreateReportInput } from "./reports.service.js";

export const reportsController = {
  async create(req: Request, res: Response) {
    const input = req.body as CreateReportInput;
    const report = await reportsService.create(req.auth!.userId, input);
    res.status(201).json({ success: true, data: { report } });
  },
};
