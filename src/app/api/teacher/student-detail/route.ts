import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("student_id");

  if (!studentId) {
    return NextResponse.json({ error: "Missing student_id" }, { status: 400 });
  }

  // Get student profile
  const { data: student } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, ref_uuid, email, created_at")
    .eq("id", studentId)
    .single();

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // Get all assigned assignments for this student with assignment details
  const { data: assigned } = await supabaseAdmin
    .from("assigned_assignments")
    .select("*, assignment:assignment_id(*)")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  // Load submission cache for each graded/submitted assignment
  const items = await Promise.all(
    (assigned || []).map(async (a: any) => {
      let submission = null;
      if (a.submission_cache) {
        const { data: fileData } = await supabaseAdmin.storage
          .from("assignments")
          .download(a.submission_cache);
        if (fileData) {
          try { submission = JSON.parse(await fileData.text()); } catch {}
        }
      }
      return { ...a, submission };
    })
  );

  return NextResponse.json({ student, assignments: items });
}
