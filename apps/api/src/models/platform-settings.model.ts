import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

// Singleton pattern: the service layer always reads/writes with an empty `{}` filter, so exactly
// one document ever exists. No secrets live here by design — see platform-settings.service.ts.
const platformSettingsSchema = new Schema(
  {
    commissionRate: { type: Number, default: 0.05, min: 0, max: 1 },
    currencies: { type: [String], default: ["EUR"] },
    countries: { type: [String], default: ["FR", "BE", "CH", "MA", "TN", "DZ"] },
    languages: { type: [String], default: ["fr", "en", "ar"] },
    registrationOpen: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: "" },
    supportEmail: { type: String, default: "support@muzzap.fr" },
  },
  { timestamps: true },
);

export type PlatformSettingsDocument = HydratedDocument<InferSchemaType<typeof platformSettingsSchema>>;

export const PlatformSettingsModel = model("PlatformSettings", platformSettingsSchema);
