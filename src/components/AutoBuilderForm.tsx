"use client";

import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface AutoBuilderFormProps {
  userId: string;
  onSuccess: () => void;
}

export default function AutoBuilderForm({ userId, onSuccess }: AutoBuilderFormProps) {
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ title: string; question_count: number; total_points: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/assignments/generate-from-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          topic: content.trim(),
          subject: subject.trim(),
          question_count: questionCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setResult(data.assignment);
      setTimeout(onSuccess, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="p-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-1">Assignment Created!</h3>
        <p className="text-sm text-gray-500">{result.title} — {result.question_count} questions, {result.total_points} pts</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Topic or Content <span className="text-gray-400 font-normal">(paste a transcript, lecture notes, or describe a topic)</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="e.g. Explain the process of photosynthesis including light-dependent and light-independent reactions..."
          rows={6}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">{content.length} characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject (optional)</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Biology, History, Mathematics"
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Number of questions <span className="text-gray-400 font-normal">(optional, default 10)</span></label>
        <input
          type="number"
          min={1}
          max={50}
          value={questionCount}
          onChange={(e) => setQuestionCount(Number(e.target.value))}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!content.trim() || loading}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
        ) : (
          <><Sparkles className="w-4 h-4" /> Generate Assignment</>
        )}
      </button>
    </form>
  );
}
