import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function toISO(ts: any): string | null {
  if (!ts) return null;
  const num = typeof ts === "number" ? ts : parseInt(ts);
  if (isNaN(num)) return null;
  // Stripe uses seconds, JS Date uses milliseconds
  const ms = num > 100000000000 ? num : num * 1000;
  return new Date(ms).toISOString();
}

export async function POST(req: NextRequest) {
  try {
    const { user_id, session_id } = await req.json();

    if (!user_id || !session_id) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const subscriptionId = session.subscription as string;
    if (!subscriptionId) {
      return NextResponse.json({ error: "No subscription in session" }, { status: 400 });
    }

    const sub: any = await stripe.subscriptions.retrieve(subscriptionId);
    const plan = session.metadata?.plan || "pro";

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", user_id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Delete existing subscription for this profile to ensure clean state
    await supabaseAdmin
      .from("subscriptions")
      .delete()
      .eq("profile_id", profile.id);

    const { error: upsertError } = await supabaseAdmin.from("subscriptions").insert({
      profile_id: profile.id,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionId,
      plan,
      status: sub.status,
      current_period_start: toISO(sub.current_period_start) || toISO(sub.created),
      current_period_end: toISO(sub.current_period_end),
    });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, plan, status: sub.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
