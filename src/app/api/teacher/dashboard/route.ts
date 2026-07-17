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

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const results = await Promise.allSettled([
    supabaseAdmin.from("teacher_students").select("*", { count: "exact", head: true }).eq("teacher_id", teacherId),
    supabaseAdmin.from("assignments").select("*", { count: "exact", head: true }).eq("teacher_id", teacherId),
    supabaseAdmin.from("assigned_assignments").select("id, status, due_date").eq("teacher_id", teacherId),
    supabaseAdmin.from("assigned_assignments")
      .select("id, status, submitted_at, student:student_id(id, full_name), assignment:assignment_id(id, title)")
      .eq("teacher_id", teacherId)
      .eq("status", "submitted")
      .order("submitted_at", { ascending: false })
      .limit(5),
    supabaseAdmin.from("assignments")
      .select("id, title, status, created_at, updated_at")
      .eq("teacher_id", teacherId)
      .gte("created_at", twentyFourHoursAgo)
      .order("created_at", { ascending: false })
      .limit(5),
    supabaseAdmin.from("assignments")
      .select("id, title, status, created_at, updated_at")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false })
      .limit(3),
    supabaseAdmin.from("assigned_assignments")
      .select("id, status, submitted_at, created_at, student:student_id(id, full_name), assignment:assignment_id(id, title)")
      .eq("teacher_id", teacherId)
      .in("status", ["submitted", "graded"])
      .order("submitted_at", { ascending: false })
      .limit(10),
  ]);

  const getCount = (r: PromiseSettledResult<any>, fallback = 0) =>
    r.status === "fulfilled" ? (r.value.count ?? fallback) : fallback;
  const getData = (r: PromiseSettledResult<any>, fallback: any[] = []) =>
    r.status === "fulfilled" ? (r.value.data ?? fallback) : fallback;

  const studentCount = getCount(results[0]);
  const assignmentCount = getCount(results[1]);
  const assignedData = getData(results[2]);
  const pendingReviews = getData(results[3]);
  const recentAssignments24h = getData(results[4]);
  const recentAssignmentsFallback = getData(results[5]);
  const recentActivity = getData(results[6]);

  const recentAssignments = recentAssignments24h.length > 0
    ? recentAssignments24h
    : recentAssignmentsFallback;

  const activeAssignments = assignedData.filter(
    (a: any) => a.status !== "draft"
  ).length;

  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);
  const dueThisWeek = assignedData.filter((a: any) => {
    if (!a.due_date) return false;
    const due = new Date(a.due_date);
    return due >= now && due <= endOfWeek && a.status !== "submitted" && a.status !== "graded";
  }).length;

  const submissions = recentActivity.map((s: any) => ({
    id: s.id,
    type: s.status === "graded" ? "graded" : "submitted",
    student: s.student || null,
    assignment: s.assignment || null,
    timestamp: s.submitted_at || s.created_at || "",
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
