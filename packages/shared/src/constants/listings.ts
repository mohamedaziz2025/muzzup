export const LISTING_TYPES = ["fba", "shopify", "saas", "content"] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export const LISTING_STATUSES = [
  "draft",
  "submitted",
  "under_audit",
  "published",
  "sold",
  "rejected",
  "archived",
] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const ACQUISITION_CHANNELS = [
  "seo",
  "sea",
  "social_organic",
  "social_ads",
  "email",
  "marketplace",
  "affiliation",
  "direct",
  "other",
] as const;
export type AcquisitionChannel = (typeof ACQUISITION_CHANNELS)[number];

export const DEAL_PIPELINE_STAGES = [
  "loi",
  "due_diligence",
  "signature",
  "asset_transfer",
  "final_validation",
] as const;
export type DealPipelineStage = (typeof DEAL_PIPELINE_STAGES)[number];

export const BUYER_SERIOUSNESS_TIERS = ["declarative", "proof_of_funds", "kyc_enhanced"] as const;
export type BuyerSeriousnessTier = (typeof BUYER_SERIOUSNESS_TIERS)[number];

export const REVEAL_PHASES = [
  "anonymous",
  "first_name_photo",
  "full_profile",
] as const;
export type RevealPhase = (typeof REVEAL_PHASES)[number];
