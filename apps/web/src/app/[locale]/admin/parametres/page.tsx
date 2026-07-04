"use client";

import { useEffect, useState } from "react";
import { useAdminSettings, useUpdateAdminSettings, useAdminInfrastructure } from "@/lib/hooks/use-admin";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DashboardSidebarShell } from "@/components/dashboard/sidebar-shell";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/admin-nav";
import { AdminGuard } from "@/components/admin/admin-guard";

function AdminSettingsContent() {
  const { data, isLoading } = useAdminSettings();
  const { data: infra } = useAdminInfrastructure();
  const update = useUpdateAdminSettings();

  const [commissionPct, setCommissionPct] = useState("");
  const [currencies, setCurrencies] = useState("");
  const [countries, setCountries] = useState("");
  const [languages, setLanguages] = useState("");
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [supportEmail, setSupportEmail] = useState("");

  useEffect(() => {
    if (!data) return;
    const settings = data.settings;
    setCommissionPct(String(Math.round(settings.commissionRate * 1000) / 10));
    setCurrencies(settings.currencies.join(", "));
    setCountries(settings.countries.join(", "));
    setLanguages(settings.languages.join(", "));
    setRegistrationOpen(settings.registrationOpen);
    setMaintenanceMode(settings.maintenanceMode);
    setMaintenanceMessage(settings.maintenanceMessage);
    setSupportEmail(settings.supportEmail);
  }, [data]);

  function toList(value: string): string[] {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  }

  function save() {
    update.mutate({
      commissionRate: Number(commissionPct) / 100,
      currencies: toList(currencies),
      countries: toList(countries),
      languages: toList(languages),
      registrationOpen,
      maintenanceMode,
      maintenanceMessage,
      supportEmail,
    });
  }

  return (
    <DashboardSidebarShell title="Back-office" items={ADMIN_SIDEBAR_ITEMS}>
      <h1 className="font-display text-3xl font-bold text-primary">Paramètres de la plateforme</h1>

      {isLoading && <p className="mt-6 text-sm text-secondary">Chargement...</p>}

      {data && (
        <Card className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Taux de commission (%)</Label>
              <Input type="number" min={0} max={100} step={0.1} value={commissionPct} onChange={(e) => setCommissionPct(e.target.value)} />
            </div>
            <div>
              <Label>Email de support</Label>
              <Input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
            </div>
            <div>
              <Label>Devises (séparées par des virgules)</Label>
              <Input value={currencies} onChange={(e) => setCurrencies(e.target.value)} placeholder="EUR, USD" />
            </div>
            <div>
              <Label>Pays (séparés par des virgules)</Label>
              <Input value={countries} onChange={(e) => setCountries(e.target.value)} placeholder="FR, MA, TN" />
            </div>
            <div>
              <Label>Langues (séparées par des virgules)</Label>
              <Input value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="fr, en, ar" />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-secondary">
              <input type="checkbox" checked={registrationOpen} onChange={(e) => setRegistrationOpen(e.target.checked)} />
              Inscriptions ouvertes
            </label>
            <label className="flex items-center gap-2 text-sm text-secondary">
              <input type="checkbox" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} />
              Mode maintenance
            </label>
          </div>

          <div className="mt-4">
            <Label>Message de maintenance</Label>
            <textarea
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              rows={3}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-4 py-2 text-sm text-primary placeholder:text-muted focus:border-cyan focus:outline-none"
            />
          </div>

          {update.isError && <p className="mt-3 text-sm text-danger">{(update.error as Error).message}</p>}

          <Button size="sm" className="mt-4" disabled={update.isPending} onClick={save}>
            {update.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </Card>
      )}

      {infra && (
        <Card className="mt-6">
          <CardTitle>Infrastructure</CardTitle>
          <CardDescription className="mt-1">Configuration technique (lecture seule)</CardDescription>
          <div className="mt-3 space-y-1.5 text-sm text-secondary">
            <p>Fournisseur email : {infra.emailProvider}</p>
            <p>Fournisseur IA : {infra.aiProvider}</p>
            <p>Fournisseur de stockage : {infra.storageProvider}</p>
          </div>
        </Card>
      )}
    </DashboardSidebarShell>
  );
}

export default function AdminSettingsPage() {
  return (
    <AdminGuard>
      <AdminSettingsContent />
    </AdminGuard>
  );
}
