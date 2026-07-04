"use client";

import { useState } from "react";
import {
  useAdminHalalAudits,
  useAdminHalalAudit,
  useCommentHalalAudit,
  type AdminHalalAuditListItem,
} from "@/lib/hooks/use-admin";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DashboardSidebarShell } from "@/components/dashboard/sidebar-shell";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/admin-nav";
import { AdminGuard } from "@/components/admin/admin-guard";
import { PaginationControls } from "@/components/admin/pagination-controls";

const STATUS_OPTIONS = ["queued", "in_progress", "completed"];
const PAGE_SIZE = 20;

const STATUS_VARIANTS: Record<string, NonNullable<BadgeProps["variant"]>> = {
  queued: "warning",
  in_progress: "cyan",
  completed: "success",
};

function listingLabel(listingId: AdminHalalAuditListItem["audit"]["listingId"]): string {
  return typeof listingId === "string" ? listingId : listingId.title;
}

function auditorLabel(auditorId: AdminHalalAuditListItem["audit"]["auditorId"]): string {
  if (!auditorId) return "Non assigné";
  return typeof auditorId === "string" ? auditorId : auditorId.fullName;
}

function AuditDetail({ auditId }: { auditId: string }) {
  const { data, isLoading } = useAdminHalalAudit(auditId);
  const [comment, setComment] = useState("");
  const addComment = useCommentHalalAudit(auditId);

  if (isLoading) return <p className="mt-3 text-sm text-secondary">Chargement du dossier...</p>;
  if (!data) return null;

  const { audit, aiAnalysis } = data;

  return (
    <div className="mt-4 space-y-4 border-t border-[var(--border-subtle)] pt-4">
      <div>
        <p className="text-sm font-medium text-primary">Checklist</p>
        <div className="mt-2 space-y-1.5">
          {audit.items.map((item) => (
            <div key={item.key} className="flex items-center justify-between text-sm">
              <span className="text-secondary">{item.label}</span>
              <Badge variant={item.passed === true ? "success" : item.passed === false ? "danger" : "neutral"}>
                {item.passed === true ? "Conforme" : item.passed === false ? "Non conforme" : "En attente"}
              </Badge>
            </div>
          ))}
          {audit.items.length === 0 && <p className="text-sm text-muted">Aucun élément.</p>}
        </div>
      </div>

      {audit.vigilancePoints.length > 0 && (
        <div>
          <p className="text-sm font-medium text-primary">Points de vigilance</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-secondary">
            {audit.vigilancePoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {audit.reportSummary && (
        <div>
          <p className="text-sm font-medium text-primary">Synthèse</p>
          <p className="mt-1 text-sm text-secondary">{audit.reportSummary}</p>
        </div>
      )}

      {aiAnalysis && (
        <div>
          <p className="text-sm font-medium text-primary">Analyse IA ({aiAnalysis.type})</p>
          <pre className="mt-2 max-h-64 overflow-auto rounded-[var(--radius-md)] bg-abyss/60 p-3 text-xs text-secondary">
            {JSON.stringify(aiAnalysis.output, null, 2)}
          </pre>
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-primary">Journal</p>
        <div className="mt-2 space-y-1">
          {audit.journal.map((entry, i) => (
            <p key={i} className="text-xs text-muted">
              {entry.action} · {new Date(entry.at).toLocaleString("fr-FR")}
              {entry.metadata?.text ? ` — ${String(entry.metadata.text)}` : ""}
            </p>
          ))}
          {audit.journal.length === 0 && <p className="text-xs text-muted">Aucun événement.</p>}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-primary">Ajouter un commentaire</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Input value={comment} onChange={(e) => setComment(e.target.value)} className="max-w-md" />
          <Button
            size="sm"
            disabled={comment.trim().length === 0 || addComment.isPending}
            onClick={() => {
              addComment.mutate(comment, { onSuccess: () => setComment("") });
            }}
          >
            Envoyer
          </Button>
        </div>
      </div>
    </div>
  );
}

function AuditRow({ item }: { item: AdminHalalAuditListItem }) {
  const [expanded, setExpanded] = useState(false);
  const { audit } = item;

  return (
    <Card>
      <button type="button" className="flex w-full flex-wrap items-center justify-between gap-2 text-left" onClick={() => setExpanded((v) => !v)}>
        <div>
          <p className="text-sm text-primary">{listingLabel(audit.listingId)}</p>
          <p className="mt-0.5 text-xs text-muted">Auditeur : {auditorLabel(audit.auditorId)}</p>
        </div>
        <Badge variant={STATUS_VARIANTS[audit.status] ?? "neutral"}>{audit.status}</Badge>
      </button>
      {expanded && <AuditDetail auditId={audit._id} />}
    </Card>
  );
}

function AdminShariaContent() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminHalalAudits({ ...(status ? { status } : {}), page, pageSize: PAGE_SIZE });

  return (
    <DashboardSidebarShell title="Back-office" items={ADMIN_SIDEBAR_ITEMS}>
      <h1 className="font-display text-3xl font-bold text-primary">Espace Sharia</h1>
      <p className="mt-1 text-secondary">Suivi des audits de conformité halal</p>

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
      </div>

      <div className="mt-4 space-y-2">
        {isLoading && <p className="text-sm text-secondary">Chargement...</p>}
        {data?.audits.length === 0 && <p className="text-sm text-secondary">Aucun audit trouvé.</p>}
        {data?.audits.map((item) => (
          <AuditRow key={item.audit._id} item={item} />
        ))}
      </div>

      <PaginationControls
        className="mt-6"
        page={page}
        hasMore={(data?.audits.length ?? 0) >= PAGE_SIZE}
        onPageChange={setPage}
      />
    </DashboardSidebarShell>
  );
}

export default function AdminShariaPage() {
  return (
    <AdminGuard>
      <AdminShariaContent />
    </AdminGuard>
  );
}
