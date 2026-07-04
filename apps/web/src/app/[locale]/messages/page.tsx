"use client";

import { useEffect, useRef, useState } from "react";
import { Check, CheckCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { REVEAL_PHASES, type RevealPhase } from "@muzzap/shared";
import { useAuthStore } from "@/stores/auth-store";
import { usePresenceStore } from "@/stores/presence-store";
import { useConnectionStore } from "@/stores/connection-store";
import {
  useConversations,
  useMessages,
  useProposeReveal,
  useRespondReveal,
  useRequestNda,
  type ChatMessage,
  type Conversation,
} from "@/lib/hooks/use-chat";
import { getChatSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";

const REVEAL_LABELS: Record<RevealPhase, string> = {
  anonymous: "Anonyme",
  first_name_photo: "Prénom + photo",
  full_profile: "Profil complet",
};

function nextPhase(current: RevealPhase): RevealPhase | null {
  const idx = REVEAL_PHASES.indexOf(current);
  return idx < REVEAL_PHASES.length - 1 ? REVEAL_PHASES[idx + 1]! : null;
}

function conversationLabel(conversation: Conversation): string {
  if (typeof conversation.listingId === "object" && conversation.listingId) {
    return conversation.listingId.title;
  }
  return "Conversation";
}

function otherParticipantId(conversation: Conversation, myUserId: string | undefined): string | null {
  return conversation.participantIds.find((id) => id !== myUserId) ?? null;
}

function Avatar({ label, online }: { label: string; online: boolean }) {
  return (
    <div className="relative shrink-0">
      <div className="flex size-11 items-center justify-center rounded-full bg-elevated font-display text-sm font-semibold text-cyan">
        {label.slice(0, 1).toUpperCase()}
      </div>
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-abyss bg-success" />
      )}
    </div>
  );
}

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

function MessageBubble({
  message,
  isMine,
  isRead,
}: {
  message: ChatMessage;
  isMine: boolean;
  isRead: boolean;
}) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isMine
            ? "rounded-br-md bg-royal text-white"
            : "glass rounded-bl-md text-primary"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        {message.flagged && (
          <p className="mt-1 text-xs text-warning">⚠ Coordonnées détectées — message signalé</p>
        )}
        <div
          className={`mt-1 flex items-center gap-1 text-[10px] ${isMine ? "justify-end text-white/60" : "text-muted"}`}
        >
          <span>{formatTime(message.createdAt)}</span>
          {isMine && (isRead ? <CheckCheck className="size-3.5" /> : <Check className="size-3.5" />)}
        </div>
      </div>
    </div>
  );
}

