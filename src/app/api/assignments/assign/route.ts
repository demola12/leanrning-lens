import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { teacher_user_id, assignment_id, student_ids, due_date } = await req.json();

    if (!teacher_user_id || !assignment_id || !student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: teacher } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", teacher_user_id)
      .single();

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // For each student, create or skip if already assigned
    const results: any[] = [];
    for (const student_id of student_ids) {
      const { data: existing } = await supabaseAdmin
        .from("assigned_assignments")
        .select("id")
        .eq("assignment_id", assignment_id)
        .eq("student_id", student_id)
        .maybeSingle();

      if (existing) {
        results.push({ student_id, status: "already_assigned" });
        continue;
      }

      const { data, error } = await supabaseAdmin
        .from("assigned_assignments")
        .insert({
          assignment_id,
          teacher_id: teacher.id,
          student_id,
          due_date: due_date || null,
          status: "assigned",
        })
        .select("id")
        .single();

      if (error) {
        results.push({ student_id, status: "error", error: error.message });
      } else {
        results.push({ student_id, status: "assigned", id: data.id });
      }
    }

    return NextResponse.json({ results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
