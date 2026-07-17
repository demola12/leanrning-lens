import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  const profileId = req.nextUrl.searchParams.get("profile_id");

  let studentId: string;

  if (profileId) {
    studentId = profileId;
  } else if (userId) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();
    if (!profile) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    studentId = profile.id;
  } else {
    return NextResponse.json({ error: "Missing user_id or profile_id" }, { status: 400 });
  }

  const { data: links } = await supabaseAdmin
    .from("teacher_students")
    .select("teacher_id")
    .eq("student_id", studentId);

  if (!links || links.length === 0) {
    return NextResponse.json({ teachers: [] });
  }

  const teacherIds = links.map((l: any) => l.teacher_id);

  const { data: teachers } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email, ref_uuid")
    .in("id", teacherIds);

  return NextResponse.json({ teachers: teachers || [] });
}
