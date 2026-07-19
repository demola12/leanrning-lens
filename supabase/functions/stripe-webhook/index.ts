import "@supabase/functions-js/edge-runtime.d.ts"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

interface StripeSubscription {
  id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  created: number;
}

function toISO(ts: number | null | undefined): string | null {
  if (!ts) return null;
  const ms = ts > 100000000000 ? ts : ts * 1000;
  return new Date(ms).toISOString();
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

async function stripeGet(path: string) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { "Authorization": `Bearer ${STRIPE_SECRET_KEY}` },
  });
  return res.json();
}

Deno.serve(async (req) => {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature") || "";

    if (!STRIPE_WEBHOOK_SECRET) {
      console.error("STRIPE_WEBHOOK_SECRET not set");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), { status: 500 });
    }

    const encoder = new TextEncoder();

    const parts = sig.split(",");
    let sigTimestamp = "";
    let sigSignature = "";
    for (const part of parts) {
      const [k, v] = part.split("=");
      if (k === "t") sigTimestamp = v;
      if (k === "v1") sigSignature = v;
    }

    const payload = `${sigTimestamp}.${body}`;

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(STRIPE_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigBytes = hexToBytes(sigSignature);
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(payload));

    if (!valid) {
      console.error("Signature mismatch");
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
    }

    const event = JSON.parse(body);
    console.log(`Webhook received: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const profileId = session.metadata?.profile_id;
        const plan = session.metadata?.plan || "solo";

        console.log("checkout.session.completed", {
          profileId,
          plan,
          customer: session.customer,
          subscription: session.subscription,
          metadata: session.metadata,
          session_keys: Object.keys(session),
        });

        if (!profileId) {
          console.error("Missing profile_id in session metadata");
          break;
        }

        const subscriptionId = session.subscription;
        if (!subscriptionId) {
          console.error("No subscription in session");
          break;
        }

        const sub: StripeSubscription = await stripeGet(`/subscriptions/${subscriptionId}`);

        const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/subscriptions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            "Prefer": "resolution=merge-duplicates",
          },
          body: JSON.stringify({
            profile_id: profileId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: subscriptionId,
            plan,
            status: sub.status,
            current_period_start: toISO(sub.current_period_start),
            current_period_end: toISO(sub.current_period_end),
          }),
        });

        if (!upsertRes.ok) {
          const errText = await upsertRes.text();
          console.error("Failed to upsert subscription:", upsertRes.status, errText);
        } else {
          console.log("Subscription upserted for profile:", profileId);
        }
        break;
      }

      case "invoice.paid":
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription || invoice.subscription_item || invoice.subscriptions;

        console.log("invoice event:", { type: event.type, subscriptionId, invoice_keys: Object.keys(invoice) });

        if (!subscriptionId) break;

        const sub: StripeSubscription = await stripeGet(`/subscriptions/${subscriptionId}`);

        await fetch(
          `${SUPABASE_URL}/rest/v1/subscriptions?stripe_subscription_id=eq.${subscriptionId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "apikey": SUPABASE_SERVICE_ROLE_KEY,
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              status: sub.status,
              current_period_start: toISO(sub.current_period_start),
              current_period_end: toISO(sub.current_period_end),
            }),
          }
        );
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;

        console.log("subscription event:", { type: event.type, id: sub.id, status: sub.status });

        await fetch(
          `${SUPABASE_URL}/rest/v1/subscriptions?stripe_subscription_id=eq.${sub.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "apikey": SUPABASE_SERVICE_ROLE_KEY,
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              status: sub.status,
              current_period_start: toISO(sub.current_period_start),
              current_period_end: toISO(sub.current_period_end),
            }),
          }
        );
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Webhook handler error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
