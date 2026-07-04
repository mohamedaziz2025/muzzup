"use client";

import { useState } from "react";
import { ListChecks } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import {
  useAuditQueue,
  useMyAudits,
  useClaimAudit,
  useUpdateAuditItems,
  useCompleteAudit,
  type HalalAudit,
} from "@/lib/hooks/use-halal-audits";
import { useListingAiAnalyses } from "@/lib/hooks/use-ai";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardSidebarShell, type SidebarItem } from "@/components/dashboard/sidebar-shell";

const SIDEBAR_ITEMS: SidebarItem[] = [
  { href: "/auditeur", label: "File d'attente", icon: <ListChecks className="size-4" /> },
];

function listingTitle(audit: HalalAudit): string {
  return typeof audit.listingId === "string" ? audit.listingId : audit.listingId.title;
}

function listingIdOf(audit: HalalAudit): string {
  return typeof audit.listingId === "string" ? audit.listingId : audit.listingId._id;
}

function AiCoherencePanel({ listingId }: { listingId: string }) {
  const { data } = useListingAiAnalyses(listingId, true);
  const coherence = data?.analyses.find((a) => a.type === "listing_coherence");
  if (!coherence) return null;

  const output = coherence.output as { coherenceScore: number; concerns: string[]; summary: string };

  return (
    <Card className="mt-4 border border-cyan/30">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-primary">Pré-analyse IA de cohérence</p>
        <Badge variant={output.coherenceScore >= 70 ? "success" : "warning"}>
          Score {output.coherenceScore}/100
        </Badge>
      </div>
      <p className="mt-2 text-sm text-secondary">{output.summary}</p>
      {output.concerns.length > 0 && (
        <ul className="mt-2 list-inside list-disc text-sm text-warning">
          {output.concerns.map((concern) => (
            <li key={concern}>{concern}</li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-muted">
        Généré par IA — à vérifier avant décision. L&apos;IA prépare, l&apos;humain valide.
      </p>
    </Card>
  );
}

function AuditReviewPanel({ audit }: { audit: HalalAudit }) {
  const [items, setItems] = useState(audit.items);
  const [vigilancePoints, setVigilancePoints] = useState("");
  const [reportSummary, setReportSummary] = useState("");
  const updateItems = useUpdateAuditItems(audit._id);
  const completeAudit = useCompleteAudit(audit._id);

  function toggleItem(key: string, passed: boolean) {
    const next = items.map((item) => (item.key === key ? { ...item, passed } : item));
    setItems(next);
    updateItems.mutate(next.map((i) => ({ key: i.key, passed: !!i.passed, note: i.note })));
  }

  const allPassed = items.every((item) => item.passed === true);

  return (
    <>
      <AiCoherencePanel listingId={listingIdOf(audit)} />
      <Card className="mt-4">
      <CardTitle>{listingTitle(audit)}</CardTitle>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.key} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <span className="text-sm text-secondary">{item.label}</span>
            <div className="flex gap-2">
              <button
                onClick={() => toggleItem(item.key, true)}
                className={`rounded-full px-3 py-1 text-xs ${item.passed === true ? "bg-success/20 text-success" : "bg-elevated text-muted"}`}
              >
                Conforme
              </button>
              <button
                onClick={() => toggleItem(item.key, false)}
                className={`rounded-full px-3 py-1 text-xs ${item.passed === false ? "bg-danger/20 text-danger" : "bg-elevated text-muted"}`}
              >
                Non conforme
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <label className="mb-1.5 block text-sm font-medium text-secondary">
          Points de vigilance (un par ligne)
        </label>
        <textarea
          rows={2}
          value={vigilancePoints}
          onChange={(e) => setVigilancePoints(e.target.value)}
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-4 py-3 text-sm text-primary focus:border-cyan focus:outline-none"
        />
      </div>
      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-secondary">
          Synthèse du rapport
        </label>
        <textarea
          rows={3}
          value={reportSummary}
          onChange={(e) => setReportSummary(e.target.value)}
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-4 py-3 text-sm text-primary focus:border-cyan focus:outline-none"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          variant="gold"
          disabled={!allPassed || completeAudit.isPending}
          onClick={() =>
            completeAudit.mutate({
              decision: "approved",
              vigilancePoints: vigilancePoints.split("\n").filter(Boolean),
              reportSummary,
            })
          }
        >
          Approuver — Sharia Vérifié
        </Button>
        <Button
          variant="secondary"
          disabled={!reportSummary || completeAudit.isPending}
          onClick={() =>
            completeAudit.mutate({
              decision: "rejected",
              vigilancePoints: vigilancePoints.split("\n").filter(Boolean),
              reportSummary,
            })
          }
        >
          Rejeter
        </Button>
      </div>
      </Card>
    </>
  );
}

export default function AuditorPage() {
  const { user } = useAuthStore();
  const { data: queueData } = useAuditQueue();
  const { data: mineData } = useMyAudits();
  const claimAudit = useClaimAudit();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!user?.roles.includes("halal_auditor") && !user?.roles.includes("admin")) {
    return (
      <p className="mx-auto max-w-2xl px-6 py-16 text-secondary">
        Cet espace est réservé aux auditeurs halal.
      </p>
    );
  }

  const selected = mineData?.audits.find((a) => a._id === selectedId);

  return (
    <DashboardSidebarShell title="Espace auditeur" items={SIDEBAR_ITEMS}>
      <h1 className="font-display text-3xl font-bold text-primary">Espace auditeur halal</h1>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-display text-xl font-semibold text-primary">
            File d&apos;attente ({queueData?.audits.length ?? 0})
          </h2>
          <div className="mt-4 space-y-3">
            {queueData?.audits.map((audit) => (
              <Card key={audit._id} className="flex flex-wrap items-center justify-between gap-2">
                <span className="truncate text-sm text-primary">{listingTitle(audit)}</span>
                <Button size="sm" disabled={claimAudit.isPending} onClick={() => claimAudit.mutate(audit._id)}>
                  Prendre en charge
                </Button>
              </Card>
            ))}
            {queueData?.audits.length === 0 && (
              <p className="text-sm text-secondary">Aucune annonce en attente.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-primary">Mes audits en cours</h2>
          <div className="mt-4 space-y-3">
            {mineData?.audits.map((audit) => (
              <Card
                key={audit._id}
                className="cursor-pointer"
                onClick={() => setSelectedId(audit._id)}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="truncate text-sm text-primary">{listingTitle(audit)}</span>
                  <Badge variant="warning">En cours</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {selected && <AuditReviewPanel audit={selected} />}
    </DashboardSidebarShell>
  );
}
