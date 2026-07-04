import { Redis, type RedisOptions } from "ioredis";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

/**
 * Creates an ioredis client that degrades gracefully when Redis isn't reachable (e.g. local dev
 * without Docker): capped backoff instead of hammering the connection, and a single warning
 * instead of ioredis's default per-attempt "[ioredis] Unhandled error event" console spam.
 *
 * `maxRetriesPerRequest` defaults to `null` (never reject a command, keep retrying) because
 * several consumers here (BullMQ, the Socket.io Redis adapter) issue commands during their own
 * internal setup without a catch handler — a rejected command there is an *uncaught* rejection
 * that crashes the process. Only override this to a bounded value for a client whose caller has
 * deliberately wrapped every command in error handling (see middlewares/rate-limit.ts).
 */
export function createRedisClient(label: string, options: RedisOptions = {}): Redis {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    retryStrategy: (times) => Math.min(times * 500, 10_000),
    ...options,
  });

  let hasWarned = false;
  client.on("error", (err) => {
    if (hasWarned) return;
    hasWarned = true;
    logger.warn(
      { err: err.message, label },
      `[Redis:${label}] Connexion indisponible — nouvelles tentatives en arrière-plan (silencieuses). ` +
        "Les fonctionnalités dépendant de Redis (rate limiting, sockets temps réel, files de jobs) sont dégradées tant que Redis n'est pas accessible.",
    );
  });
  client.on("connect", () => {
    hasWarned = false;
    logger.info(`[Redis:${label}] Connecté`);
  });

  return client;
}

/**
 * One-shot reachability probe with a hard timeout, used at boot to decide whether to wire up
 * Redis-backed features at all. Several libraries here (rate-limit-redis, the Socket.io Redis
 * adapter) issue setup commands outside of any request cycle we control — if those commands are
 * left to fail against a truly-unreachable Redis, the rejection is uncaught and crashes the
 * process. Checking reachability once up front and skipping that wiring entirely sidesteps the
 * problem instead of trying to catch every internal command.
 */
export async function isRedisReachable(timeoutMs = 1500): Promise<boolean> {
  const probe = new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
  });
  probe.on("error", () => {
    /* handled via the timed race below */
  });

  try {
    await Promise.race([
      probe.connect().then(() => probe.ping()),
      new Promise((_resolve, reject) => setTimeout(() => reject(new Error("timeout")), timeoutMs)),
    ]);
    return true;
  } catch {
    return false;
  } finally {
    probe.disconnect();
  }
}
