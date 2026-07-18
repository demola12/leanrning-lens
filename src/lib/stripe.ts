import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia" as any,
});

export const PLANS = {
  free: { id: "free", name: "Free", price: 0, priceId: null },
  solo: { id: "solo", name: "Solo ⭐", price: 599, priceId: "price_1TslBfAdFX1Dzs395NyUa8BT" },
  family: { id: "family", name: "Family", price: 1099, priceId: "price_1TslBwAdFX1Dzs39tlKRZ12e" },
  unlimited: { id: "unlimited", name: "Unlimited", price: 2099, priceId: "price_1TslBwAdFX1Dzs39tlKRZ12e" },
} as const;

export type PlanId = keyof typeof PLANS;
