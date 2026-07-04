"use client";

import { useRef, useState } from "react";
import { LayoutDashboard, Heart, CreditCard, User as UserIcon, Camera } from "lucide-react";
import type { MemberCapacity } from "@muzzap/shared";
import { useAuthStore } from "@/stores/auth-store";
import { useUpdateProfile, useUploadAvatar } from "@/lib/hooks/use-profile";
import { DashboardSidebarShell, type SidebarItem } from "@/components/dashboard/sidebar-shell";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SIDEBAR_ITEMS: SidebarItem[] = [
  { href: "/tableau-de-bord", label: "Vue d'ensemble", icon: <LayoutDashboard className="size-4" /> },
  { href: "/tableau-de-bord/favoris", label: "Favoris", icon: <Heart className="size-4" /> },
  { href: "/tableau-de-bord/abonnement", label: "Abonnement", icon: <CreditCard className="size-4" /> },
  { href: "/tableau-de-bord/profil", label: "Mon profil", icon: <UserIcon className="size-4" /> },
];

const CAPACITY_LABELS: Record<MemberCapacity, string> = {
  buyer: "Acheteur",
  seller: "Vendeur",
  provider: "Prestataire",
};

const ROLE_LABELS: Record<string, string> = {
  visitor: "Visiteur",
  member: "Membre",
  subscriber: "Abonné",
  halal_auditor: "Auditeur halal",
  admin: "Administrateur",
  superadmin: "Super administrateur",
};

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [capacities, setCapacities] = useState<MemberCapacity[]>(user?.capacities ?? []);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  function handleAvatarChange(file: File | undefined) {
    if (file) uploadAvatar.mutate(file);
  }

  function toggleCapacity(value: MemberCapacity) {
    setCapacities((prev) => (prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]));
  }

  function handleSave() {
    setSaved(false);
    updateProfile.mutate(
      { fullName, capacities },
      { onSuccess: () => setSaved(true) },
    );
  }

  return (
    <DashboardSidebarShell title="Mon espace" items={SIDEBAR_ITEMS}>
      <h1 className="font-display text-3xl font-bold text-primary">Mon profil</h1>
      <p className="mt-1 text-secondary">Gérez vos informations et vos capacités sur MUZZUP.</p>

      <Card className="mt-8 max-w-xl">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadAvatar.isPending}
            className="group relative shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            aria-label="Changer la photo de profil"
          >
            <Avatar name={user.fullName} src={user.avatarUrl} size="lg" />
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-abyss/60 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="size-5 text-white" />
            </span>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                handleAvatarChange(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </button>
          <div>
            <CardTitle>{user.fullName}</CardTitle>
            <CardDescription className="mt-1">{user.pseudonym}</CardDescription>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {user.roles.map((role) => (
                <Badge key={role} variant="royal">
                  {ROLE_LABELS[role] ?? role}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        {uploadAvatar.error && (
          <p className="mt-2 text-sm text-danger">Échec de l&apos;envoi de la photo, réessayez.</p>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="fullName">Nom complet</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div>
            <Label>Capacités</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CAPACITY_LABELS) as MemberCapacity[]).map((cap) => (
                <button
                  type="button"
                  key={cap}
                  onClick={() => toggleCapacity(cap)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    capacities.includes(cap)
                      ? "border-cyan bg-cyan/15 text-cyan"
                      : "border-[var(--border-subtle)] text-secondary"
                  }`}
                >
                  {CAPACITY_LABELS[cap]}
                </button>
              ))}
            </div>
          </div>

          {updateProfile.error && (
            <p className="text-sm text-danger">Une erreur est survenue, réessayez.</p>
          )}
          {saved && <p className="text-sm text-success">Profil mis à jour.</p>}

          <Button className="glow-royal-hover" disabled={updateProfile.isPending} onClick={handleSave}>
            {updateProfile.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </Card>
    </DashboardSidebarShell>
  );
}
