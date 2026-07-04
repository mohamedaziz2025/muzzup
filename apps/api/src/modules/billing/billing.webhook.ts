import type { Request, Response } from "express";
import { stripeClient } from "../../lib/stripe.js";
import { env } from "../../config/env.js";
import { billingService } from "./billing.service.js";
import { logger } from "../../config/logger.js";
import { BadRequestError } from "../../lib/errors.js";

/** Expects express.raw() upstream so the raw body is available for Stripe signature verification. */
export async function stripeWebhookHandler(req: Request, res: Response): Promise<void> {
  if (!stripeClient || !env.STRIPE_WEBHOOK_SECRET) {
    throw new BadRequestError("Webhook Stripe non configuré");
  }

  const signature = req.headers["stripe-signature"];
  if (typeof signature !== "string") {
    throw new BadRequestError("Signature Stripe manquante");
  }

  let event;
  try {
    event = stripeClient.webhooks.constructEvent(
      req.body as Buffer,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    logger.warn({ err }, "Signature de webhook Stripe invalide");
    res.status(400).send("Signature invalide");
    return;
  }

  await billingService.handleWebhookEvent(event);
  res.status(200).json({ received: true });
}
