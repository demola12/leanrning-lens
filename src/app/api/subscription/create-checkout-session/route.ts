import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { user_id, plan, role } = await req.json();

    if (!user_id || !plan || !["solo", "family", "unlimited"].includes(plan)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("user_id", user_id)
      .is("parent_profile_id", null)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Determine correct settings URL based on role
    const rolePath = profile.role === "student" ? "/student/settings" : "/teacher/settings";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Get or create Stripe customer
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("profile_id", profile.id)
      .maybeSingle();

    let customerId = sub?.stripe_customer_id;
    const hasExistingSubscription = sub?.stripe_customer_id ? true : false;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.full_name,
        metadata: { profile_id: profile.id },
      });
      customerId = customer.id;
    }

    const planConfig = PLANS[plan as keyof typeof PLANS];

    // Set trial until end of month for new subscriptions only
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
    const trialEnd = Math.floor(endOfMonth.getTime() / 1000);

    const subscriptionData: any = {};
    if (!hasExistingSubscription) {
      subscriptionData.trial_end = trialEnd;
    }

    const successPath = rolePath === "/teacher/settings" ? rolePath : "/student/onboarding";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: planConfig.priceId!, quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: subscriptionData,
      success_url: `${baseUrl}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${successPath}`,
      metadata: { profile_id: profile.id, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
