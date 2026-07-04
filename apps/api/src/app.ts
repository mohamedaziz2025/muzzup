import { join } from "node:path";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import { pinoHttp } from "pino-http";
import { logger } from "./config/logger.js";
import { env } from "./config/env.js";
import { apiV1Router } from "./routes/index.js";
import { sanitizeInputs } from "./middlewares/sanitize.js";
import { globalRateLimiter } from "./middlewares/rate-limit.js";
import { notFoundHandler } from "./middlewares/not-found.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { stripeWebhookHandler } from "./modules/billing/billing.webhook.js";

export function createApp(): express.Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: "same-site" },
    }),
  );
  app.use(
    cors({
      origin: env.WEB_URL,
      credentials: true,
    }),
  );
  app.use(compression());

  // Stripe requires the raw, unparsed body to verify webhook signatures — must be mounted
  // before the global JSON body parser below.
  app.post(
    "/api/v1/billing/webhook",
    express.raw({ type: "application/json" }),
    stripeWebhookHandler,
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());
  app.use(sanitizeInputs);
  app.use(
    pinoHttp({
      logger,
      autoLogging: { ignore: (req) => req.url === "/api/v1/health" },
    }),
  );
  app.use(globalRateLimiter);

  app.use("/uploads", express.static(join(process.cwd(), "uploads")));

  app.use("/api/v1", apiV1Router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
