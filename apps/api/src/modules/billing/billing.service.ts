import { stripeClient } from "../../lib/stripe.js";
import { env } from "../../config/env.js";
import { UserModel } from "../../models/user.model.js";
import { SubscriptionModel } from "../../models/subscription.model.js";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";
import { logger } from "../../config/logger.js";
import { providersService } from "../providers/providers.service.js";
import type Stripe from "stripe";

function requireStripe() {
  if (!stripeClient) {
    throw new BadRequestError("La facturation Stripe n'est pas configurée sur cet environnement");
  }
  return stripeClient;
}

async function ensureStripeCustomer(userId: string): Promise<string> {
  const stripe = requireStripe();
  const user = await UserModel.findById(userId).exec();
  if (!user) throw new NotFoundError("Utilisateur introuvable");

  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.fullName,
    metadata: { userId: user._id.toString() },
  });
  user.stripeCustomerId = customer.id;
  await user.save();
  return customer.id;
}

export const billingService = {
  async createCheckoutSession(userId: string) {
    const stripe = requireStripe();
    if (!env.STRIPE_PRICE_ID_SUBSCRIPTION) {
      throw new BadRequestError("Aucun tarif d'abonnement configuré");
    }
    const customerId = await ensureStripeCustomer(userId);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: env.STRIPE_PRICE_ID_SUBSCRIPTION, quantity: 1 }],
      success_url: `${env.WEB_URL}/tableau-de-bord/abonnement?checkout=success`,
      cancel_url: `${env.WEB_URL}/abonnement?checkout=cancelled`,
      allow_promotion_codes: true,
    });

    return { url: session.url };
  },

  async createPortalSession(userId: string) {
    const stripe = requireStripe();
    const user = await UserModel.findById(userId).exec();
    if (!user?.stripeCustomerId) {
      throw new BadRequestError("Aucun abonnement Stripe associé à ce compte");
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${env.WEB_URL}/tableau-de-bord/abonnement`,
    });
    return { url: session.url };
  },

  async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.type === "sponsorship" && session.metadata.providerId) {
          await providersService.activateSponsorship(session.metadata.providerId, session.id);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const user = await UserModel.findOne({ stripeCustomerId: sub.customer as string }).exec();
        if (!user) {
          logger.warn({ customerId: sub.customer }, "Webhook Stripe : utilisateur introuvable");
          break;
        }

        // `current_period_end` moved across Stripe API versions (subscription item vs.
        // subscription root); read defensively rather than pin to one shape.
        const subAny = sub as unknown as {
          current_period_end?: number;
          items: { data: Array<{ current_period_end?: number }> };
        };
        const periodEndSeconds =
          subAny.items.data[0]?.current_period_end ?? subAny.current_period_end ?? 0;
        const currentPeriodEnd = new Date(periodEndSeconds * 1000);

        await SubscriptionModel.findOneAndUpdate(
          { stripeSubscriptionId: sub.id },
          {
            userId: user._id,
            stripeCustomerId: sub.customer as string,
            stripeSubscriptionId: sub.id,
            status: sub.status,
            currentPeriodEnd,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
          { upsert: true },
        );

        const isActive = sub.status === "active" || sub.status === "trialing";
        const hasSubscriberRole = user.roles.includes("subscriber");
        if (isActive && !hasSubscriberRole) {
          user.roles = [...user.roles, "subscriber"] as typeof user.roles;
          await user.save();
        } else if (!isActive && hasSubscriberRole) {
          user.roles = user.roles.filter((r) => r !== "subscriber") as typeof user.roles;
          await user.save();
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const user = await UserModel.findOne({ stripeCustomerId: sub.customer as string }).exec();
        if (user) {
          user.roles = user.roles.filter((r) => r !== "subscriber") as typeof user.roles;
          await user.save();
        }
        await SubscriptionModel.findOneAndUpdate(
          { stripeSubscriptionId: sub.id },
          { status: "canceled" },
        );
        break;
      }

      default:
        logger.info({ type: event.type }, "Événement Stripe ignoré");
    }
  },
};
