"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  BarChart3,
  Target,
  TrendingUp,
  HelpCircle,
  MessageSquare,
} from "lucide-react";

export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignedId = searchParams.get("id");
  const { user } = useAuth();

  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!assignedId || !user) return;
    const load = async () => {
      const res = await fetch(`/api/student/submission?user_id=${user.id}&assigned_id=${assignedId}`);
      const data = await res.json();
      setSubmission(data);
      setLoading(false);
    };
    load();
  }, [assignedId, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!submission || !submission.graded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Result not available yet</p>
          <button
            onClick={() => router.push("/student/assignments")}
            className="mt-4 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const { score, graded, total_points, earned_points, assignment_title } = submission;
  const isPassing = score >= 70;
  const correct = graded.filter((g: any) => g.is_correct).length;
  const total = graded.length;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/student/assignments")}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{assignment_title || "Assignment Result"}</h1>
          <p className="text-sm text-gray-400">{total} questions · {total_points} pts</p>
        </div>
      </div>

      {/* Score Hero */}
      <div className="p-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark text-white text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
          {isPassing ? <TrendingUp className="w-10 h-10" /> : <Target className="w-10 h-10" />}
        </div>
        <div className="text-6xl font-bold tracking-tight">{score}%</div>
        <p className="text-lg text-primary-light mt-2">
          {isPassing ? "Great job! Keep it up." : "Keep practicing, you'll improve!"}
        </p>
        <div className="mt-6 flex items-center justify-center gap-8 text-sm text-primary-light">
          <div>
            <div className="text-2xl font-bold text-white">{correct}/{total}</div>
            <div>Correct</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div>
            <div className="text-2xl font-bold text-white">{earned_points}/{total_points}</div>
            <div>Points</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Questions", value: total.toString(), icon: FileText, color: "text-primary" },
          { label: "Score", value: `${score}%`, icon: BarChart3, color: isPassing ? "text-emerald-600" : "text-amber-600" },
          { label: "Submitted", value: new Date(submission.submitted_at).toLocaleDateString(), icon: CheckCircle2, color: "text-emerald-600" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-5 rounded-lg bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-5 h-5 ${s.color}`} />
                <span className="text-sm text-gray-500">{s.label}</span>
              </div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
            </div>
          );
        })}
      </div>

      {submission.teacher_notes && (
        <div className="mb-6 p-5 rounded-lg bg-amber-50 border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">Teacher&apos;s Feedback</span>
          </div>
          <p className="text-sm text-amber-700 leading-relaxed">{submission.teacher_notes}</p>
        </div>
      )}

      {/* Question Review */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Question Review</h2>
      <div className="space-y-4">
        {graded.map((g: any, i: number) => (
          <motion.div
            key={g.question_id || i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`p-5 rounded-lg border shadow-sm ${
              g.is_correct
                ? "bg-emerald-50/50 border-emerald-100"
                : "bg-red-50/50 border-red-100"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase">{g.type.replace("_", " ")}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{g.points} pt</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {i + 1}. {g.question_title || "Untitled question"}
                </h3>
                {g.image_url && (
                  <img src={g.image_url} alt="" className="mt-2 max-h-32 rounded-lg border border-gray-100 object-contain" />
                )}

                {/* Your answer */}
                <div className="mt-3 flex items-center gap-2">
                  {g.is_correct ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                  <span className="text-sm">
                    <span className="font-medium text-gray-500">Your answer: </span>
                    <span className={`font-semibold ${g.is_correct ? "text-emerald-700" : "text-red-700"}`}>
                      {g.user_answer || "(No answer)"}
                    </span>
                  </span>
                </div>

                {/* Correct answer (if wrong) */}
                {!g.is_correct && g.correct_answer && (
                  <div className="mt-1.5 flex items-center gap-2 ml-6">
                    <span className="text-sm">
                      <span className="font-medium text-gray-500">Correct answer: </span>
                      <span className="font-semibold text-emerald-600">{g.correct_answer}</span>
                    </span>
                  </div>
                )}
              </div>
              <div className={`text-sm font-bold shrink-0 ml-3 ${g.is_correct ? "text-emerald-600" : "text-red-500"}`}>
                {g.is_correct ? `+${g.points}` : "0"}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => router.push("/student/assignments")}
          className="px-8 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all shadow-sm shadow-primary/25"
        >
          Back to Assignments
        </button>
      </div>
    </div>
  );
}
