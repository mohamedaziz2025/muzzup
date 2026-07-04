import { create } from "zustand";

export type ConnectionStatus = "connected" | "connecting" | "disconnected";

interface ConnectionState {
  status: ConnectionStatus;
  setStatus: (status: ConnectionStatus) => void;
}

/** Tracks the realtime (Socket.io) link so the UI can show a banner instead of only logging to console. */
export const useConnectionStore = create<ConnectionState>((set) => ({
  status: "connecting",
  setStatus: (status) => set({ status }),
}));
