import {
  quickEstimateResultSchema,
  deepValuationOutputSchema,
  listingCoherenceOutputSchema,
  type QuickEstimateInput,
  type QuickEstimateResult,
} from "@muzzap/shared";
import { ValuationMultipleModel } from "../../models/valuation-multiple.model.js";
import { AiAnalysisModel } from "../../models/ai-analysis.model.js";
import { ListingModel } from "../../models/listing.model.js";
import { llmProvider } from "../../lib/providers/llm-provider.js";
import { logger } from "../../config/logger.js";
import { NotFoundError } from "../../lib/errors.js";

// Sensible defaults if an admin hasn't configured multiples for a type yet.
const DEFAULT_MULTIPLES: Record<string, { low: number; high: number }> = {
  fba: { low: 2.5, high: 4 },
  shopify: { low: 2, high: 3.5 },
  saas: { low: 3, high: 5 },
  content: { low: 2, high: 3 },
};

export const aiService = {
  /** Outil A (public, lead magnet): deterministic multiple-based range, no LLM call. */
  async quickEstimate(input: QuickEstimateInput): Promise<QuickEstimateResult> {
    const configured = await ValuationMultipleModel.findOne({ type: input.type }).exec();
    const { low, high } = configured
      ? { low: configured.profitMultipleLow, high: configured.profitMultipleHigh }
      : (DEFAULT_MULTIPLES[input.type] ?? { low: 2, high: 3 });

    if (input.email) {
      logger.info({ email: input.email, type: input.type }, "[Estimateur] Email capturé (lead)");
    }

    const result = {
      rangeLow: Math.max(0, Math.round(input.annualProfit * low)),
      rangeHigh: Math.max(0, Math.round(input.annualProfit * high)),
      multipleLow: low,
      multipleHigh: high,
    };
    return quickEstimateResultSchema.parse(result);
  },

  async upsertMultiple(
    type: string,
    profitMultipleLow: number,
    profitMultipleHigh: number,
    adminId: string,
  ) {
    return ValuationMultipleModel.findOneAndUpdate(
      { type },
      { type, profitMultipleLow, profitMultipleHigh, updatedBy: adminId },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).exec();
  },

  listMultiples() {
    return ValuationMultipleModel.find().sort({ type: 1 }).exec();
  },

  /** Outil B (vendeur abonné) : évaluation approfondie par IA sur l'ensemble du formulaire. */
  async deepEstimate(userId: string, listingId: string) {
    const listing = await ListingModel.findById(listingId).exec();
    if (!listing) throw new NotFoundError("Annonce introuvable");

    const prompt = `Analyse ce business à céder et propose une fourchette de valorisation indicative.

Typologie : ${listing.type}
Secteur : ${listing.sector}
Ancienneté : depuis ${listing.foundedAt.toISOString().slice(0, 10)}
Canaux d'acquisition : ${listing.acquisitionChannels.join(", ")}
CA mensuel : ${listing.financials.monthlyRevenue} €
Marge mensuelle : ${listing.financials.monthlyProfit} €
CA annuel : ${listing.financials.annualRevenue} €
Marge annuelle : ${listing.financials.annualProfit} €
Prix demandé par le vendeur : ${listing.financials.askingPrice} €
Résumé : ${listing.summary}`;

    const output = await llmProvider.completeStructured({
      system:
        "Tu es un analyste M&A spécialisé dans les petites acquisitions de business en ligne (FBA, Shopify, SaaS, sites de contenu). Tu proposes une fourchette de valorisation réaliste basée sur des multiples de marché usuels, avec une justification factuelle et concise en français. Cette estimation est indicative et sera revue par un humain avant toute décision.",
      prompt,
      schema: deepValuationOutputSchema,
    });

    const analysis = await AiAnalysisModel.create({
      type: "deep_valuation",
      listingId,
      requestedBy: userId,
      input: { listingId, financials: listing.financials },
      output,
    });

    return { analysisId: analysis._id.toString(), ...output };
  },

  /** Pré-analyse de cohérence pour l'auditeur halal (Module G ↔ Module B). */
  async analyzeListingCoherence(listingId: string, requestedBy: string) {
    const listing = await ListingModel.findById(listingId).exec();
    if (!listing) throw new NotFoundError("Annonce introuvable");

    const prompt = `Vérifie la cohérence interne des chiffres déclarés pour cette annonce de cession de business.

CA mensuel déclaré : ${listing.financials.monthlyRevenue} €
Marge mensuelle déclarée : ${listing.financials.monthlyProfit} €
CA annuel déclaré : ${listing.financials.annualRevenue} €
Marge annuelle déclarée : ${listing.financials.annualProfit} €
Prix demandé : ${listing.financials.askingPrice} €
Ancienneté : depuis ${listing.foundedAt.toISOString().slice(0, 10)}
Résumé rédigé par le vendeur : ${listing.summary}

Vérifie notamment : la cohérence mensuel × 12 ≈ annuel, la plausibilité de la marge par rapport au secteur, et tout signal d'alerte dans le résumé (promesses irréalistes, incohérences temporelles, etc.).`;

    const output = await llmProvider.completeStructured({
      system:
        "Tu assistes un auditeur halal humain dans la revue d'annonces de cession de business. Tu identifies les incohérences chiffrées et les signaux d'alerte à vérifier manuellement, sans jamais rendre de verdict final — cette responsabilité reste humaine. Réponds en français.",
      prompt,
      schema: listingCoherenceOutputSchema,
    });

    const analysis = await AiAnalysisModel.create({
      type: "listing_coherence",
      listingId,
      requestedBy,
      input: { listingId, financials: listing.financials, summary: listing.summary },
      output,
    });

    return analysis;
  },

  listForListing(listingId: string) {
    return AiAnalysisModel.find({ listingId }).sort({ createdAt: -1 }).exec();
  },

  async setHumanVerdict(
    analysisId: string,
    actorId: string,
    verdict: "confirmed" | "overridden",
    note?: string,
  ) {
    const analysis = await AiAnalysisModel.findById(analysisId).exec();
    if (!analysis) throw new NotFoundError("Analyse introuvable");
    analysis.humanVerdict = verdict;
    analysis.humanVerdictBy = actorId as unknown as NonNullable<
      typeof analysis.humanVerdictBy
    >;
    analysis.humanVerdictNote = note ?? null;
    await analysis.save();
    return analysis;
  },
};
