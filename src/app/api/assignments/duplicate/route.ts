import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { user_id, assignment_id } = await req.json();

    if (!user_id || !assignment_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get original assignment
    const { data: original } = await supabaseAdmin
      .from("assignments")
      .select("*")
      .eq("id", assignment_id)
      .single();

    if (!original) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Load questions from storage
    const { data: fileData } = await supabaseAdmin.storage
      .from("assignments")
      .download(original.filename);

    let questions: any[] = [];
    if (fileData) {
      const text = await fileData.text();
      try { questions = JSON.parse(text); } catch {}
    }

    // Create new filename
    const newId = crypto.randomUUID();
    const newFilename = `assignments/${user_id}/${newId}.json`;

    // Upload copy to storage
    await supabaseAdmin.storage
      .from("assignments")
      .upload(newFilename, JSON.stringify(questions), {
        contentType: "application/json",
        upsert: true,
      });

    // Insert duplicate in DB
    const { data, error } = await supabaseAdmin
      .from("assignments")
      .insert({
        teacher_id: original.teacher_id,
        filename: newFilename,
        title: `${original.title} (copy)`,
        subject: original.subject,
        question_count: original.question_count,
        total_points: original.total_points,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
