import type { NextFunction, Request, Response } from "express";
import { ROLE_WEIGHT, type MemberCapacity, type SystemRole } from "@muzzap/shared";
import { verifyAccessToken } from "../modules/auth/jwt.js";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    next(new UnauthorizedError());
    return;
  }
  try {
    const payload = verifyAccessToken(header.slice("Bearer ".length));
    req.auth = { userId: payload.sub, roles: payload.roles, capacities: payload.capacities };
    next();
  } catch {
    next(new UnauthorizedError("Session expirée, reconnectez-vous"));
  }
}

/** Populates req.auth when a valid Bearer token is present, but never rejects the request. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    next();
    return;
  }
  try {
    const payload = verifyAccessToken(header.slice("Bearer ".length));
    req.auth = { userId: payload.sub, roles: payload.roles, capacities: payload.capacities };
  } catch {
    // Anonymous fallback: an expired/invalid token on a public route should not block access.
  }
  next();
}

/** Allows access if req.auth carries a role whose weight is >= the given minimum role. */
export function requireRole(minRole: SystemRole) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new UnauthorizedError());
      return;
    }
    const highestWeight = Math.max(...req.auth.roles.map((role) => ROLE_WEIGHT[role]));
    if (highestWeight < ROLE_WEIGHT[minRole]) {
      next(new ForbiddenError());
      return;
    }
    next();
  };
}

export function requireCapability(capacity: MemberCapacity) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth?.capacities.includes(capacity)) {
      next(new ForbiddenError(`Cette action requiert la capacité « ${capacity} »`));
      return;
    }
    next();
  };
}
