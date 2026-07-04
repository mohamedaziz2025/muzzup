import { ReportModel, type ReportTargetType } from "../../models/report.model.js";
import { NotFoundError } from "../../lib/errors.js";

export interface CreateReportInput {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string | undefined;
}

export const reportsService = {
  async create(reporterId: string, input: CreateReportInput) {
    return ReportModel.create({
      reporterId,
      targetType: input.targetType,
      targetId: input.targetId,
      reason: input.reason,
      details: input.details ?? "",
    });
  },

  async list(query: {
    status: string | undefined;
    targetType: string | undefined;
    page: number;
    pageSize: number;
  }) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.targetType) filter.targetType = query.targetType;

    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await Promise.all([
      ReportModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.pageSize)
        .populate("reporterId", "fullName email")
        .exec(),
      ReportModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  async resolve(
    reportId: string,
    actorId: string,
    action: "resolve" | "dismiss",
    note: string | undefined,
  ) {
    const report = await ReportModel.findById(reportId).exec();
    if (!report) throw new NotFoundError("Signalement introuvable");

    report.status = action === "resolve" ? "resolved" : "dismissed";
    report.resolvedBy = actorId as unknown as NonNullable<typeof report.resolvedBy>;
    report.resolvedAt = new Date();
    report.resolutionNote = note ?? null;
    await report.save();
    return report;
  },
};
