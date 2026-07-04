import type { Response } from "express";
import { env, isProd } from "../config/env.js";

const REFRESH_COOKIE_NAME = "muzzap_refresh_token";

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    domain: env.COOKIE_DOMAIN,
    path: "/api/v1/auth",
    maxAge: env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    domain: env.COOKIE_DOMAIN,
    path: "/api/v1/auth",
  });
}

export { REFRESH_COOKIE_NAME };
