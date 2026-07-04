import type { Server as SocketIoServer } from "socket.io";

let ioInstance: SocketIoServer | null = null;

export function setIoInstance(io: SocketIoServer): void {
  ioInstance = io;
}

/** Null until initSockets() has run (e.g. inside unit tests that never boot the HTTP server). */
export function getIoInstance(): SocketIoServer | null {
  return ioInstance;
}
