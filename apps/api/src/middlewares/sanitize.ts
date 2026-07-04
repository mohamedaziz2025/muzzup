import type { NextFunction, Request, Response } from "express";
import mongoSanitize from "express-mongo-sanitize";

/**
 * Express 5 exposes req.query/req.params as getter-only accessors, so we mutate the
 * returned objects in place via mongoSanitize.sanitize() instead of using its middleware
 * factory (which reassigns req.query and throws under Express 5).
 */
export function sanitizeInputs(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === "object") {
    mongoSanitize.sanitize(req.body, { replaceWith: "_" });
  }
  if (req.query && typeof req.query === "object") {
    mongoSanitize.sanitize(req.query as Record<string, unknown>, { replaceWith: "_" });
  }
  if (req.params && typeof req.params === "object") {
    mongoSanitize.sanitize(req.params as Record<string, unknown>, { replaceWith: "_" });
  }
  next();
}
