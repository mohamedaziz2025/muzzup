import { pathToFileURL } from "node:url";
import { connectDatabase, disconnectDatabase } from "../db/mongoose.js";
import { UserModel, type UserDocument } from "../models/user.model.js";
import { ListingModel } from "../models/listing.model.js";
import { HalalChecklistTemplateModel } from "../models/halal-checklist-template.model.js";
import { ValuationMultipleModel } from "../models/valuation-multiple.model.js";
import { ServiceProviderModel } from "../models/service-provider.model.js";
import { CmsContentModel } from "../models/cms-content.model.js";
import { hashPassword } from "../lib/password.js";
import { generatePseudonym } from "../lib/pseudonym.js";
import { logger } from "../config/logger.js";

const DEMO_PASSWORD = "Muzzap2026!Demo";

/**
 * Roles are a hierarchical access tier (see ROLE_WEIGHT in packages/shared), not a cumulable set —
 * requireRole() checks the *highest* weight held. Each demo account therefore gets exactly one
 * well-defined role; stacking "member" alongside a higher role was redundant dead weight.
 */
const DEMO_USERS = [
  {
    email: "admin@muzzap.fr",
    fullName: "Yasmine Admin",
    roles: ["admin"],
    capacities: [],
  },
  {
    email: "auditeur@muzzap.fr",
    fullName: "Karim Auditeur",
    roles: ["halal_auditor"],
    capacities: [],
  },
  {
    email: "vendeur@muzzap.fr",
    fullName: "Sofiane Vendeur",
    roles: ["subscriber"],
    capacities: ["seller"],
  },
  {
    email: "acheteur@muzzap.fr",
    fullName: "Leïla Acheteuse",
    roles: ["subscriber"],
    capacities: ["buyer"],
  },
  {
    email: "prestataire@muzzap.fr",
    fullName: "Nadia Prestataire",
    roles: ["subscriber"],
    capacities: ["provider"],
  },
] as const;

const DEFAULT_HALAL_CHECKLIST = [
  {
    key: "no_interest_based_financing",
    label: "Le business n'est pas financé par un prêt à intérêt (riba)",
    order: 1,
  },
  {
    key: "no_prohibited_products",
    label: "Aucun produit/service vendu n'est intrinsèquement haram",
    order: 2,
  },
  {
    key: "transparent_accounting",
    label: "La comptabilité présentée est transparente et vérifiable",
    order: 3,
  },
  {
    key: "no_deceptive_practices",
    label: "Aucune pratique commerciale trompeuse (gharar) n'est utilisée",
    order: 4,
  },
];

const DEFAULT_MULTIPLES = [
  { type: "fba", profitMultipleLow: 2.5, profitMultipleHigh: 4 },
  { type: "shopify", profitMultipleLow: 2, profitMultipleHigh: 3.5 },
  { type: "saas", profitMultipleLow: 3, profitMultipleHigh: 5 },
  { type: "content", profitMultipleLow: 2, profitMultipleHigh: 3 },
];

const DEMO_LISTINGS = [
  {
    type: "fba",
    title: "Boutique Amazon FBA — Accessoires de puériculture",
    summary:
      "Boutique Amazon FBA rentable depuis 3 ans dans la puériculture, marque déposée, fournisseurs fiables et avis clients excellents.",
    sector: "Puériculture",
    foundedAt: new Date("2022-03-01"),
    acquisitionChannels: ["marketplace", "social_ads"],
    financials: {
      monthlyRevenue: 22000,
      monthlyProfit: 6500,
      annualRevenue: 264000,
      annualProfit: 78000,
      askingPrice: 220000,
    },
    status: "published",
    halalVerified: true,
    isFeatured: true,
  },
  {
    type: "saas",
    title: "SaaS de facturation pour indépendants",
    summary:
      "Outil SaaS B2B de facturation et suivi de trésorerie pour freelances, MRR stable, churn maîtrisé sous 3%.",
    sector: "Logiciel B2B",
    foundedAt: new Date("2021-06-01"),
    acquisitionChannels: ["seo", "direct"],
    financials: {
      monthlyRevenue: 9000,
      monthlyProfit: 4200,
      annualRevenue: 108000,
      annualProfit: 50400,
      askingPrice: 190000,
    },
    status: "published",
    halalVerified: true,
    isFeatured: false,
  },
  {
    type: "shopify",
    title: "Boutique Shopify — Cosmétiques naturels halal",
    summary:
      "Marque de cosmétiques naturels certifiés halal, forte communauté sur les réseaux sociaux, marge brute élevée.",
    sector: "Beauté & cosmétique",
    foundedAt: new Date("2023-01-01"),
    acquisitionChannels: ["social_organic", "social_ads", "email"],
    financials: {
      monthlyRevenue: 14000,
      monthlyProfit: 3800,
      annualRevenue: 168000,
      annualProfit: 45600,
      askingPrice: 135000,
    },
    status: "submitted",
    halalVerified: false,
    isFeatured: false,
  },
] as const;

