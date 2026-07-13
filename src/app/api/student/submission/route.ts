import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  const assignedId = req.nextUrl.searchParams.get("assigned_id");

  if (!userId || !assignedId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Get the assigned record to find the cache path
  const { data: assigned } = await supabaseAdmin
    .from("assigned_assignments")
    .select("submission_cache, score, status, submitted_at, teacher_notes")
    .eq("id", assignedId)
    .single();

  if (!assigned) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  // Load cache from storage
  if (assigned.submission_cache) {
    const { data: fileData } = await supabaseAdmin.storage
      .from("assignments")
      .download(assigned.submission_cache);

    if (fileData) {
      try {
        const cache = JSON.parse(await fileData.text());
        return NextResponse.json({ ...cache, teacher_notes: assigned.teacher_notes });
      } catch {}
    }
  }

  // Fallback: return basic info
  return NextResponse.json({
    score: assigned.score,
    status: assigned.status,
    submitted_at: assigned.submitted_at,
    teacher_notes: assigned.teacher_notes,
  });
}
