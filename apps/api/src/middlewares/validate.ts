import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

interface ValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

/** Validates and replaces req.body/query/params with the parsed (and coerced) Zod output. */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        // Express 5 exposes req.query as a getter-only accessor; store parsed output separately.
        (req as Request & { validatedQuery?: unknown }).validatedQuery = schemas.query.parse(
          req.query,
        );
      }
      if (schemas.params) {
        (req as Request & { validatedParams?: unknown }).validatedParams = schemas.params.parse(
          req.params,
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
