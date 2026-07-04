"use client";

import { useState } from "react";
import { useAdminCms, useUpsertCms, type CmsEntry } from "@/lib/hooks/use-admin";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DashboardSidebarShell } from "@/components/dashboard/sidebar-shell";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/admin-nav";
import { AdminGuard } from "@/components/admin/admin-guard";

const LOCALES = ["fr", "en", "ar"] as const;

function EntryRow({ entry }: { entry: CmsEntry }) {
  const [value, setValue] = useState(entry.value);
  const upsert = useUpsertCms();
  const dirty = value !== entry.value;

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-primary">{entry.key}</p>
        <Badge variant="neutral">{entry.locale}</Badge>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={value.length > 200 ? 6 : 2}
        className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-4 py-2 text-sm text-primary placeholder:text-muted focus:border-cyan focus:outline-none"
      />
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-muted">
          Modifié le {new Date(entry.updatedAt).toLocaleString("fr-FR")}
        </p>
        <Button
          size="sm"
          variant="secondary"
          disabled={!dirty || upsert.isPending}
          onClick={() => upsert.mutate({ key: entry.key, locale: entry.locale, value })}
        >
          Enregistrer
        </Button>
      </div>
    </Card>
  );
}

function NewEntryPanel() {
  const [key, setKey] = useState("");
  const [locale, setLocale] = useState<(typeof LOCALES)[number]>("fr");
  const [value, setValue] = useState("");
  const upsert = useUpsertCms();

  return (
    <Card>
      <CardTitle>Ajouter une entrée</CardTitle>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Clé</Label>
          <Input placeholder="ex: landing.hero.title" value={key} onChange={(e) => setKey(e.target.value)} />
        </div>
        <div>
          <Label>Langue</Label>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as (typeof LOCALES)[number])}
            className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-3 text-sm text-primary"
          >
            {LOCALES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3">
        <Label>Valeur</Label>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-4 py-2 text-sm text-primary placeholder:text-muted focus:border-cyan focus:outline-none"
        />
      </div>
      <Button
        size="sm"
        className="mt-3"
        disabled={key.trim().length === 0 || value.trim().length === 0 || upsert.isPending}
        onClick={() => {
          upsert.mutate({ key: key.trim(), locale, value }, { onSuccess: () => { setKey(""); setValue(""); } });
        }}
      >
        Créer / mettre à jour
      </Button>
    </Card>
  );
}

function AdminCmsContent() {
  const [locale, setLocale] = useState<"" | (typeof LOCALES)[number]>("");
  const { data, isLoading } = useAdminCms(locale || undefined);

  return (
    <DashboardSidebarShell title="Back-office" items={ADMIN_SIDEBAR_ITEMS}>
      <h1 className="font-display text-3xl font-bold text-primary">Contenu (CMS)</h1>

      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as "" | (typeof LOCALES)[number])}
          className="h-11 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-3 text-sm text-primary"
        >
          <option value="">Toutes les langues</option>
          {LOCALES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <NewEntryPanel />
      </div>

      <div className="mt-4 space-y-2">
        {isLoading && <p className="text-sm text-secondary">Chargement...</p>}
        {data?.entries.length === 0 && <p className="text-sm text-secondary">Aucune entrée.</p>}
        {data?.entries.map((entry) => (
          <EntryRow key={entry._id} entry={entry} />
        ))}
      </div>
    </DashboardSidebarShell>
  );
}

export default function AdminCmsPage() {
  return (
    <AdminGuard>
      <AdminCmsContent />
    </AdminGuard>
  );
}
