"use client";

import { useState } from "react";
import { useAdminLogs } from "@/lib/hooks/use-admin";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { DashboardSidebarShell } from "@/components/dashboard/sidebar-shell";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/admin-nav";
import { AdminGuard } from "@/components/admin/admin-guard";
import { PaginationControls } from "@/components/admin/pagination-controls";

const PAGE_SIZE = 50;

function AdminLogsContent() {
  const [action, setAction] = useState("");
  const [actorId, setActorId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminLogs({
    ...(action ? { action } : {}),
    ...(actorId ? { actorId } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <DashboardSidebarShell title="Back-office" items={ADMIN_SIDEBAR_ITEMS}>
      <h1 className="font-display text-3xl font-bold text-primary">Logs d&apos;audit</h1>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>Action (préfixe)</Label>
          <Input
            placeholder="ex: admin.user"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div>
          <Label>ID acteur</Label>
          <Input
            value={actorId}
            onChange={(e) => {
              setActorId(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div>
          <Label>Depuis</Label>
          <Input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div>
          <Label>Jusqu&apos;au</Label>
          <Input
            type="date"
            value={to}
            min={from || undefined}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {isLoading && <p className="text-sm text-secondary">Chargement...</p>}
        {data?.logs.length === 0 && <p className="text-sm text-secondary">Aucun événement trouvé.</p>}
        {data?.logs.map((entry) => (
          <Card key={entry._id}>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-primary">{entry.action}</span>
              <span className="text-xs text-muted">{new Date(entry.createdAt).toLocaleString("fr-FR")}</span>
            </div>
            <p className="mt-1 text-xs text-secondary">
              {entry.targetType ? `${entry.targetType} · ${entry.targetId}` : "—"}
              {entry.actorId && typeof entry.actorId === "object" && ` · par ${entry.actorId.fullName}`}
            </p>
          </Card>
        ))}
      </div>

      <PaginationControls
        className="mt-6"
        page={page}
        hasMore={(data?.logs.length ?? 0) >= PAGE_SIZE}
        onPageChange={setPage}
      />
    </DashboardSidebarShell>
  );
}

export default function AdminLogsPage() {
  return (
    <AdminGuard>
      <AdminLogsContent />
    </AdminGuard>
  );
}
