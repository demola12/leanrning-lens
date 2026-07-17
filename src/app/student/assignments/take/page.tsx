"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useProfiles } from "@/lib/ProfilesContext";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Loader2,
  Send,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function TakeAssignmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignedId = searchParams.get("id");
  const { user } = useAuth();
  const { activeProfile } = useProfiles();

  const [assignment, setAssignment] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!assignedId || !user) return;
    const load = async () => {
      const res = await fetch(`/api/student/assignment-detail?assigned_id=${assignedId}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const found = await res.json();
      if (found) {
        setAssignment(found);
        const qs = found.assignment?.questions || [];
        setQuestions(qs);
        const tl = found.assignment?.time_limit || 0;
        if (tl > 0) {
          setTimeLeft(tl * 60);
        }
      }
      setLoading(false);
    };
    load();
  }, [assignedId, user]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (qId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async () => {
    if (!user || !assignedId) return;
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/student/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        profile_id: activeProfile?.id,
        assigned_id: assignedId,
        answers,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to submit");
      setSubmitting(false);
      return;
    }

    router.push(`/student/assignments/result?id=${assignedId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Assignment not found</p>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

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
          <h1 className="text-2xl font-bold text-gray-900">{assignment.assignment.title}</h1>
          {assignment.assignment.description && <p className="text-sm text-gray-500 mt-0.5">{assignment.assignment.description}</p>}
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
            <span>{assignment.assignment.subject || "General"}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{questions.length} questions</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{assignment.assignment.total_points} pts</span>
          </div>
        </div>
      </div>

      {/* Progress bar + Timer */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">Progress</span>
            <span className="font-semibold text-gray-700">{answeredCount}/{questions.length} answered</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }} />
          </div>
        </div>
        {timeLeft !== null && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-bold shrink-0 ${
            timeLeft < 120 ? "bg-red-50 border-red-200 text-red-600" : "bg-gray-50 border-gray-200 text-gray-700"
          }`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((q: any, i: number) => (
          <motion.div
            key={q.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-6 rounded-lg border border-gray-100 bg-white shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase">{q.type.replace("_", " ")}</span>
                <h3 className="text-base font-semibold text-gray-900 mt-0.5">
                  {i + 1}. {q.title || "Untitled question"}
                </h3>
                {q.image_url && (
                  <img src={q.image_url} alt="" className="mt-3 max-h-40 rounded-lg border border-gray-100 object-contain" />
                )}
              </div>
              <span className="text-xs font-semibold text-gray-400">{q.points} pt{q.points !== 1 ? "s" : ""}</span>
            </div>

            {q.type === "multiple_choice" && (
              <div className="space-y-2">
                {(q.options || []).filter((o: string) => o.trim()).length > 0 ? (
                  (q.options || []).filter((o: string) => o.trim()).map((opt: string, oi: number) => {
                    const letter = String.fromCharCode(65 + oi);
                    return (
                      <label
                        key={oi}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          answers[q.id] === letter
                            ? "border-primary bg-primary/5"
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          answers[q.id] === letter ? "border-primary" : "border-gray-300"
                        }`}>
                          {answers[q.id] === letter && <div className="w-3 h-3 rounded-full bg-primary" />}
                        </div>
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={letter}
                          checked={answers[q.id] === letter}
                          onChange={(e) => handleAnswer(q.id, e.target.value)}
                          className="hidden"
                        />
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-400 italic">No options provided for this question.</p>
                )}
              </div>
            )}

            {q.type === "true_false" && (
              <div className="flex gap-3">
                {["True", "False"].map((val) => (
                  <label
                    key={val}
                    className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      answers[q.id] === val ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers[q.id] === val ? "border-primary" : "border-gray-300"
                    }`}>
                      {answers[q.id] === val && <div className="w-3 h-3 rounded-full bg-primary" />}
                    </div>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={val}
                      checked={answers[q.id] === val}
                      onChange={(e) => handleAnswer(q.id, e.target.value)}
                      className="hidden"
                    />
                    <span className="text-sm font-medium text-gray-700">{val}</span>
                  </label>
                ))}
              </div>
            )}

            {(q.type === "short_answer" || q.type === "essay") && (
              q.type === "essay" ? (
                <textarea
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswer(q.id, e.target.value)}
                  rows={5}
                  placeholder="Write your answer..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswer(q.id, e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              )
            )}

            {q.type === "rating" && (
              <div className="flex items-center gap-2">
                {(q.options || ["1", "2", "3", "4", "5"]).map((n: string) => (
                  <button
                    key={n}
                    onClick={() => handleAnswer(q.id, n)}
                    className={`w-12 h-12 rounded-lg border-2 transition-all text-xl ${
                      answers[q.id] === n
                        ? "border-amber-400 bg-amber-50 text-amber-500"
                        : "border-gray-200 text-gray-300 hover:border-amber-300 hover:text-amber-400"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm mt-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all shadow-sm shadow-primary/25 disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {submitting ? "Submitting..." : "Submit Assignment"}
        </button>
      </div>
    </div>
  );
}
