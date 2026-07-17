import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .is("parent_profile_id", null)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: children } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, ref_uuid, email, created_at")
    .eq("parent_profile_id", profile.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ children: children || [] });
}
