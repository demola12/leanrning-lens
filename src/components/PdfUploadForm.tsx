"use client";

import { useState, useRef } from "react";
import { FileUp, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface PdfUploadFormProps {
  userId: string;
  onSuccess: () => void;
}

export default function PdfUploadForm({ userId, onSuccess }: PdfUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ title: string; question_count: number; total_points: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", userId);
      formData.append("title", title || file.name.replace(/\.[^/.]+$/, ""));
      formData.append("subject", subject);
      if (questionCount > 0) formData.append("question_count", String(questionCount));

      const res = await fetch("/api/assignments/generate-from-pdf", {
        method: "POST",
        body: formData,
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
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
      >
        <FileUp className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-700">
          {file ? file.name : "Click to select a PDF"}
        </p>
        <p className="text-xs text-gray-400 mt-1">Supports .pdf files up to 20MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Auto-detected from content"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject (optional)</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Mathematics, Science"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Max questions <span className="text-gray-400 font-normal">(optional, default 10)</span></label>
        <input
          type="number"
          min={1}
          max={50}
          value={questionCount}
          onChange={(e) => setQuestionCount(Number(e.target.value))}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
        disabled={!file || loading}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
        ) : (
          <><FileUp className="w-4 h-4" /> Generate from PDF</>
        )}
      </button>
    </form>
  );
}
