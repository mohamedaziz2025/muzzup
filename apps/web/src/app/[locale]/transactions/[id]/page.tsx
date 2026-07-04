"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import type { DealPipelineStage } from "@muzzap/shared";
import { useAuthStore } from "@/stores/auth-store";
import { useDeal, useAdvanceStage, useRaiseDispute } from "@/lib/hooks/use-deal-pipeline";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STAGES: DealPipelineStage[] = [
  "loi",
  "due_diligence",
  "signature",
  "asset_transfer",
  "final_validation",
];

const STAGE_LABELS: Record<DealPipelineStage, string> = {
  loi: "Lettre d'intention",
  due_diligence: "Due diligence",
  signature: "Signature",
  asset_transfer: "Transfert des actifs",
  final_validation: "Validation finale",
};

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { data } = useDeal(id);
  const advanceStage = useAdvanceStage(id);
  const raiseDispute = useRaiseDispute(id);
  const [disputeReason, setDisputeReason] = useState("");

  if (!data) return null;
  const { deal } = data;

  const isAdmin = user?.roles.includes("admin");
  const currentIndex = STAGES.indexOf(deal.stage);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-primary">Suivi de transaction</h1>
        <Badge variant={deal.status === "frozen" ? "danger" : "cyan"}>
          {deal.status === "frozen" ? "Gelée" : deal.status === "completed" ? "Clôturée" : "Active"}
        </Badge>
      </div>

      {deal.status === "frozen" && deal.frozenReason && (
        <Card className="mt-6 border border-danger/40">
          <p className="text-sm text-danger">{deal.frozenReason}</p>
        </Card>
      )}

      <div className="mt-8 space-y-2">
        {STAGES.map((stage, i) => (
          <div
            key={stage}
            className={`flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] p-4 ${
              i <= currentIndex ? "bg-elevated" : "glass opacity-50"
            }`}
          >
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs ${
                i <= currentIndex ? "bg-success text-abyss" : "bg-muted text-abyss"
              }`}
            >
              {i + 1}
            </span>
            <span className="text-sm text-primary">{STAGE_LABELS[stage]}</span>
            {isAdmin && deal.status === "active" && i === currentIndex + 1 && (
              <Button
                size="sm"
                className="ml-auto"
                disabled={advanceStage.isPending}
                onClick={() => advanceStage.mutate(stage)}
              >
                Valider cette étape
              </Button>
            )}
          </div>
        ))}
      </div>

      {deal.status === "active" && (
        <Card className="mt-8">
          <p className="text-sm font-medium text-primary">Signaler un litige</p>
          <textarea
            rows={3}
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-4 py-3 text-sm text-primary focus:border-cyan focus:outline-none"
            placeholder="Décrivez le problème rencontré..."
          />
          <Button
            variant="secondary"
            className="mt-3"
            disabled={!disputeReason.trim() || raiseDispute.isPending}
            onClick={() => raiseDispute.mutate(disputeReason)}
          >
            Ouvrir un litige
          </Button>
        </Card>
      )}
    </div>
  );
}
