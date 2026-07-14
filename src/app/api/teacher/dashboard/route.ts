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
    .select("id, full_name")
    .eq("user_id", userId)
    .single();

  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  const teacherId = teacher.id;

  const [
    { count: studentCount },
    { count: assignmentCount },
    { data: assignedData },
    { data: pendingReviews },
    { data: recentAssignments },
    { data: recentActivity },
  ] = await Promise.all([
    supabaseAdmin
      .from("teacher_students")
      .select("*", { count: "exact", head: true })
      .eq("teacher_id", teacherId),
    supabaseAdmin
      .from("assignments")
      .select("*", { count: "exact", head: true })
      .eq("teacher_id", teacherId),
    supabaseAdmin
      .from("assigned_assignments")
      .select("id, status, due_date")
      .eq("teacher_id", teacherId),
    supabaseAdmin
      .from("assigned_assignments")
      .select("id, status, submitted_at, student:student_id(id, full_name), assignment:assignment_id(id, title)")
      .eq("teacher_id", teacherId)
      .eq("status", "submitted")
      .order("submitted_at", { ascending: false }),
    supabaseAdmin
      .from("assignments")
      .select("id, title, status, created_at, updated_at")
      .eq("teacher_id", teacherId)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabaseAdmin
      .from("assigned_assignments")
      .select("id, status, submitted_at, created_at, student:student_id(id, full_name), assignment:assignment_id(id, title)")
      .eq("teacher_id", teacherId)
      .in("status", ["submitted", "graded"])
      .order("submitted_at", { ascending: false })
      .limit(10),
  ]);

  const activeAssignments = (assignedData || []).filter(
    (a: any) => a.status !== "draft"
  ).length;

  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);
  const dueThisWeek = (assignedData || []).filter((a: any) => {
    if (!a.due_date) return false;
    const due = new Date(a.due_date);
    return due >= now && due <= endOfWeek && a.status !== "submitted" && a.status !== "graded";
  }).length;

  const submissions = (recentActivity || []).map((s: any) => ({
    id: s.id,
    type: s.status === "graded" ? "graded" : "submitted",
    student: s.student,
    assignment: s.assignment,
    timestamp: s.submitted_at || s.created_at,
  }));

  return NextResponse.json({
    teacherName: teacher.full_name,
    stats: {
      students: studentCount || 0,
      assignments: assignmentCount || 0,
      activeAssignments,
      pendingReviews: pendingReviews?.length || 0,
      dueThisWeek,
    },
    recentAssignments: recentAssignments || [],
    pendingReviews: pendingReviews || [],
    activity: submissions,
  });
}
