import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { data: assignment, error } = await supabaseAdmin
    .from("assignments")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  // Load questions from storage
  const { data: fileData } = await supabaseAdmin.storage
    .from("assignments")
    .download(assignment.filename);

  let questions: any[] = [];
  if (fileData) {
    const text = await fileData.text();
    try { questions = JSON.parse(text); } catch {}
  }

  return NextResponse.json({ ...assignment, questions });
}
