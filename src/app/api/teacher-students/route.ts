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

  // Get teacher profile
  const { data: teacher, error: tErr } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (tErr || !teacher) {
    return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
  }

  // Get linked students
  const { data: links, error: lErr } = await supabaseAdmin
    .from("teacher_students")
    .select("student_id")
    .eq("teacher_id", teacher.id);

  if (lErr) {
    return NextResponse.json({ error: lErr.message }, { status: 500 });
  }

  if (!links || links.length === 0) {
    return NextResponse.json({ students: [] });
  }

  const studentIds = links.map((l: any) => l.student_id);

  const { data: students, error: sErr } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, ref_uuid, email, created_at")
    .in("id", studentIds);

  if (sErr) {
    return NextResponse.json({ error: sErr.message }, { status: 500 });
  }

  return NextResponse.json({ students: students || [] });
}
