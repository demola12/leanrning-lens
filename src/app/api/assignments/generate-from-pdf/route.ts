import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { logActivity } from "@/lib/activities";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { user_id, title, subject, question_count, page_images, file_name } = await req.json();

    if (!user_id || !page_images || !Array.isArray(page_images) || page_images.length === 0) {
      return NextResponse.json({ error: "Missing required fields or page images" }, { status: 400 });
    }

    const { data: teacher } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", user_id)
      .single();

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const maxQuestions = Math.min(Math.max(question_count || 10, 1), 50);

    const systemPrompt = `You are an expert educational assessment creator. Generate questions based on the provided document images.

Return ONLY valid JSON with no markdown formatting or code fences. The response must be a JSON object with this exact structure:
{
  "title": "A short, descriptive title based on the content",
  "questions": [
    {
      "id": "unique-string-id",
      "type": "multiple_choice | true_false | short_answer | fill_blank",
      "title": "question text",
      "points": 1,
      "options": ["option A", "option B", ...],
      "correctAnswer": "correct option string"
    }
  ]
}

Rules:
- Generate up to ${maxQuestions} questions covering key concepts from the document
- Prioritize multiple_choice and true_false questions; use short_answer and fill_blank sparingly
- Each question should test understanding, not just recall
- Points should be 1 for basic, 2 for harder questions
- For multiple_choice, provide 4 options
- For true_false, options are ["True", "False"]`;

    const apiUrl = process.env.QWEN_API_URL || "https://ws-njwq63exbhwz01in.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions";
    const apiKey = process.env.QWEN_API_KEY || "sk-ws-H.XILLMX.BVSo.MEYCIQC4pRuePMlA6LBsLySrpiDJpEzeERQYPdF0M_YcsS6hzQIhAI2p2nHLW0l7N6IY7duT10Fr10LmB3h7jOo6zMQzrApU";

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: `Generate educational assessment questions from this document. The document has ${page_images.length} page(s). Extract all text and figures from the images and create questions. Generate up to ${maxQuestions} questions.` },
          ...page_images.map((img: string) => ({ type: "image_url", image_url: { url: img } })),
        ],
      },
    ];

    const llmRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: "qwen-vl-max", messages, temperature: 0.3, max_tokens: 4096 }),
    });

    if (!llmRes.ok) {
      const errText = await llmRes.text();
      return NextResponse.json({ error: `LLM API error (${llmRes.status}): ${errText}` }, { status: 502 });
    }

    const llmData = await llmRes.json();
    const content = llmData.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "LLM returned empty response" }, { status: 502 });
    }

    const cleaned = content.replace(/```(?:json)?\s*/gi, "").replace(/\s*```/g, "").trim();

    let parsed;
    try { parsed = JSON.parse(cleaned); }
    catch { return NextResponse.json({ error: "Failed to parse LLM response as JSON" }, { status: 502 }); }

    const questions = parsed.questions || [];
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "LLM did not generate valid questions" }, { status: 502 });
    }

    const questionCount = Math.min(questions.length, maxQuestions);
    const trimmedQuestions = questions.slice(0, maxQuestions);
    const totalPoints = trimmedQuestions.reduce((sum: number, q: any) => sum + (q.points || 1), 0);

    const uuid = crypto.randomUUID();
    const filename = `${user_id}/${uuid}.json`;

    const uploadResult = await supabaseAdmin.storage
      .from("assignments")
      .upload(filename, JSON.stringify(trimmedQuestions), { contentType: "application/json", upsert: false });

    if (uploadResult.error) {
      return NextResponse.json({ error: "Failed to save questions" }, { status: 500 });
    }

    const { error: dbError } = await supabaseAdmin.from("assignments").insert({
      teacher_id: teacher.id,
      filename,
      title: parsed.title || title || "AI Generated Assignment",
      description: `Auto-generated from ${file_name || "document"}`,
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
      metadata: { assignment_title: parsed.title || title, question_count: questionCount, source: "pdf" },
    });

    return NextResponse.json({
      success: true,
      assignment: { title: parsed.title || title, question_count: questionCount, total_points: totalPoints },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
