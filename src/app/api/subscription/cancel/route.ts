import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", user_id)
      .is("parent_profile_id", null)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (!sub?.stripe_subscription_id) {
      return NextResponse.json({ error: "No active subscription" }, { status: 404 });
    }

    // Cancel at period end
    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
