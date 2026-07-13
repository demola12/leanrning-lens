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
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!teacher) {
    return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from("assignments")
    .select("*")
    .eq("teacher_id", teacher.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Load questions from storage for each assignment
  const assignments = await Promise.all(
    (data || []).map(async (a: any) => {
      const { data: fileData, error: fileError } = await supabaseAdmin.storage
        .from("assignments")
        .download(a.filename);

      let questions: any[] = [];
      if (!fileError && fileData) {
        const text = await fileData.text();
        try { questions = JSON.parse(text); } catch {}
      }

      return { ...a, questions };
    })
  );

  return NextResponse.json({ assignments });
}
