"use client";

import { useState } from "react";
import {
  useAdminListings,
  useApproveListing,
  useRejectListing,
  useArchiveListing,
  useFeatureListing,
  useVerifyShariaListing,
  useDeleteListing,
  type AdminListing,
} from "@/lib/hooks/use-admin";
import { Card } from "@/components/ui/card";
import { Badge, ShariaVerifiedBadge, type BadgeProps } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DashboardSidebarShell } from "@/components/dashboard/sidebar-shell";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/admin-nav";
import { AdminGuard } from "@/components/admin/admin-guard";
import { PaginationControls } from "@/components/admin/pagination-controls";

const STATUS_OPTIONS = ["draft", "submitted", "under_audit", "published", "sold", "rejected", "archived"];
const PAGE_SIZE = 20;

const STATUS_VARIANTS: Record<string, NonNullable<BadgeProps["variant"]>> = {
  draft: "neutral",
  submitted: "warning",
  under_audit: "warning",
  published: "success",
  sold: "success",
  rejected: "danger",
  archived: "neutral",
};

function sellerLabel(sellerId: AdminListing["sellerId"]): string {
  if (typeof sellerId === "string") return sellerId;
  return sellerId.fullName ?? sellerId.email ?? sellerId._id;
}

function ListingRow({ listing }: { listing: AdminListing }) {
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const approve = useApproveListing();
  const reject = useRejectListing();
  const archive = useArchiveListing();
  const feature = useFeatureListing();
  const verifySharia = useVerifyShariaListing();
  const del = useDeleteListing();

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm text-primary">{listing.title}</p>
          <p className="mt-0.5 text-xs text-muted">
            {listing.sector} · vendeur : {sellerLabel(listing.sellerId)}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge variant={STATUS_VARIANTS[listing.status] ?? "neutral"}>{listing.status}</Badge>
            {listing.isFeatured && <Badge variant="royal">Mise en avant</Badge>}
            {listing.halalVerified && <ShariaVerifiedBadge />}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {listing.status !== "published" && (
            <Button size="sm" variant="secondary" disabled={approve.isPending} onClick={() => approve.mutate(listing._id)}>
              Approuver
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setShowReject((v) => !v)}>
            Rejeter
          </Button>
          <Button size="sm" variant="ghost" disabled={archive.isPending} onClick={() => archive.mutate(listing._id)}>
            Archiver
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={feature.isPending}
            onClick={() => feature.mutate({ id: listing._id, isFeatured: !listing.isFeatured })}
          >
            {listing.isFeatured ? "Retirer la mise en avant" : "Mettre en avant"}
          </Button>
          {!listing.halalVerified && (
            <Button size="sm" variant="gold" disabled={verifySharia.isPending} onClick={() => verifySharia.mutate(listing._id)}>
              Vérifier Sharia
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            disabled={del.isPending}
            onClick={() => {
              if (window.confirm("Supprimer définitivement cette annonce ?")) del.mutate(listing._id);
            }}
          >
            Supprimer
          </Button>
        </div>
      </div>

      {showReject && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Input placeholder="Motif du rejet" value={reason} onChange={(e) => setReason(e.target.value)} className="max-w-sm" />
          <Button
            size="sm"
            disabled={reason.length < 3 || reject.isPending}
            onClick={() => {
              reject.mutate({ id: listing._id, reason });
              setShowReject(false);
              setReason("");
            }}
          >
            Confirmer le rejet
          </Button>
        </div>
      )}
    </Card>
  );
}

function AdminListingsContent() {
  const [status, setStatus] = useState("");
  const [sector, setSector] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminListings({
    ...(status ? { status } : {}),
    ...(sector ? { sector } : {}),
    ...(search ? { q: search } : {}),
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <DashboardSidebarShell title="Back-office" items={ADMIN_SIDEBAR_ITEMS}>
      <h1 className="font-display text-3xl font-bold text-primary">Annonces</h1>

      <div className="mt-6 flex flex-wrap gap-3">
        <Input
          placeholder="Rechercher par titre..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Input
          placeholder="Secteur"
          value={sector}
          onChange={(e) => {
            setSector(e.target.value);
            setPage(1);
          }}
          className="max-w-[10rem]"
        />
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
      </div>

      <div className="mt-4 space-y-2">
        {isLoading && <p className="text-sm text-secondary">Chargement...</p>}
        {data?.listings.length === 0 && <p className="text-sm text-secondary">Aucune annonce trouvée.</p>}
        {data?.listings.map((listing) => (
          <ListingRow key={listing._id} listing={listing} />
        ))}
      </div>

      <PaginationControls
        className="mt-6"
        page={page}
        hasMore={(data?.listings.length ?? 0) >= PAGE_SIZE}
        onPageChange={setPage}
      />
    </DashboardSidebarShell>
  );
}

export default function AdminListingsPage() {
  return (
    <AdminGuard>
      <AdminListingsContent />
    </AdminGuard>
  );
}
