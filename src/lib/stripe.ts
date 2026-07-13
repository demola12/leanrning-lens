import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31eb45e9b" as any,
});

export const PLANS = {
  free: { id: "free", name: "Free", price: 0, priceId: null },
  pro: { id: "pro", name: "Pro", price: 1200, priceId: "price_1TslBfAdFX1Dzs395NyUa8BT" },
  premium: { id: "premium", name: "Premium", price: 2900, priceId: "price_1TslBwAdFX1Dzs39tlKRZ12e" },
} as const;

export type PlanId = keyof typeof PLANS;
