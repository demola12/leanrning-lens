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

  const { data: student } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!student) {
    return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from("assigned_assignments")
    .select("*, assignment:assignment_id(*)")
    .eq("student_id", student.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Load questions from storage for each assignment
  const items = await Promise.all(
    (data || []).map(async (a: any) => {
      let questions: any[] = [];
      if (a.assignment?.filename) {
        const { data: fileData } = await supabaseAdmin.storage
          .from("assignments")
          .download(a.assignment.filename);
        if (fileData) {
          try { questions = JSON.parse(await fileData.text()); } catch {}
        }
      }
      return { ...a, assignment: { ...a.assignment, questions } };
    })
  );

  return NextResponse.json({ assignments: items });
}
