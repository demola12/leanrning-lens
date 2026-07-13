import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateRefUuid(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const { user_id, full_name, role, email } = await req.json();

    if (!user_id || !full_name || !role || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
        role,
        email,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data, ref_uuid });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
