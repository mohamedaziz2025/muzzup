import { io, type Socket } from "socket.io-client";
import { useConnectionStore } from "@/stores/connection-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

let chatSocket: Socket | null = null;

export function getChatSocket(accessToken: string): Socket {
  if (chatSocket?.connected && chatSocket.auth && (chatSocket.auth as { token: string }).token === accessToken) {
    return chatSocket;
  }
  chatSocket?.disconnect();
  chatSocket = io(`${API_URL}/chat`, {
    auth: { token: accessToken },
    withCredentials: true,
    // Websocket first, but fall back to long-polling if the upgrade is blocked (proxies, corp
    // firewalls, or a dev environment where only HTTP is reachable) instead of failing outright.
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10_000,
  });

  const { setStatus } = useConnectionStore.getState();
  setStatus("connecting");
  chatSocket.on("connect", () => setStatus("connected"));
  chatSocket.on("disconnect", () => setStatus("disconnected"));
  chatSocket.on("reconnect_attempt", () => setStatus("connecting"));
  chatSocket.on("connect_error", () => setStatus("disconnected"));

  return chatSocket;
}
