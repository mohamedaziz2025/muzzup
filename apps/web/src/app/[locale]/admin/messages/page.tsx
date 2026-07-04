"use client";

import { useState } from "react";
import {
  useAdminConversations,
  useAdminConversationMessages,
  useBlockConversation,
  useUnblockConversation,
  useDeleteAdminMessage,
  type AdminConversation,
} from "@/lib/hooks/use-admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DashboardSidebarShell } from "@/components/dashboard/sidebar-shell";
import { ADMIN_SIDEBAR_ITEMS } from "@/components/admin/admin-nav";
import { AdminGuard } from "@/components/admin/admin-guard";
import { PaginationControls } from "@/components/admin/pagination-controls";

const PAGE_SIZE = 20;

function participantsLabel(participantIds: AdminConversation["participantIds"]): string {
  return participantIds
    .map((p) => (typeof p === "string" ? p : (p.fullName ?? p.email)))
    .join(" ↔ ");
}

function ConversationThread({ conversationId }: { conversationId: string }) {
  const { data, isLoading } = useAdminConversationMessages(conversationId);
  const deleteMessage = useDeleteAdminMessage();

  if (isLoading) return <p className="mt-3 text-sm text-secondary">Chargement des messages...</p>;

  return (
    <div className="mt-4 space-y-2 border-t border-[var(--border-subtle)] pt-4">
      {data?.messages.length === 0 && <p className="text-sm text-secondary">Aucun message.</p>}
      {data?.messages.map((message) => (
        <div key={message._id} className="flex items-start justify-between gap-3 text-sm">
          <div>
            <p className={message.deletedAt ? "italic text-muted" : "text-primary"}>{message.body}</p>
            <p className="mt-0.5 text-xs text-muted">
              {new Date(message.createdAt).toLocaleString("fr-FR")}
              {message.flagged && " · signalé"}
            </p>
          </div>
          {!message.deletedAt && (
            <Button
              size="sm"
              variant="ghost"
              disabled={deleteMessage.isPending}
              onClick={() => deleteMessage.mutate({ conversationId, messageId: message._id })}
            >
              Supprimer
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

function ConversationRow({ conversation }: { conversation: AdminConversation }) {
  const [expanded, setExpanded] = useState(false);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [reason, setReason] = useState("");
  const block = useBlockConversation();
  const unblock = useUnblockConversation();

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" className="text-left" onClick={() => setExpanded((v) => !v)}>
          <p className="text-sm text-primary">{participantsLabel(conversation.participantIds)}</p>
          <p className="mt-0.5 text-xs text-muted">
            {conversation.listingId?.title ?? "Sans annonce"} · {conversation.lastMessagePreview ?? "Aucun message"}
          </p>
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {conversation.flaggedCount > 0 && <Badge variant="warning">{conversation.flaggedCount} signalement(s)</Badge>}
          {conversation.adminBlocked ? (
            <Badge variant="danger">Bloquée</Badge>
          ) : (
            <Badge variant="success">Active</Badge>
          )}
          {conversation.adminBlocked ? (
            <Button size="sm" variant="secondary" disabled={unblock.isPending} onClick={() => unblock.mutate(conversation._id)}>
              Débloquer
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setShowBlockForm((v) => !v)}>
              Bloquer
            </Button>
          )}
        </div>
      </div>

      {showBlockForm && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Input placeholder="Motif du blocage" value={reason} onChange={(e) => setReason(e.target.value)} className="max-w-sm" />
          <Button
            size="sm"
            disabled={reason.length < 3 || block.isPending}
            onClick={() => {
              block.mutate({ id: conversation._id, reason });
              setShowBlockForm(false);
              setReason("");
            }}
          >
            Confirmer
          </Button>
        </div>
      )}

      {expanded && <ConversationThread conversationId={conversation._id} />}
    </Card>
  );
}

function AdminMessagesContent() {
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminConversations({
    ...(flaggedOnly ? { flaggedOnly: true } : {}),
    ...(search ? { q: search } : {}),
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <DashboardSidebarShell title="Back-office" items={ADMIN_SIDEBAR_ITEMS}>
      <h1 className="font-display text-3xl font-bold text-primary">Modération des messages</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Rechercher dans les derniers messages..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <label className="flex items-center gap-2 text-sm text-secondary">
          <input
            type="checkbox"
            checked={flaggedOnly}
            onChange={(e) => {
              setFlaggedOnly(e.target.checked);
              setPage(1);
            }}
          />
          Signalées uniquement
        </label>
      </div>

      <div className="mt-4 space-y-2">
        {isLoading && <p className="text-sm text-secondary">Chargement...</p>}
        {data?.conversations.length === 0 && <p className="text-sm text-secondary">Aucune conversation trouvée.</p>}
        {data?.conversations.map((conversation) => (
          <ConversationRow key={conversation._id} conversation={conversation} />
        ))}
      </div>

      <PaginationControls
        className="mt-6"
        page={page}
        hasMore={(data?.conversations.length ?? 0) >= PAGE_SIZE}
        onPageChange={setPage}
      />
    </DashboardSidebarShell>
  );
}

export default function AdminMessagesPage() {
  return (
    <AdminGuard>
      <AdminMessagesContent />
    </AdminGuard>
  );
}
