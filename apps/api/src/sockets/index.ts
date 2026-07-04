import type { Server as HttpServer } from "node:http";
import { Server as SocketIoServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createRedisClient, isRedisReachable } from "../lib/redis.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { verifyAccessToken } from "../modules/auth/jwt.js";
import { setIoInstance } from "./io-instance.js";
import { chatService } from "../modules/chat/chat.service.js";

export async function initSockets(httpServer: HttpServer): Promise<SocketIoServer> {
  const io = new SocketIoServer(httpServer, {
    cors: { origin: env.WEB_URL, credentials: true },
  });

  // Without the adapter, sockets still work — just single-instance only (no cross-server
  // broadcast). Fine for local dev without Redis; required for horizontal scaling in production.
  // The adapter issues its own subscribe commands during setup outside our control, so we only
  // attach it once Redis is confirmed reachable rather than letting a doomed command crash the process.
  if (await isRedisReachable()) {
    const pubClient = createRedisClient("socket.io-pub");
    const subClient = pubClient.duplicate();
    // .duplicate() doesn't carry over event listeners, so the sub client needs its own guard.
    subClient.on("error", () => {
      /* already logged once by the pub client's handler */
    });
    io.adapter(createAdapter(pubClient, subClient));
  } else {
    logger.warn(
      "Redis indisponible au démarrage — Socket.io fonctionne en mode mono-instance (pas de diffusion inter-serveurs)",
    );
  }

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Authentification requise"));
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      socket.data.roles = payload.roles;
      next();
    } catch {
      next(new Error("Session expirée"));
    }
  });

  const chatNamespace = io.of("/chat");

  // Per-instance presence: a user counts as online while at least one of their sockets (tabs,
  // devices) is connected. This is process-local — fine for a single API instance, and the
  // Redis adapter above still fans the presence broadcasts out to other instances' sockets even
  // though each instance tracks its own connection counts independently.
  const onlineConnectionCounts = new Map<string, number>();

  chatNamespace.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    logger.info({ userId }, "Client connecté au namespace /chat");

    const previousCount = onlineConnectionCounts.get(userId) ?? 0;
    onlineConnectionCounts.set(userId, previousCount + 1);
    if (previousCount === 0) {
      chatNamespace.emit("presence:update", { userId, online: true });
    }
    socket.emit("presence:snapshot", { onlineUserIds: [...onlineConnectionCounts.keys()] });

    // Membership is re-verified server-side on every REST call; the room join here only
    // controls which sockets *receive* the broadcast emitted by chatService.sendMessage.
    socket.on("conversation:join", async (conversationId: string) => {
      try {
        await chatService.assertParticipant(conversationId, userId);
        socket.join(`conversation:${conversationId}`);
      } catch {
        socket.emit("error", { message: "Accès refusé à cette conversation" });
      }
    });

    socket.on("conversation:leave", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on("message:send", async (payload: { conversationId: string; body: string }) => {
      try {
        await chatService.sendMessage(payload.conversationId, userId, payload.body);
      } catch (err) {
        socket.emit("error", { message: (err as Error).message });
      }
    });

    socket.on("typing", (payload: { conversationId: string; isTyping: boolean }) => {
      socket.to(`conversation:${payload.conversationId}`).emit("typing", {
        conversationId: payload.conversationId,
        userId,
        isTyping: payload.isTyping,
      });
    });

    socket.on("disconnect", () => {
      logger.info({ userId }, "Client déconnecté du namespace /chat");
      const remaining = (onlineConnectionCounts.get(userId) ?? 1) - 1;
      if (remaining <= 0) {
        onlineConnectionCounts.delete(userId);
        chatNamespace.emit("presence:update", { userId, online: false });
      } else {
        onlineConnectionCounts.set(userId, remaining);
      }
    });
  });

  const notificationsNamespace = io.of("/notifications");
  notificationsNamespace.on("connection", (socket) => {
    socket.join(`user:${socket.data.userId as string}`);
  });

  setIoInstance(io);
  return io;
}
