import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: NextRequest) {
  try {
    const { user_id, assignment_id } = await req.json();

    if (!user_id || !assignment_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get assignment to find storage path
    const { data: assignment } = await supabaseAdmin
      .from("assignments")
      .select("filename")
      .eq("id", assignment_id)
      .single();

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Delete from storage
    if (assignment.filename) {
      await supabaseAdmin.storage
        .from("assignments")
        .remove([assignment.filename]);
    }

    // Delete from DB
    const { error } = await supabaseAdmin
      .from("assignments")
      .delete()
      .eq("id", assignment_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