const DEFAULT_CMS_CONTENT_FR = [
  { key: "landing.hero.title", value: "Marketplace de cession de business 100% Halal" },
  { key: "landing.hero.subtitle", value: "Vérifié selon les principes de la Sharia" },
  { key: "banner.text", value: "" },
  {
    key: "legal.terms.body",
    value:
      "Conditions générales d'utilisation de MUZZUP — ce texte est un contenu de démonstration à remplacer avant mise en production.",
  },
  {
    key: "legal.privacy.body",
    value:
      "Politique de confidentialité de MUZZUP — ce texte est un contenu de démonstration à remplacer avant mise en production.",
  },
  {
    key: "faq.intro",
    value: "Retrouvez ici les réponses aux questions les plus fréquentes sur MUZZUP.",
  },
] as const;

async function upsertUser(demo: (typeof DEMO_USERS)[number]): Promise<UserDocument> {
  const existing = await UserModel.findOne({ email: demo.email }).exec();
  if (existing) {
    logger.info(`Utilisateur déjà présent : ${demo.email}`);
    return existing;
  }

  const user = await UserModel.create({
    email: demo.email,
    passwordHash: await hashPassword(DEMO_PASSWORD),
    fullName: demo.fullName,
    pseudonym: generatePseudonym(),
    roles: demo.roles,
    capacities: demo.capacities,
    emailVerifiedAt: new Date(),
  });
  logger.info(`Utilisateur créé : ${demo.email} / mot de passe : ${DEMO_PASSWORD}`);
  return user;
}

/**
 * Idempotent: every step checks for an existing record first and only creates what's missing, so
 * this is safe to call on every server start (see server.ts) as well as via `pnpm seed`.
 */
export async function seedDemoData() {
  logger.info("Démarrage du seed de démonstration...");

  const usersByEmail = new Map<string, UserDocument>();
  for (const demo of DEMO_USERS) {
    usersByEmail.set(demo.email, await upsertUser(demo));
  }

  const admin = usersByEmail.get("admin@muzzap.fr")!;
  const seller = usersByEmail.get("vendeur@muzzap.fr")!;
  const provider = usersByEmail.get("prestataire@muzzap.fr")!;

  const existingTemplate = await HalalChecklistTemplateModel.findOne({ isActive: true }).exec();
  if (!existingTemplate) {
    await HalalChecklistTemplateModel.create({
      name: "Checklist Sharia standard",
      items: DEFAULT_HALAL_CHECKLIST,
      isActive: true,
      createdBy: admin._id,
    });
    logger.info("Checklist halal par défaut créée.");
  }

  for (const multiple of DEFAULT_MULTIPLES) {
    await ValuationMultipleModel.findOneAndUpdate(
      { type: multiple.type },
      { ...multiple, updatedBy: admin._id },
      { upsert: true, setDefaultsOnInsert: true },
    ).exec();
  }
  logger.info("Multiples de valorisation par défaut configurés.");

  for (const demo of DEMO_LISTINGS) {
    const existing = await ListingModel.findOne({ title: demo.title }).exec();
    if (existing) {
      logger.info(`Annonce déjà présente : ${demo.title}`);
      continue;
    }
    await ListingModel.create({
      ...demo,
      sellerId: seller._id,
      halalSelfChecklist: Object.fromEntries(
        DEFAULT_HALAL_CHECKLIST.map((item) => [item.key, true]),
      ),
      publishedAt: demo.status === "published" ? new Date() : null,
    });
    logger.info(`Annonce créée : ${demo.title}`);
  }

  const existingProviderProfile = await ServiceProviderModel.findOne({ userId: provider._id }).exec();
  if (!existingProviderProfile) {
    await ServiceProviderModel.create({
      userId: provider._id,
      tagline: "Experte en optimisation PPC Amazon & Shopify",
      bio: "10 ans d'expérience en acquisition e-commerce, spécialisée dans l'optimisation de campagnes Amazon Ads et Shopify pour les commerçants musulmans.",
      specialties: ["PPC Amazon", "SEO Shopify", "Growth marketing"],
      pricingIndication: "À partir de 600€/mission",
      status: "published",
    });
    logger.info("Fiche prestataire de démonstration créée.");
  }

  for (const content of DEFAULT_CMS_CONTENT_FR) {
    await CmsContentModel.findOneAndUpdate(
      { key: content.key, locale: "fr" },
      { $setOnInsert: { value: content.value, updatedBy: admin._id } },
      { upsert: true, setDefaultsOnInsert: true },
    ).exec();
  }
  logger.info("Contenu CMS par défaut (fr) configuré.");

  logger.info("Seed terminé.");
}

// CLI entry point: only runs the connect/seed/disconnect/exit cycle when this file is executed
// directly (`pnpm seed`), not when seedDemoData is imported by server.ts. Compared as file URLs
// (via pathToFileURL) rather than raw path strings so this also works on Windows.
const isDirectRun = process.argv[1] != null && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  connectDatabase()
    .then(seedDemoData)
    .then(() => disconnectDatabase())
    .catch((err) => {
      logger.error({ err }, "Échec du seed");
      process.exit(1);
    });
}
