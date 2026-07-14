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
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const profileId = session.metadata?.profile_id;
        const plan = session.metadata?.plan || "pro";

        if (!profileId) break;

        const subscriptionId = session.subscription as string;
        const sub: any = await stripe.subscriptions.retrieve(subscriptionId);

        await supabaseAdmin.from("subscriptions").upsert({
          profile_id: profileId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
          plan,
          status: sub.status,
          current_period_start: toISO(sub.current_period_start),
          current_period_end: toISO(sub.current_period_end),
        });
        break;
      }

      case "invoice.paid":
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription as string;
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
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
