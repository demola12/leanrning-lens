import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { logActivity } from "@/lib/activities";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { user_id, title, description, subject, questions, question_count, total_points, time_limit, id } = await req.json();

    if (!user_id || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: teacher } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", user_id)
      .single();

    if (!teacher) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
    }

    const filename = `assignments/${user_id}/${id || crypto.randomUUID()}.json`;
    const storagePath = `${user_id}/${id || crypto.randomUUID()}.json`;

    // Upload questions JSON to storage
    const questionsJson = JSON.stringify(questions || []);
    const { error: uploadError } = await supabaseAdmin.storage
      .from("assignments")
      .upload(storagePath, questionsJson, {
        contentType: "application/json",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Upsert assignment metadata in DB
    const payload: any = {
      teacher_id: teacher.id,
      filename: storagePath,
      title,
      description: description || "",
      subject: subject || "",
      question_count: question_count || 0,
      total_points: total_points || 0,
      time_limit: time_limit || 0,
    };

    if (id) {
      const { data: existing } = await supabaseAdmin
        .from("assignments")
        .select("id")
        .eq("id", id)
        .single();

      if (existing) {
        payload.updated_at = new Date().toISOString();
        const { error: updateError } = await supabaseAdmin
          .from("assignments")
          .update(payload)
          .eq("id", id);

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ id, filename: storagePath });
      }
    }

    const { data, error: insertError } = await supabaseAdmin
      .from("assignments")
      .insert(payload)
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    await logActivity({
      teacher_id: teacher.id,
      type: "assignment_published",
      description: `Assignment "${title}" published`,
      assignment_id: data.id,
      metadata: { assignment_title: title, source: "manual" },
    });

    return NextResponse.json({ id: data.id, filename: storagePath });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
