"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Target,
  BarChart3,
  Clock,
  Calendar,
  HelpCircle,
  ClipboardCheck,
  MessageSquare,
} from "lucide-react";

export default function TeacherSubmissionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignedId = searchParams.get("id");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!assignedId) return;
    fetch(`/api/teacher/submission?assigned_id=${assignedId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (d.assigned?.teacher_notes) setNotes(d.assigned.teacher_notes);
      })
      .finally(() => setLoading(false));
  }, [assignedId]);

  const handleReview = async () => {
    if (!assignedId || reviewing) return;
    setReviewing(true);
    await fetch("/api/assignments/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigned_id: assignedId, notes }),
    });
    const res = await fetch(`/api/teacher/submission?assigned_id=${assignedId}`);
    const d = await res.json();
    setData(d);
    if (d.assigned?.teacher_notes) setNotes(d.assigned.teacher_notes);
    setReviewing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!data?.assigned) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Submission not found</p>
      </div>
    );
  }

  const { assigned, submission } = data;
  const student = assigned.student;
  const graded = submission?.graded || [];
  const score = assigned.score || 0;
  const isPassing = score >= 70;
  const correct = graded.filter((g: any) => g.is_correct).length;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{assigned.assignment?.title || "Submission"}</h1>
          {assigned.assignment?.description && <p className="text-sm text-gray-500">{assigned.assignment.description}</p>}
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span>Student: <strong>{student?.full_name || "Unknown"}</strong></span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>UUID: <code className="font-mono text-xs">{student?.ref_uuid}</code></span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
            assigned.status === "reviewed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}>
            {assigned.status === "reviewed" ? "Reviewed" : "Submitted"}
          </span>
          {assigned.status !== "reviewed" && (
            <div className="flex flex-col items-end gap-3">
              <div className="w-72">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Review notes (visible to student)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add feedback, corrections, or encouragement..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>
              <button
                onClick={handleReview}
                disabled={reviewing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
              >
                {reviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
                {reviewing ? "Marking..." : "Mark as Reviewed"}
              </button>
            </div>
          )}
          {assigned.status === "reviewed" && assigned.teacher_notes && (
            <div className="max-w-xs">
              <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-gray-500">
                <MessageSquare className="w-3.5 h-3.5" />
                Teacher notes
              </div>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">{assigned.teacher_notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Score", value: `${score}%`, icon: score >= 70 ? TrendingUp : Target, color: isPassing ? "text-emerald-600" : "text-amber-600", bg: isPassing ? "bg-emerald-50" : "bg-amber-50" },
          { label: "Correct", value: `${correct}/${graded.length}`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Points", value: submission ? `${submission.earned_points}/${submission.total_points}` : "—", icon: BarChart3, color: "text-primary", bg: "bg-primary/5" },
          { label: "Submitted", value: assigned.submitted_at ? new Date(assigned.submitted_at).toLocaleDateString() : "—", icon: Calendar, color: "text-gray-600", bg: "bg-gray-50" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`p-5 rounded-lg ${s.bg} border border-gray-100`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-5 h-5 ${s.color}`} />
                <span className="text-sm text-gray-500">{s.label}</span>
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Question Review */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Student Answers</h2>
      {graded.length === 0 ? (
        <div className="py-16 text-center rounded-lg border border-dashed border-gray-200">
          <p className="text-gray-400">No graded answers available. The student may have submitted an empty response.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {graded.map((g: any, i: number) => (
            <motion.div
              key={g.question_id || i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`p-5 rounded-lg border shadow-sm ${
                g.is_correct ? "bg-emerald-50/50 border-emerald-100" : "bg-red-50/50 border-red-100"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase">{g.type?.replace("_", " ") || "Unknown"}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{g.points} pt</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {i + 1}. {g.question_title || "Untitled"}
                  </h3>
                  {g.image_url && (
                    <img src={g.image_url} alt="" className="mt-2 max-h-32 rounded-lg border border-gray-100 object-contain" />
                  )}

                  {/* Student's answer */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      {g.is_correct ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                      <span className="text-sm">
                        <span className="font-medium text-gray-500">Student answer: </span>
                        <span className={`font-semibold ${g.is_correct ? "text-emerald-700" : "text-red-700"}`}>
                          {g.user_answer || "(No answer)"}
                        </span>
                      </span>
                    </div>

                    {/* Show options if multiple choice */}
                    {g.options && g.options.length > 0 && (
                      <div className="ml-6 flex flex-wrap gap-1.5 mt-1">
                        {g.options.filter((o: string) => o.trim()).map((opt: string, oi: number) => {
                          const letter = String.fromCharCode(65 + oi);
                          const isSelected = g.user_answer === letter;
                          const isCorrectOpt = g.correct_answer === letter;
                          return (
                            <span
                              key={oi}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                                isSelected && isCorrectOpt
                                  ? "bg-emerald-100 text-emerald-700"
                                  : isSelected
                                  ? "bg-red-100 text-red-700"
                                  : isCorrectOpt
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-gray-50 text-gray-500"
                              }`}
                            >
                              {letter}. {opt}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Correct answer if wrong */}
                    {!g.is_correct && g.correct_answer && (
                      <div className="flex items-center gap-2 ml-6">
                        <span className="text-sm">
                          <span className="font-medium text-gray-500">Correct answer: </span>
                          <span className="font-semibold text-emerald-600">{g.correct_answer}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className={`text-sm font-bold shrink-0 ml-3 ${g.is_correct ? "text-emerald-600" : "text-red-500"}`}>
                  {g.is_correct ? `+${g.points}` : "0"}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={() => router.back()}
          className="px-8 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all shadow-sm shadow-primary/25"
        >
          Back
        </button>
      </div>
    </div>
  );
}
