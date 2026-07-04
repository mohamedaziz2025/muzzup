"use client";

import { useState } from "react";
import { useAdminDeals, useSetDealPrice, type AdminDealListItem, type AdminDeal } from "@/lib/hooks/use-admin";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DashboardSidebarShell } from "@/components/dashboard/sidebar-shell";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/admin-nav";
import { AdminGuard } from "@/components/admin/admin-guard";
import { PaginationControls } from "@/components/admin/pagination-controls";

const STAGE_OPTIONS = ["loi", "due_diligence", "signature", "asset_transfer", "final_validation"];
const STATUS_OPTIONS = ["active", "frozen", "completed", "cancelled"];
const PAGE_SIZE = 20;

const STATUS_VARIANTS: Record<string, NonNullable<BadgeProps["variant"]>> = {
  active: "cyan",
  frozen: "warning",
  completed: "success",
  cancelled: "danger",
};

function refLabel(ref: AdminDeal["listingId"] | AdminDeal["buyerId"]): string {
  if (typeof ref === "string") return ref;
  return "title" in ref ? ref.title : (ref.fullName ?? ref.email ?? ref._id);
}

function formatEur(value: number): string {
  return `${value.toLocaleString("fr-FR")} €`;
}

function DealRow({ item }: { item: AdminDealListItem }) {
  const { deal, commission } = item;
  const [price, setPrice] = useState(deal.agreedPrice != null ? String(deal.agreedPrice) : "");
  const setDealPrice = useSetDealPrice();

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm text-primary">{refLabel(deal.listingId)}</p>
          <p className="mt-0.5 text-xs text-muted">
            Acheteur : {refLabel(deal.buyerId)} · Vendeur : {refLabel(deal.sellerId)}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge variant="neutral">{deal.stage}</Badge>
            <Badge variant={STATUS_VARIANTS[deal.status] ?? "neutral"}>{deal.status}</Badge>
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="text-secondary">
            Prix convenu : {deal.agreedPrice != null ? formatEur(deal.agreedPrice) : "—"}
          </p>
          <p className="text-muted">Commission : {commission != null ? formatEur(Math.round(commission)) : "—"}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Input
          type="number"
          min={0}
          placeholder="Nouveau prix convenu (€)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="max-w-xs"
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={price === "" || Number(price) < 0 || setDealPrice.isPending}
          onClick={() => setDealPrice.mutate({ id: deal._id, agreedPrice: Number(price) })}
        >
          Enregistrer le prix
        </Button>
      </div>
    </Card>
  );
}

function AdminTransactionsContent() {
  const [status, setStatus] = useState("");
  const [stage, setStage] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminDeals({
    ...(status ? { status } : {}),
    ...(stage ? { stage } : {}),
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <DashboardSidebarShell title="Back-office" items={ADMIN_SIDEBAR_ITEMS}>
      <h1 className="font-display text-3xl font-bold text-primary">Transactions</h1>

      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-11 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-3 text-sm text-primary"
        >
          <option value="">Tous les statuts</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={stage}
          onChange={(e) => {
            setStage(e.target.value);
            setPage(1);
          }}
          className="h-11 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-3 text-sm text-primary"
        >
          <option value="">Toutes les étapes</option>
          {STAGE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-2">
        {isLoading && <p className="text-sm text-secondary">Chargement...</p>}
        {data?.deals.length === 0 && <p className="text-sm text-secondary">Aucune transaction trouvée.</p>}
        {data?.deals.map((item) => (
          <DealRow key={item.deal._id} item={item} />
        ))}
      </div>

      <PaginationControls
        className="mt-6"
        page={page}
        hasMore={(data?.deals.length ?? 0) >= PAGE_SIZE}
        onPageChange={setPage}
      />
    </DashboardSidebarShell>
  );
}

export default function AdminTransactionsPage() {
  return (
    <AdminGuard>
      <AdminTransactionsContent />
    </AdminGuard>
  );
}
