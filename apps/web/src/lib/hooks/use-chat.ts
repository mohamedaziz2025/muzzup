import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { RevealPhase } from "@muzzap/shared";
import { apiFetch } from "@/lib/api-client";

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  body: string;
  flagged: boolean;
  readBy: string[];
  createdAt: string;
}

export interface Conversation {
  _id: string;
  listingId: { _id: string; title: string; type: string } | string | null;
  participantIds: string[];
  revealPhase: RevealPhase;
  ndaId: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  lastMessageSenderId: string | null;
  updatedAt: string;
  pendingRevealRequest: { id: string; targetPhase: RevealPhase; requestedBy: string } | null;
}

export function useConversations() {
  return useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: () => apiFetch<{ conversations: Conversation[] }>("/chat/conversations"),
    refetchInterval: 30_000,
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId: string) =>
      apiFetch<{ conversation: Conversation }>("/chat/conversations", {
        method: "POST",
        body: { listingId },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] }),
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ["chat", conversationId, "messages"],
    queryFn: () => apiFetch<{ messages: ChatMessage[] }>(`/chat/conversations/${conversationId}/messages`),
    enabled: !!conversationId,
  });
}

export function useProposeReveal(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetPhase: RevealPhase) =>
      apiFetch(`/chat/conversations/${conversationId}/reveal-requests`, {
        method: "POST",
        body: { targetPhase },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] }),
  });
}

export function useRespondReveal(requestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accept: boolean) =>
      apiFetch(`/chat/reveal-requests/${requestId}/respond`, {
        method: "POST",
        body: { accept },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] }),
  });
}

export function useRequestNda(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch(`/chat/conversations/${conversationId}/nda`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] }),
  });
}
