import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { logActivity } from "@/lib/activities";
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("user_id") as string;
    const title = formData.get("title") as string;
    const subject = formData.get("subject") as string;
    const description = formData.get("description") as string;
    const questionCountParam = formData.get("question_count") as string;
    const maxQuestions = questionCountParam ? Math.min(Math.max(parseInt(questionCountParam) || 10, 1), 50) : 10;

    if (!file || !userId) {
      return NextResponse.json({ error: "Missing file or user_id" }, { status: 400 });
    }

    const { data: teacher } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const mod = await import("pdf-parse/lib/pdf-parse.js");
    const pdfParse = typeof mod === "function" ? mod : mod.default;
    const pdfData = await pdfParse(buffer);
    const pdfText = pdfData.text;

    if (!pdfText || pdfText.trim().length < 10) {
      return NextResponse.json({ error: "Could not extract enough text from PDF" }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "LLM API key not configured" }, { status: 500 });
    }

    const systemPrompt = `You are an expert educational assessment creator. Generate questions based on the provided lecture content.

Return ONLY valid JSON with no markdown formatting or code fences. The response must be a JSON object with this exact structure:
{
  "title": "A short, descriptive title based on the content",
  "questions": [
    {
      "id": "unique-string-id",
      "type": "multiple_choice | true_false | short_answer",
      "title": "question text",
      "points": 1,
      "options": ["option A", "option B", ...],
      "correctAnswer": "correct option string"
    }
  ]
}

Rules:
- Generate up to ${maxQuestions} questions covering key concepts from the content
- Prioritize multiple_choice and true_false questions; use short_answer sparingly
- Each question should test understanding, not just recall
- Points should be 1 for basic, 2 for harder questions
- For multiple_choice, provide 4 options
- For true_false, options are ["True", "False"]`;

    const userPrompt = `Generate educational assessment questions from this content:\n\n${pdfText.slice(0, 30000)}`;

    const llmRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!llmRes.ok) {
      const errText = await llmRes.text();
      return NextResponse.json({ error: `LLM API error: ${errText}` }, { status: 502 });
    }

    const llmData = await llmRes.json();
    const content = llmData.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "LLM returned empty response" }, { status: 502 });
    }

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

    const questionCount = Math.min(questions.length, maxQuestions);
    const trimmedQuestions = questions.slice(0, maxQuestions);
    const totalPoints = trimmedQuestions.reduce((sum: number, q: any) => sum + (q.points || 1), 0);

    const uuid = crypto.randomUUID();
    const filename = `${userId}/${uuid}.json`;

    const uploadResult = await supabaseAdmin.storage
      .from("assignments")
      .upload(filename, JSON.stringify(trimmedQuestions), {
        contentType: "application/json",
        upsert: false,
      });

    if (uploadResult.error) {
      return NextResponse.json({ error: "Failed to save questions" }, { status: 500 });
    }

    const { error: dbError } = await supabaseAdmin.from("assignments").insert({
      teacher_id: teacher.id,
      filename,
      title: parsed.title || title || "AI Generated Assignment",
      description: description || `Auto-generated from ${file.name}`,
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
      type: "pdf_converted",
      description: `PDF successfully converted into questions for "${parsed.title || title || "untitled"}"`,
      metadata: {
        assignment_title: parsed.title || title,
        question_count: questionCount,
        source: "pdf",
      },
    });

    return NextResponse.json({
      success: true,
      assignment: {
        title: parsed.title || title,
        question_count: questionCount,
        total_points: totalPoints,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
