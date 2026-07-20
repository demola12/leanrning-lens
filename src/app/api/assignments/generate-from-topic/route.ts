import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { logActivity } from "@/lib/activities";
import { callLLM } from "@/lib/llm";
import { requirePlan } from "@/lib/requirePlan";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { user_id, topic, subject, question_count } = await req.json();

    if (!user_id || !topic) {
      return NextResponse.json({ error: "Missing user_id or topic" }, { status: 400 });
    }

    const planCheck = await requirePlan(user_id, ["pro", "premium"]);
    if (!planCheck.allowed) {
      return NextResponse.json({ error: planCheck.error }, { status: 403 });
    }

    const { data: teacher } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", user_id)
      .single();

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const count = Math.min(Math.max(question_count || 5, 3), 15);

    const systemPrompt = `You are an expert educational assessment creator. Generate ${count} questions about the given topic.

Return ONLY valid JSON with no markdown formatting or code fences. The response must be a JSON object with this exact structure:
{
  "title": "A short descriptive title for this assignment",
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice | true_false | short_answer",
      "title": "question text",
      "points": 1,
      "options": ["option A", "option B", ...],
      "correctAnswer": "correct option string"
    }
  ]
}

Rules:
- Generate exactly ${count} questions
- Mix multiple_choice, true_false, and short_answer types
- Vary difficulty: some recall, some application/analysis
- Points: 1 for basic, 2 for harder questions
- For multiple_choice, provide 4 options
- For true_false, options are ["True", "False"]`;

    const userPrompt = `Generate questions from the following content:\n\n${topic.slice(0, 30000)}${subject ? `\n\nSubject area: ${subject}` : ""}`;

    const content = await callLLM({
      systemPrompt,
      userPrompt,
    });

    const cleaned = content.replace(/```(?:json)?\s*/gi, "").replace(/\s*```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Failed to parse LLM response as JSON" }, { status: 502 });
    }

    const questions = parsed.questions || [];
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "LLM did not generate valid questions" }, { status: 502 });
    }

    const questionCount = questions.length;
    const totalPoints = questions.reduce((sum: number, q: any) => sum + (q.points || 1), 0);

    const uuid = crypto.randomUUID();
    const filename = `${user_id}/${uuid}.json`;

    const uploadResult = await supabaseAdmin.storage
      .from("assignments")
      .upload(filename, JSON.stringify(questions), {
        contentType: "application/json",
        upsert: false,
      });

    if (uploadResult.error) {
      return NextResponse.json({ error: "Failed to save questions" }, { status: 500 });
    }

    const { error: dbError } = await supabaseAdmin.from("assignments").insert({
      teacher_id: teacher.id,
      filename,
      title: parsed.title || topic,
      description: `AI-generated assignment about ${topic}`,
      subject: subject || "General",
      question_count: questionCount,
      total_points: totalPoints,
      time_limit: 0,
    });

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    await logActivity({
      teacher_id: teacher.id,
      type: "assignment_published",
      description: `Assignment "${parsed.title || topic}" published`,
      metadata: {
        assignment_title: parsed.title || topic,
        question_count: questionCount,
        source: "ai_topic",
      },
    });

    return NextResponse.json({
      success: true,
      assignment: {
        title: parsed.title || topic,
        question_count: questionCount,
        total_points: totalPoints,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
