import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const assignmentId = req.nextUrl.searchParams.get("assignment_id");

  if (!assignmentId) {
    return NextResponse.json({ error: "Missing assignment_id" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("assigned_assignments")
    .select("*, student:student_id(id, full_name, ref_uuid, email)")
    .eq("assignment_id", assignmentId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ assigned: data || [] });
}
