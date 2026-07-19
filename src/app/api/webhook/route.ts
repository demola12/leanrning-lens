import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";


function toISO(ts: any): string | null {
  if (!ts) return null;
  const num = typeof ts === "number" ? ts : parseInt(ts);
  if (isNaN(num)) return null;
  const ms = num > 100000000000 ? num : num * 1000;
  return new Date(ms).toISOString();
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  let event;
  try {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    console.log("Webhook received type:", event.type);
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("checkout.session.completed:", { profile_id: session.metadata?.profile_id, plan: session.metadata?.plan, customer: session.customer, subscription: session.subscription });
        const profileId = session.metadata?.profile_id;
        const plan = session.metadata?.plan || "solo";

        if (!profileId) {
          console.log("Missing profile_id in session metadata");
          break;
        }

        const subscriptionId = session.subscription as string;
        if (!subscriptionId) {
          console.log("No subscription in session");
          break;
        }

        const sub: any = await stripe.subscriptions.retrieve(subscriptionId);
        console.log("Subscription retrieved:", { status: sub.status, plan });

        await supabaseAdmin.from("subscriptions").upsert({
          profile_id: profileId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
          plan,
          status: sub.status,
          current_period_start: toISO(sub.current_period_start),
          current_period_end: toISO(sub.current_period_end),
        });
        console.log("Subscription upserted for profile:", profileId);
        break;
      }

      case "invoice.paid":
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription as string;
        console.log("invoice event:", { type: event.type, subscriptionId });
        if (!subscriptionId) break;

        const sub: any = await stripe.subscriptions.retrieve(subscriptionId);
        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: sub.status,
            current_period_start: toISO(sub.current_period_start),
            current_period_end: toISO(sub.current_period_end),
          })
          .eq("stripe_subscription_id", subscriptionId);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub: any = event.data.object;
        console.log("subscription event:", { type: event.type, id: sub.id, status: sub.status });
        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: sub.status,
            current_period_start: toISO(sub.current_period_start),
            current_period_end: toISO(sub.current_period_end),
          })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      default:
        console.log("Unhandled webhook event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
