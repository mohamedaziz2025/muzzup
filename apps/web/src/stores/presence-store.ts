import { create } from "zustand";

interface PresenceState {
  onlineUserIds: Set<string>;
  setOnline: (userIds: string[]) => void;
  markOnline: (userId: string) => void;
  markOffline: (userId: string) => void;
}

/** Populated from the /chat socket's `presence:snapshot`/`presence:update` events. */
export const usePresenceStore = create<PresenceState>((set) => ({
  onlineUserIds: new Set(),
  setOnline: (userIds) => set({ onlineUserIds: new Set(userIds) }),
  markOnline: (userId) =>
    set((state) => ({ onlineUserIds: new Set(state.onlineUserIds).add(userId) })),
  markOffline: (userId) =>
    set((state) => {
      const next = new Set(state.onlineUserIds);
      next.delete(userId);
      return { onlineUserIds: next };
    }),
}));
