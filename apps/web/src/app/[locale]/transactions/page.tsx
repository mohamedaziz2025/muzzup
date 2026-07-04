"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useMyDeals } from "@/lib/hooks/use-deal-pipeline";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { DealPipeline } from "@/lib/hooks/use-deal-pipeline";

const STAGE_LABELS: Record<string, string> = {
  loi: "Lettre d'intention",
  due_diligence: "Due diligence",
  signature: "Signature",
  asset_transfer: "Transfert des actifs",
  final_validation: "Validation finale",
};

function dealTitle(deal: DealPipeline): string {
  return typeof deal.listingId === "string" ? deal.listingId : deal.listingId.title;
}

export default function TransactionsPage() {
  const { user } = useAuthStore();
  const { data } = useMyDeals();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-primary">Mes transactions</h1>
      <p className="mt-2 text-secondary">
        Suivi du pipeline LOI → Due diligence → Signature → Transfert → Validation finale.
      </p>

      <div className="mt-8 space-y-3">
        {data?.deals.map((deal) => (
          <Link key={deal._id} href={`/transactions/${deal._id}`}>
            <Card className="glow-royal-hover cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{dealTitle(deal)}</CardTitle>
                  <CardDescription className="mt-1">{STAGE_LABELS[deal.stage]}</CardDescription>
                </div>
                <Badge variant={deal.status === "frozen" ? "danger" : "cyan"}>
                  {deal.status === "frozen" ? "Gelée" : deal.status === "completed" ? "Clôturée" : "Active"}
                </Badge>
              </div>
            </Card>
          </Link>
        ))}
        {data?.deals.length === 0 && (
          <p className="text-sm text-secondary">Aucune transaction en cours.</p>
        )}
      </div>
    </div>
  );
}
