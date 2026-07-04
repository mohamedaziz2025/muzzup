import Stripe from "stripe";
import { env } from "../config/env.js";

/** Null when Stripe credentials are not configured (local dev without billing). */
export const stripeClient: Stripe | null = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY)
  : null;
