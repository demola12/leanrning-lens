import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get("profile_id");
  const teacherId = req.nextUrl.searchParams.get("teacher_id");

  if (!profileId) {
    return NextResponse.json({ error: "Missing profile_id" }, { status: 400 });
  }

  let query = supabaseAdmin
    .from("student_library")
    .select("*")
    .eq("student_profile_id", profileId)
    .order("created_at", { ascending: false });

  if (teacherId) {
    query = query.eq("teacher_id", teacherId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data || [] });
}
