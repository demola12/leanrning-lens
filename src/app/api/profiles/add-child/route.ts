import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_LIMITS: Record<string, number> = {
  solo: 1,
  family: 3,
  unlimited: Infinity,
};

function generateRefUuid(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const { user_id, full_name } = await req.json();

    if (!user_id || !full_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: parent } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("user_id", user_id)
      .is("parent_profile_id", null)
      .single();

    if (!parent) {
      return NextResponse.json({ error: "Parent profile not found" }, { status: 404 });
    }

    // Check plan limits
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("plan")
      .eq("profile_id", parent.id)
      .maybeSingle();

    const plan = subscription?.plan as string || "solo";
    const limit = PLAN_LIMITS[plan] || 1;

    const { count } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("parent_profile_id", parent.id);

    if (count !== null && count >= limit) {
      return NextResponse.json({
        error: `Your ${plan} plan allows up to ${limit === Infinity ? 'unlimited' : limit} student profile${limit !== 1 ? 's' : ''}. Upgrade to add more.`,
      }, { status: 403 });
    }

    let ref_uuid = generateRefUuid();
    let attempts = 0;
    while (attempts < 10) {
      const { data: existing } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("ref_uuid", ref_uuid)
        .maybeSingle();
      if (!existing) break;
      ref_uuid = generateRefUuid();
      attempts++;
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .insert({
        user_id,
        ref_uuid,
        full_name,
        role: "student",
        email: parent.email,
        parent_profile_id: parent.id,
      })
      .select()
      .single();

    if (error) {
      console.error("add-child insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data, ref_uuid });
  } catch (err: any) {
    console.error("add-child catch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
