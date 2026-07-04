import rateLimit from "express-rate-limit";
import type { RequestHandler } from "express";
import { RedisStore } from "rate-limit-redis";
import { createRedisClient, isRedisReachable } from "../lib/redis.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { TooManyRequestsError } from "../lib/errors.js";

interface LimiterSpec {
  windowMs: number;
  max: number;
}

function buildLimiter(
  spec: LimiterSpec,
  store: InstanceType<typeof RedisStore> | undefined,
): RequestHandler {
  return rateLimit({
    windowMs: spec.windowMs,
    limit: spec.max,
    standardHeaders: true,
    legacyHeaders: false,
    ...(store ? { store } : {}),
    handler: (_req, _res, next) => next(new TooManyRequestsError()),
  });
}

const GLOBAL_SPEC: LimiterSpec = { windowMs: env.RATE_LIMIT_WINDOW_MS, max: env.RATE_LIMIT_MAX };
/** Stricter limiter for auth endpoints (login, register, password reset) to slow brute force. */
const AUTH_SPEC: LimiterSpec = { windowMs: 15 * 60_000, max: 10 };

/**
 * Redis reachability is probed once at module load (this module is only imported once, from
 * app.ts). If Redis is up, both limiters share one Redis-backed counter (correct behind multiple
 * app instances); if it's down (e.g. local dev without Docker), we fall back to
 * express-rate-limit's in-memory store per-process rather than leaving every request to hang or
 * crash the server on a doomed Redis call.
 */
const redisUp = await isRedisReachable();

if (!redisUp) {
  logger.warn(
    "Redis indisponible au démarrage — rate limiting en mémoire locale (non partagé entre instances)",
  );
}

const redisClient = redisUp ? createRedisClient("rate-limit") : null;

function makeStore(prefix: string): InstanceType<typeof RedisStore> | undefined {
  if (!redisClient) return undefined;
  return new RedisStore({
    // @ts-expect-error -- ioredis call signature is compatible with rate-limit-redis's expectation
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix,
  });
}

export const globalRateLimiter: RequestHandler = buildLimiter(
  GLOBAL_SPEC,
  makeStore("muzzap:rl:global:"),
);
export const authRateLimiter: RequestHandler = buildLimiter(AUTH_SPEC, makeStore("muzzap:rl:auth:"));
