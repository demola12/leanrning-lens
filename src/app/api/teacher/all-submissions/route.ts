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

  const { data: teacher } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from("assigned_assignments")
    .select("id, status, score, submitted_at, created_at, student:student_id(id, full_name, ref_uuid), assignment:assignment_id(id, title, question_count, total_points)")
    .eq("teacher_id", teacher.id)
    .in("status", ["submitted", "graded"])
    .order("submitted_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submissions: data || [] });
}
