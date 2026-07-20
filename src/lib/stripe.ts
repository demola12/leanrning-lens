import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia" as any,
});

export const PLANS = {
  free: { id: "free", name: "Free", price: 0, priceId: null },
  solo: { id: "solo", name: "Solo ⭐", price: 599, priceId: "price_1Tuo5oAdFX1Dzs39A2MRHn5G" },
  family: { id: "family", name: "Family", price: 1099, priceId: "price_1Tuo5oAdFX1Dzs39OwlKQHLN" },
  unlimited: { id: "unlimited", name: "Unlimited", price: 2099, priceId: "price_1Tuo5pAdFX1Dzs390LhTdD46" },
  pro: { id: "pro", name: "Pro", price: 1200, priceId: "price_1TvEjRAdFX1Dzs39aEBGLWUD" },
  premium: { id: "premium", name: "Premium", price: 2900, priceId: "price_1TvEjSAdFX1Dzs39VRLWqpG5" },
} as const;

export type PlanId = keyof typeof PLANS;
