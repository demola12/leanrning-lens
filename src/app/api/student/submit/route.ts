import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { user_id, assigned_id, answers } = await req.json();

    if (!user_id || !assigned_id || !answers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: student } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", user_id)
      .single();

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get the assigned assignment to load questions
    const { data: assigned } = await supabaseAdmin
      .from("assigned_assignments")
      .select("*, assignment:assignment_id(*)")
      .eq("id", assigned_id)
      .single();

    if (!assigned) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Load questions from storage
    let questions: any[] = [];
    if (assigned.assignment?.filename) {
      const { data: fileData } = await supabaseAdmin.storage
        .from("assignments")
        .download(assigned.assignment.filename);
      if (fileData) {
        try { questions = JSON.parse(await fileData.text()); } catch {}
      }
    }

    // Auto-grade
    let correct = 0;
    const graded = questions.map((q: any, i: number) => {
      const userAnswer = answers[q.id] || answers[i] || "";
      const isCorrect = checkAnswer(q, userAnswer);
      if (isCorrect) correct++;
      return {
        question_id: q.id,
        question_title: q.title,
        type: q.type,
        options: q.options || null,
        image_url: q.image_url || null,
        correct_answer: q.correctAnswer || null,
        user_answer: userAnswer,
        is_correct: isCorrect,
        points: q.points || 1,
      };
    });

    const totalPoints = questions.reduce((s: number, q: any) => s + (q.points || 1), 0);
    const earnedPoints = graded.reduce((s: number, g: any) => s + (g.is_correct ? g.points : 0), 0);
    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    // Build full submission cache
    const submissionCache = {
      assignment_title: assigned.assignment.title,
      assignment_subject: assigned.assignment.subject,
      submitted_at: new Date().toISOString(),
      score,
      total_points: totalPoints,
      earned_points: earnedPoints,
      graded,
      raw_answers: answers,
    };

    // Store cache in student's storage folder
    const cacheFilename = `submissions/${user_id}/${assigned_id}.json`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("assignments")
      .upload(cacheFilename, JSON.stringify(submissionCache), {
        contentType: "application/json",
        upsert: true,
      });

    if (uploadError) {
      console.error("Failed to store submission cache:", uploadError.message);
    }

    // Update assigned record
    const { error: updateError } = await supabaseAdmin
      .from("assigned_assignments")
      .update({
        status: "submitted",
        score,
        submitted_at: new Date().toISOString(),
        submission_cache: cacheFilename,
      })
      .eq("id", assigned_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      score,
      correct,
      total: questions.length,
      total_points: totalPoints,
      earned_points: earnedPoints,
      graded,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function checkAnswer(q: any, answer: string): boolean {
  if (!q.correctAnswer) return false;
  switch (q.type) {
    case "multiple_choice":
    case "true_false":
      return answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    case "short_answer":
      return answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    default:
      return false;
  }
}
