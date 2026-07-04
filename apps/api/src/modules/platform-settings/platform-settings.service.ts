import { PlatformSettingsModel } from "../../models/platform-settings.model.js";
import { AuditLogModel } from "../../models/audit-log.model.js";

const DEFAULT_COMMISSION_RATE = 0.05;

export interface PlatformSettingsPatch {
  commissionRate?: number;
  currencies?: string[];
  countries?: string[];
  languages?: string[];
  registrationOpen?: boolean;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  supportEmail?: string;
}

export const platformSettingsService = {
  /** Always resolves to the single settings document, creating it with schema defaults on first read. */
  async getSettings() {
    const existing = await PlatformSettingsModel.findOne({}).exec();
    if (existing) return existing;
    return PlatformSettingsModel.create({});
  },

  async updateSettings(patch: PlatformSettingsPatch, actorId: string) {
    const settings = await PlatformSettingsModel.findOneAndUpdate(
      {},
      { $set: patch },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).exec();

    await AuditLogModel.create({
      actorId,
      action: "admin.settings_updated",
      targetType: "PlatformSettings",
      targetId: settings._id,
      metadata: { changed: Object.keys(patch) },
    });

    return settings;
  },

  /** Cheap read used by other services (e.g. commission math) that only need the rate. */
  async getCommissionRate(): Promise<number> {
    const settings = await PlatformSettingsModel.findOne({}).select("commissionRate").exec();
    return settings?.commissionRate ?? DEFAULT_COMMISSION_RATE;
  },
};
