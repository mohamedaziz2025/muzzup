"use client";

import { useState } from "react";
import { useAdminReports, useResolveReport, type AdminReport } from "@/lib/hooks/use-admin";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DashboardSidebarShell } from "@/components/dashboard/sidebar-shell";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/admin-nav";
import { AdminGuard } from "@/components/admin/admin-guard";
import { PaginationControls } from "@/components/admin/pagination-controls";

const STATUS_OPTIONS = ["open", "resolved", "dismissed"];
const TARGET_TYPE_OPTIONS = ["user", "listing", "message", "conversation"];
const PAGE_SIZE = 20;

const STATUS_VARIANTS: Record<string, NonNullable<BadgeProps["variant"]>> = {
  open: "warning",
  resolved: "success",
  dismissed: "neutral",
};

function reporterLabel(reporterId: AdminReport["reporterId"]): string {
  return typeof reporterId === "string" ? reporterId : (reporterId.fullName ?? reporterId.email);
}

function ReportRow({ report }: { report: AdminReport }) {
  const [showNote, setShowNote] = useState<"resolve" | "dismiss" | null>(null);
  const [note, setNote] = useState("");
  const resolve = useResolveReport();

  function submit(action: "resolve" | "dismiss") {
    resolve.mutate({ id: report._id, action, ...(note ? { note } : {}) });
    setShowNote(null);
    setNote("");
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm text-primary">
            {report.reason} <span className="text-muted">({report.targetType})</span>
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Signalé par {reporterLabel(report.reporterId)} · cible {report.targetId}
          </p>
          {report.details && <p className="mt-1 text-sm text-secondary">{report.details}</p>}
          {report.resolutionNote && (
            <p className="mt-1 text-xs text-muted">Note de résolution : {report.resolutionNote}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={STATUS_VARIANTS[report.status] ?? "neutral"}>{report.status}</Badge>
          {report.status === "open" && (
            <>
              <Button size="sm" variant="secondary" onClick={() => setShowNote(showNote === "resolve" ? null : "resolve")}>
                Résoudre
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowNote(showNote === "dismiss" ? null : "dismiss")}>
                Rejeter
              </Button>
            </>
          )}
        </div>
      </div>

      {showNote && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Input
            placeholder="Note (optionnelle)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="max-w-sm"
          />
          <Button size="sm" disabled={resolve.isPending} onClick={() => submit(showNote)}>
            Confirmer
          </Button>
        </div>
      )}
    </Card>
  );
}

function AdminReportsContent() {
  const [status, setStatus] = useState("");
  const [targetType, setTargetType] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminReports({
    ...(status ? { status } : {}),
    ...(targetType ? { targetType } : {}),
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <DashboardSidebarShell title="Back-office" items={ADMIN_SIDEBAR_ITEMS}>
      <h1 className="font-display text-3xl font-bold text-primary">Signalements</h1>

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
          value={targetType}
          onChange={(e) => {
            setTargetType(e.target.value);
            setPage(1);
          }}
          className="h-11 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-3 text-sm text-primary"
        >
          <option value="">Toutes les cibles</option>
          {TARGET_TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-2">
        {isLoading && <p className="text-sm text-secondary">Chargement...</p>}
        {data?.reports.length === 0 && <p className="text-sm text-secondary">Aucun signalement trouvé.</p>}
        {data?.reports.map((report) => (
          <ReportRow key={report._id} report={report} />
        ))}
      </div>

      <PaginationControls
        className="mt-6"
        page={page}
        hasMore={(data?.reports.length ?? 0) >= PAGE_SIZE}
        onPageChange={setPage}
      />
    </DashboardSidebarShell>
  );
}

export default function AdminReportsPage() {
  return (
    <AdminGuard>
      <AdminReportsContent />
    </AdminGuard>
  );
}
