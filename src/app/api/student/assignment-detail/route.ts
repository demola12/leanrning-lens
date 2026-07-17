import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const assignedId = req.nextUrl.searchParams.get("assigned_id");

  if (!assignedId) {
    return NextResponse.json({ error: "Missing assigned_id" }, { status: 400 });
  }

  const { data: assigned, error } = await supabaseAdmin
    .from("assigned_assignments")
    .select("*, assignment:assignment_id(*)")
    .eq("id", assignedId)
    .single();

  if (error || !assigned) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  let questions: any[] = [];
  if (assigned.assignment?.filename) {
    const { data: fileData } = await supabaseAdmin.storage
      .from("assignments")
      .download(assigned.assignment.filename);
    if (fileData) {
      try { questions = JSON.parse(await fileData.text()); } catch {}
    }
  }

  return NextResponse.json({ ...assigned, assignment: { ...assigned.assignment, questions } });
}