function ConversationPanel({ conversation }: { conversation: Conversation }) {
  const { user, accessToken } = useAuthStore();
  const onlineUserIds = usePresenceStore((s) => s.onlineUserIds);
  const conversationId = conversation._id;
  const { data: messagesData } = useMessages(conversationId);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [readByOther, setReadByOther] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const proposeReveal = useProposeReveal(conversationId);
  const requestNda = useRequestNda(conversationId);
  const pendingReveal = conversation.pendingRevealRequest;
  const respondReveal = useRespondReveal(pendingReveal?.id ?? "");
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const otherId = otherParticipantId(conversation, user?.id);
  const isOtherOnline = otherId ? onlineUserIds.has(otherId) : false;
  const label = conversationLabel(conversation);

  useEffect(() => {
    setLiveMessages([]);
    setReadByOther(false);
  }, [conversationId]);

  useEffect(() => {
    if (!accessToken) return;
    const socket = getChatSocket(accessToken);
    socket.emit("conversation:join", conversationId);

    const onNewMessage = (msg: ChatMessage) => {
      if (msg.conversationId !== conversationId) return;
      setLiveMessages((prev) => [...prev, msg]);
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    };
    const onRead = (payload: { conversationId: string; readerId: string }) => {
      if (payload.conversationId !== conversationId || payload.readerId === user?.id) return;
      setReadByOther(true);
    };
    const onTyping = (payload: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (payload.conversationId !== conversationId || payload.userId === user?.id) return;
      setOtherTyping(payload.isTyping);
    };
    const onRevealResolved = () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    };
    const onRevealRequested = () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    };

    socket.on("message:new", onNewMessage);
    socket.on("message:read", onRead);
    socket.on("typing", onTyping);
    socket.on("reveal:resolved", onRevealResolved);
    socket.on("reveal:requested", onRevealRequested);

    return () => {
      socket.emit("conversation:leave", conversationId);
      socket.off("message:new", onNewMessage);
      socket.off("message:read", onRead);
      socket.off("typing", onTyping);
      socket.off("reveal:resolved", onRevealResolved);
      socket.off("reveal:requested", onRevealRequested);
    };
  }, [accessToken, conversationId, queryClient, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveMessages, messagesData]);

  const allMessages = [...(messagesData?.messages ?? []), ...liveMessages];
  const lastMineIndex = [...allMessages].reverse().findIndex((m) => m.senderId === user?.id);
  const lastMineId =
    lastMineIndex >= 0 ? allMessages[allMessages.length - 1 - lastMineIndex]?._id : null;
  const target = nextPhase(conversation.revealPhase);

  const isConnected = useConnectionStore((s) => s.status === "connected");

  function sendMessage() {
    if (!draft.trim() || !accessToken || !isConnected) return;
    getChatSocket(accessToken).emit("message:send", { conversationId, body: draft });
    getChatSocket(accessToken).emit("typing", { conversationId, isTyping: false });
    setDraft("");
  }

  function handleDraftChange(value: string) {
    setDraft(value);
    if (!accessToken) return;
    const socket = getChatSocket(accessToken);
    socket.emit("typing", { conversationId, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { conversationId, isTyping: false });
    }, 2000);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar label={label} online={isOtherOnline} />
          <div>
            <p className="font-medium text-primary">{label}</p>
            <p className="text-xs text-muted">
              {otherTyping ? (
                <span className="text-cyan">en train d&apos;écrire…</span>
              ) : isOtherOnline ? (
                "En ligne"
              ) : (
                REVEAL_LABELS[conversation.revealPhase]
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {target && !pendingReveal && (
            <Button
              size="sm"
              variant="secondary"
              disabled={proposeReveal.isPending}
              onClick={() => proposeReveal.mutate(target)}
            >
              Proposer : {REVEAL_LABELS[target]}
            </Button>
          )}
          {pendingReveal && pendingReveal.requestedBy === user?.id && (
            <span className="flex items-center rounded-full bg-elevated px-3 py-1.5 text-xs text-muted">
              En attente de réponse : {REVEAL_LABELS[pendingReveal.targetPhase]}
            </span>
          )}
          {!conversation.ndaId && (
            <Button size="sm" variant="gold" disabled={requestNda.isPending} onClick={() => requestNda.mutate()}>
              NDA
            </Button>
          )}
        </div>
      </div>

      {pendingReveal && pendingReveal.requestedBy !== user?.id && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] bg-elevated px-5 py-2.5 text-sm">
          <p className="text-primary">
            Votre interlocuteur propose de passer à : <strong>{REVEAL_LABELS[pendingReveal.targetPhase]}</strong>
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={respondReveal.isPending}
              onClick={() => respondReveal.mutate(false)}
            >
              Refuser
            </Button>
            <Button size="sm" disabled={respondReveal.isPending} onClick={() => respondReveal.mutate(true)}>
              Accepter
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-2 overflow-y-auto px-5 py-4">
        {allMessages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            isMine={msg.senderId === user?.id}
            isRead={msg._id === lastMineId && (readByOther || (otherId ? msg.readBy.includes(otherId) : false))}
          />
        ))}
        {otherTyping && (
          <div className="flex justify-start">
            <div className="glass flex items-center gap-1 rounded-2xl rounded-bl-md px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 animate-bounce rounded-full bg-muted"
                  style={{ animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-end gap-2 border-t border-[var(--border-subtle)] p-3">
        <textarea
          value={draft}
          onChange={(e) => handleDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={isConnected ? "Écrire un message..." : "Reconnexion en cours..."}
          rows={1}
          disabled={!isConnected}
          className="max-h-32 flex-1 resize-none rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-night px-4 py-2.5 text-sm text-primary placeholder:text-muted focus:border-cyan focus:outline-none disabled:opacity-50"
        />
        <Button
          onClick={sendMessage}
          disabled={!draft.trim() || !isConnected}
          className="glow-royal-hover shrink-0"
        >
          Envoyer
        </Button>
      </div>
    </div>
  );
}

function ConversationListItem({
  conversation,
  isSelected,
  isOnline,
  onSelect,
}: {
  conversation: Conversation;
  isSelected: boolean;
  isOnline: boolean;
  onSelect: () => void;
}) {
  const label = conversationLabel(conversation);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left transition-colors ${
        isSelected ? "bg-elevated" : "hover:bg-elevated/50"
      }`}
    >
      <Avatar label={label} online={isOnline} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-primary">{label}</p>
          <span className="shrink-0 text-[11px] text-muted">{formatTime(conversation.lastMessageAt)}</span>
        </div>
        <p className="truncate text-xs text-secondary">
          {conversation.lastMessagePreview ?? "Démarrez la conversation"}
        </p>
      </div>
    </button>
  );
}

export default function MessagesPage() {
  const { user, accessToken } = useAuthStore();
  const { data } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const setOnline = usePresenceStore((s) => s.setOnline);
  const markOnline = usePresenceStore((s) => s.markOnline);
  const markOffline = usePresenceStore((s) => s.markOffline);

  useEffect(() => {
    if (!accessToken) return;
    const socket = getChatSocket(accessToken);
    const onSnapshot = (payload: { onlineUserIds: string[] }) => setOnline(payload.onlineUserIds);
    const onUpdate = (payload: { userId: string; online: boolean }) =>
      payload.online ? markOnline(payload.userId) : markOffline(payload.userId);

    socket.on("presence:snapshot", onSnapshot);
    socket.on("presence:update", onUpdate);
    return () => {
      socket.off("presence:snapshot", onSnapshot);
      socket.off("presence:update", onUpdate);
    };
  }, [accessToken, setOnline, markOnline, markOffline]);

  const selected = data?.conversations.find((c) => c._id === selectedId);
  const onlineUserIds = usePresenceStore((s) => s.onlineUserIds);

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-6xl border-x border-[var(--border-subtle)]">
      <div
        className={`w-full shrink-0 overflow-y-auto border-r border-[var(--border-subtle)] p-3 md:w-80 ${selectedId ? "hidden md:block" : "block"}`}
      >
        <h1 className="px-2 py-2 font-display text-xl font-semibold text-primary">Messages</h1>
        <div className="mt-2 space-y-1">
          {data?.conversations.map((c) => {
            const otherId = otherParticipantId(c, user?.id);
            return (
              <ConversationListItem
                key={c._id}
                conversation={c}
                isSelected={selectedId === c._id}
                isOnline={otherId ? onlineUserIds.has(otherId) : false}
                onSelect={() => setSelectedId(c._id)}
              />
            );
          })}
          {data?.conversations.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-secondary">
              Aucune conversation pour le moment.
            </p>
          )}
        </div>
      </div>
      <div className={`flex-1 ${selectedId ? "block" : "hidden md:block"}`}>
        {selected ? (
          <>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-1 px-4 pt-3 text-sm text-secondary md:hidden"
            >
              ← Retour
            </button>
            <ConversationPanel conversation={selected} />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-secondary">Sélectionnez une conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
