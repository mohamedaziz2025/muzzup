"use client";

import { useState } from "react";
import { Plus, History } from "lucide-react";
import {
  useAdminUsers,
  useCreateAdminUser,
  useUpdateAdminUser,
  useVerifyAdminUser,
  useAdminUserHistory,
  useBanUser,
  useUnbanUser,
  type AdminUser,
} from "@/lib/hooks/use-admin";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DashboardSidebarShell } from "@/components/dashboard/sidebar-shell";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/admin-nav";
import { AdminGuard } from "@/components/admin/admin-guard";
import { PaginationControls } from "@/components/admin/pagination-controls";

const ROLE_OPTIONS = ["visitor", "member", "subscriber", "halal_auditor", "admin", "superadmin"];
const PAGE_SIZE = 20;

function CreateUserPanel({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<string[]>(["member"]);
  const createUser = useCreateAdminUser();

  function toggleRole(role: string) {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  }

  return (
    <Card className="mt-4">
      <CardTitle>Créer un utilisateur</CardTitle>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label>Nom complet</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <Label>Mot de passe</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <Label>Rôles</Label>
          <div className="flex flex-wrap gap-1.5">
            {ROLE_OPTIONS.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className="text-left"
              >
                <Badge variant={roles.includes(role) ? "royal" : "neutral"}>{role}</Badge>
              </button>
            ))}
          </div>
        </div>
      </div>
      {createUser.isError && (
        <p className="mt-3 text-sm text-danger">{(createUser.error as Error).message}</p>
      )}
      <div className="mt-4 flex gap-2">
        <Button
          size="sm"
          disabled={
            createUser.isPending || email.length < 3 || fullName.length < 2 || password.length < 8 || roles.length === 0
          }
          onClick={() =>
            createUser.mutate(
              { email, fullName, password, roles },
              {
                onSuccess: () => {
                  setEmail("");
                  setFullName("");
                  setPassword("");
                  setRoles(["member"]);
                  onClose();
                },
              },
            )
          }
        >
          {createUser.isPending ? "Création..." : "Créer"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose}>
          Annuler
        </Button>
      </div>
    </Card>
  );
}

function UserHistoryPanel({ userId }: { userId: string }) {
  const { data, isLoading } = useAdminUserHistory(userId);

  return (
    <div className="mt-3 space-y-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-abyss/40 p-3">
      {isLoading && <p className="text-sm text-secondary">Chargement de l&apos;historique...</p>}
      {data?.entries.length === 0 && <p className="text-sm text-secondary">Aucun événement.</p>}
      {data?.entries.map((entry) => (
        <div key={entry._id} className="text-xs text-secondary">
          <span className="text-primary">{entry.action}</span>{" "}
          <span className="text-muted">
            · {new Date(entry.createdAt).toLocaleString("fr-FR")}
            {entry.actorId && typeof entry.actorId === "object" && ` · par ${entry.actorId.fullName}`}
          </span>
        </div>
      ))}
    </div>
  );
}

function UserRow({ user }: { user: AdminUser }) {
  const [banReason, setBanReason] = useState("");
  const [showBanForm, setShowBanForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editFullName, setEditFullName] = useState(user.fullName);
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const verifyUser = useVerifyAdminUser();
  const updateUser = useUpdateAdminUser();

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm text-primary">
            {user.fullName} <span className="text-muted">({user.email})</span>
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {user.roles.map((r) => (
              <Badge key={r} variant="neutral">{r}</Badge>
            ))}
            {user.isBanned && <Badge variant="danger">Suspendu</Badge>}
            {!user.emailVerifiedAt && <Badge variant="warning">Email non vérifié</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" onClick={() => setShowHistory((v) => !v)}>
            <History className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowEdit((v) => !v)}>
            Modifier
          </Button>
          {!user.emailVerifiedAt && (
            <Button size="sm" variant="secondary" disabled={verifyUser.isPending} onClick={() => verifyUser.mutate(user._id)}>
              Vérifier
            </Button>
          )}
          {user.isBanned ? (
            <Button size="sm" variant="secondary" disabled={unbanUser.isPending} onClick={() => unbanUser.mutate(user._id)}>
              Réactiver
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setShowBanForm((v) => !v)}>
              Suspendre
            </Button>
          )}
        </div>
      </div>

      {showBanForm && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Input
            placeholder="Motif de suspension"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            className="max-w-sm"
          />
          <Button
            size="sm"
            disabled={banReason.length < 3 || banUser.isPending}
            onClick={() => {
              banUser.mutate({ id: user._id, reason: banReason });
              setShowBanForm(false);
              setBanReason("");
            }}
          >
            Confirmer
          </Button>
        </div>
      )}

      {showEdit && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Input value={editFullName} onChange={(e) => setEditFullName(e.target.value)} className="max-w-sm" />
          <Button
            size="sm"
            disabled={editFullName.length < 2 || updateUser.isPending}
            onClick={() => {
              updateUser.mutate({ id: user._id, fullName: editFullName });
              setShowEdit(false);
            }}
          >
            Enregistrer
          </Button>
        </div>
      )}

      {showHistory && <UserHistoryPanel userId={user._id} />}
    </Card>
  );
}

function AdminUsersContent() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<"" | "banned" | "active">("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useAdminUsers({
    ...(search ? { q: search } : {}),
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <DashboardSidebarShell title="Back-office" items={ADMIN_SIDEBAR_ITEMS}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-primary">Utilisateurs</h1>
        <Button size="sm" onClick={() => setShowCreate((v) => !v)}>
          <Plus className="mr-1.5 size-4" />
          Nouvel utilisateur
        </Button>
      </div>

      {showCreate && <CreateUserPanel onClose={() => setShowCreate(false)} />}

      <div className="mt-6 flex flex-wrap gap-3">
        <Input
          placeholder="Rechercher par email ou nom..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          className="h-11 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-3 text-sm text-primary"
        >
          <option value="">Tous les rôles</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "" | "banned" | "active");
            setPage(1);
          }}
          className="h-11 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-3 text-sm text-primary"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="banned">Suspendus</option>
        </select>
      </div>

      <div className="mt-4 space-y-2">
        {isLoading && <p className="text-sm text-secondary">Chargement...</p>}
        {data?.users.length === 0 && <p className="text-sm text-secondary">Aucun utilisateur trouvé.</p>}
        {data?.users.map((user) => (
          <UserRow key={user._id} user={user} />
        ))}
      </div>

      <PaginationControls
        className="mt-6"
        page={page}
        hasMore={(data?.users.length ?? 0) >= PAGE_SIZE}
        onPageChange={setPage}
      />
    </DashboardSidebarShell>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <AdminUsersContent />
    </AdminGuard>
  );
}
