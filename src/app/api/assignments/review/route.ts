import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { assigned_id, score, notes } = await req.json();

    if (!assigned_id) {
      return NextResponse.json({ error: "Missing assigned_id" }, { status: 400 });
    }

    const updates: any = {
      status: "reviewed",
      graded_at: new Date().toISOString(),
    };

    if (score !== undefined) {
      updates.score = score;
    }

    if (notes !== undefined) {
      updates.teacher_notes = notes;
    }

    const { error } = await supabaseAdmin
      .from("assigned_assignments")
      .update(updates)
      .eq("id", assigned_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
