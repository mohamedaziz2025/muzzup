"use client";

import { useState } from "react";
import type { ListingType, AcquisitionChannel } from "@muzzap/shared";
import { useCreateListing, useSubmitListing } from "@/lib/hooks/use-listings";
import { useDeepEstimate } from "@/lib/hooks/use-ai";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DocumentUpload, type UploadedDoc } from "@/components/listings/document-upload";
import { useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api-client";

const STEPS = [
  "Type & description",
  "Chiffres clés",
  "Documents justificatifs",
  "Checklist Sharia",
] as const;

const TYPE_OPTIONS: { value: ListingType; label: string }[] = [
  { value: "fba", label: "Amazon FBA" },
  { value: "shopify", label: "Shopify" },
  { value: "saas", label: "SaaS" },
  { value: "content", label: "Site de contenu / affiliation" },
];

const CHANNEL_OPTIONS: { value: AcquisitionChannel; label: string }[] = [
  { value: "seo", label: "SEO" },
  { value: "sea", label: "SEA" },
  { value: "social_organic", label: "Réseaux sociaux (organique)" },
  { value: "social_ads", label: "Réseaux sociaux (publicité)" },
  { value: "email", label: "Email marketing" },
  { value: "marketplace", label: "Marketplace" },
  { value: "affiliation", label: "Affiliation" },
  { value: "direct", label: "Trafic direct" },
  { value: "other", label: "Autre" },
];

const HALAL_CHECKLIST_ITEMS = [
  { key: "no_interest_based_financing", label: "Le business n'est pas financé par un prêt à intérêt (riba)." },
  { key: "no_prohibited_products", label: "Aucun produit/service vendu n'est intrinsèquement haram (alcool, jeux d'argent, etc.)." },
  { key: "transparent_accounting", label: "La comptabilité présentée est transparente et vérifiable." },
  { key: "no_deceptive_practices", label: "Aucune pratique commerciale trompeuse (gharar) n'est utilisée." },
];

export default function SellListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const createListing = useCreateListing();
  const submitListing = useSubmitListing();
  const deepEstimate = useDeepEstimate();
  const [createdId, setCreatedId] = useState<string | null>(null);

  const [type, setType] = useState<ListingType>("fba");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [sector, setSector] = useState("");
  const [foundedAt, setFoundedAt] = useState("");
  const [channels, setChannels] = useState<AcquisitionChannel[]>([]);

  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [monthlyProfit, setMonthlyProfit] = useState("");
  const [annualRevenue, setAnnualRevenue] = useState("");
  const [annualProfit, setAnnualProfit] = useState("");
  const [askingPrice, setAskingPrice] = useState("");

  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [docs, setDocs] = useState<UploadedDoc[]>([]);

  function toggleChannel(value: AcquisitionChannel) {
    setChannels((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value],
    );
  }

  async function handleSaveDraft() {
    const result = await createListing.mutateAsync({
      type,
      title,
      summary,
      sector,
      foundedAt: new Date(foundedAt),
      acquisitionChannels: channels,
      financials: {
        monthlyRevenue: Number(monthlyRevenue),
        monthlyProfit: Number(monthlyProfit),
        annualRevenue: Number(annualRevenue),
        annualProfit: Number(annualProfit),
        askingPrice: Number(askingPrice),
      },
      halalSelfChecklist: checklist,
    });
    setCreatedId(result.listing.id);
    return result.listing.id;
  }

  async function ensureListingId() {
    return createdId ?? (await handleSaveDraft());
  }

  async function handleSubmit() {
    const id = await ensureListingId();
    await submitListing.mutateAsync(id);
    router.push("/tableau-de-bord");
  }

  const allChecked = HALAL_CHECKLIST_ITEMS.every((item) => checklist[item.key]);
  const hasBlockingDocs = docs.some((d) => d.status === "uploading" || d.status === "rejected" || d.status === "error");
  const isPending = createListing.isPending || submitListing.isPending;
  const mutationError = createListing.error ?? submitListing.error;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-primary">Déposer une annonce</h1>
      <p className="mt-2 text-secondary">
        Décrivez votre business. Il sera examiné par notre équipe d&apos;audit avant publication.
      </p>

      <div className="mt-8 flex gap-2">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`flex-1 rounded-full px-2 py-2 text-center text-[11px] font-medium sm:px-3 sm:text-xs ${
              i === step ? "bg-royal text-on-accent" : i < step ? "bg-success/20 text-success" : "bg-elevated text-muted"
            }`}
          >
            <span className="sm:hidden">{i + 1}</span>
            <span className="hidden sm:inline">{label}</span>
          </div>
        ))}
      </div>

      <Card className="mt-6">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Typologie</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as ListingType)}
                className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-3 text-sm text-primary"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="title">Titre de l&apos;annonce</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} minLength={10} />
            </div>
            <div>
              <Label htmlFor="summary">Résumé</Label>
              <textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                minLength={50}
                rows={4}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-4 py-3 text-sm text-primary placeholder:text-muted focus:border-cyan focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="sector">Secteur</Label>
                <Input id="sector" value={sector} onChange={(e) => setSector(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="foundedAt">Date de création</Label>
                <Input
                  id="foundedAt"
                  type="date"
                  value={foundedAt}
                  onChange={(e) => setFoundedAt(e.target.value)}
                  min="1900-01-01"
                  max={new Date().toISOString().slice(0, 10)}
                />
              </div>
            </div>
            <div>
              <Label>Canaux d&apos;acquisition</Label>
              <div className="flex flex-wrap gap-2">
                {CHANNEL_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => toggleChannel(opt.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs ${
                      channels.includes(opt.value)
                        ? "border-cyan bg-cyan/15 text-cyan"
                        : "border-[var(--border-subtle)] text-secondary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="monthlyRevenue">CA mensuel (€)</Label>
              <Input id="monthlyRevenue" type="number" value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="monthlyProfit">Marge mensuelle (€)</Label>
              <Input id="monthlyProfit" type="number" value={monthlyProfit} onChange={(e) => setMonthlyProfit(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="annualRevenue">CA annuel (€)</Label>
              <Input id="annualRevenue" type="number" value={annualRevenue} onChange={(e) => setAnnualRevenue(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="annualProfit">Marge annuelle (€)</Label>
              <Input id="annualProfit" type="number" value={annualProfit} onChange={(e) => setAnnualProfit(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="askingPrice">Prix de cession souhaité (€)</Label>
              <Input id="askingPrice" type="number" value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} />
            </div>

            <div className="sm:col-span-2 border-t border-[var(--border-subtle)] pt-4">
              <Button
                type="button"
                variant="gold"
                size="sm"
                disabled={deepEstimate.isPending}
                onClick={async () => {
                  const id = await ensureListingId();
                  deepEstimate.mutate(id);
                }}
              >
                {deepEstimate.isPending ? "Analyse en cours..." : "Évaluation approfondie par IA"}
              </Button>
              {deepEstimate.data && (
                <div className="mt-4 rounded-[var(--radius-md)] border border-gold/30 bg-gold/10 p-4">
                  <p className="font-mono text-xl text-gold">
                    {deepEstimate.data.rangeLow.toLocaleString("fr-FR")} € –{" "}
                    {deepEstimate.data.rangeHigh.toLocaleString("fr-FR")} €
                  </p>
                  <p className="mt-2 text-sm text-secondary">{deepEstimate.data.justification}</p>
                  <ul className="mt-2 list-inside list-disc text-sm text-muted">
                    {deepEstimate.data.keyFactors.map((factor) => (
                      <li key={factor}>{factor}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-muted">{deepEstimate.data.confidenceNote}</p>
                  <p className="mt-3 text-xs text-warning">
                    Estimation indicative générée par IA — sera revue par notre équipe, ne
                    constitue pas un engagement.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-4 text-sm text-secondary">
              Ajoutez vos pièces justificatives (relevés financiers, contrats, captures d&apos;écran
              de vos tableaux de bord). Facultatif, mais accélère l&apos;audit.
            </p>
            <DocumentUpload ensureListingId={ensureListingId} onDocsChange={setDocs} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-secondary">
              Cette checklist déclarative doit être entièrement validée avant soumission. Elle
              sera vérifiée par notre auditeur halal après dépôt.
            </p>
            {HALAL_CHECKLIST_ITEMS.map((item) => (
              <label key={item.key} className="flex items-start gap-3 text-sm text-secondary">
                <input
                  type="checkbox"
                  checked={!!checklist[item.key]}
                  onChange={(e) =>
                    setChecklist((prev) => ({ ...prev, [item.key]: e.target.checked }))
                  }
                  className="mt-1"
                />
                {item.label}
              </label>
            ))}
          </div>
        )}

        {mutationError && (
          <p className="mt-4 text-sm text-danger">
            {mutationError instanceof ApiError ? mutationError.message : "Une erreur est survenue"}
          </p>
        )}

        {step === STEPS.length - 1 && hasBlockingDocs && (
          <p className="mt-4 text-sm text-warning">
            Un document est encore en cours d&apos;analyse, en erreur ou rejeté — retirez-le ou
            attendez la fin de l&apos;analyse avant de soumettre.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            variant="ghost"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="order-3 sm:order-1"
          >
            Précédent
          </Button>
          <div className="order-1 flex flex-col gap-3 sm:order-2 sm:flex-row">
            <Button variant="secondary" disabled={isPending} onClick={handleSaveDraft}>
              Enregistrer le brouillon
            </Button>
            {step < STEPS.length - 1 ? (
              <Button className="glow-royal-hover" onClick={() => setStep((s) => s + 1)}>
                Suivant
              </Button>
            ) : (
              <Button
                className="glow-royal-hover"
                disabled={!allChecked || isPending || hasBlockingDocs}
                onClick={handleSubmit}
              >
                {isPending ? "Envoi..." : "Soumettre pour audit"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
