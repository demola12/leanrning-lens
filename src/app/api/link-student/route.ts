import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { logActivity } from "@/lib/activities";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_STUDENT_LIMITS: Record<string, number> = {
  free: 5,
  pro: Infinity,
  premium: Infinity,
  solo: Infinity,
  family: Infinity,
  unlimited: Infinity,
};

export async function POST(req: NextRequest) {
  try {
    const { student_ref_uuid, teacher_ref } = await req.json();

    if (!student_ref_uuid || !teacher_ref) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get teacher profile by ref_uuid
    const { data: teacher, error: tErr } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name")
      .eq("ref_uuid", teacher_ref.toUpperCase())
      .single();

    if (tErr || !teacher) {
      return NextResponse.json({ error: "Teacher not found with that reference" }, { status: 404 });
    }

    // Get teacher's subscription plan (defaults to free)
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("plan")
      .eq("profile_id", teacher.id)
      .maybeSingle();

    const teacherPlan = (subscription?.plan as string) || "free";
    const studentLimit = PLAN_STUDENT_LIMITS[teacherPlan] || 5;

    // Count current students
    const { count: currentCount } = await supabaseAdmin
      .from("teacher_students")
      .select("*", { count: "exact", head: true })
      .eq("teacher_id", teacher.id);

    if (currentCount !== null && currentCount >= studentLimit) {
      const limitText = studentLimit === Infinity ? "no limit" : `a maximum of ${studentLimit}`;
      return NextResponse.json({
        error: `Your ${teacherPlan} plan allows ${limitText} students. Please upgrade to add more.`,
      }, { status: 403 });
    }

    // Get student profile by ref_uuid
    const { data: student, error: sErr } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name")
      .eq("ref_uuid", student_ref_uuid.toUpperCase())
      .single();

    if (sErr || !student) {
      return NextResponse.json({ error: "Student not found with that UUID" }, { status: 404 });
    }

    // Check if already linked
    const { data: existing } = await supabaseAdmin
      .from("teacher_students")
      .select("id")
      .eq("teacher_id", teacher.id)
      .eq("student_id", student.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Student already connected to this teacher" }, { status: 409 });
    }

    // Create link
    const { error } = await supabaseAdmin
      .from("teacher_students")
      .insert({ teacher_id: teacher.id, student_id: student.id });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logActivity({
      teacher_id: teacher.id,
      type: "student_joined",
      description: `${student.full_name} joined via invite`,
      student_id: student.id,
      metadata: { student_name: student.full_name },
    });

    return NextResponse.json({ success: true, student });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
