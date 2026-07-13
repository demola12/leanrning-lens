"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Reorder, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import {
  ArrowLeft,
  GripVertical,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Type,
  AlignLeft,
  CheckSquare,
  Circle,
  Star,
  Save,
  Send,
  ChevronDown,
  FileText,
  AlertCircle,
  Edit3,
  Image as ImageIcon,
  Loader2,
  X,
  Clock,
} from "lucide-react";

type QuestionType = "multiple_choice" | "true_false" | "short_answer" | "essay" | "rating";

interface Question {
  id: string;
  type: QuestionType;
  title: string;
  points: number;
  options?: string[];
  correctAnswer?: string;
  image_url?: string;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const questionTypes: { type: QuestionType; label: string; icon: any }[] = [
  { type: "multiple_choice", label: "Multiple Choice", icon: CheckSquare },
  { type: "true_false", label: "True/False", icon: Circle },
  { type: "short_answer", label: "Short Answer", icon: AlignLeft },
  { type: "essay", label: "Essay", icon: Type },
  { type: "rating", label: "Rating", icon: Star },
];

function createQuestion(type: QuestionType): Question {
  const base = { id: generateId(), type, title: "", points: 1 };
  switch (type) {
    case "multiple_choice":
      return { ...base, options: ["", "", "", ""], correctAnswer: "" };
    case "true_false":
      return { ...base, options: ["True", "False"], correctAnswer: "" };
    case "rating":
      return { ...base, options: ["1", "2", "3", "4", "5"] };
    default:
      return base;
  }
}

function ImageUploadButton({
  user,
  currentImage,
  onUpload,
  onRemove,
}: {
  user: any;
  currentImage?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", user.id);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) onUpload(data.url);
    setUploading(false);
  };

  return (
    <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
      currentImage ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200"
    }`}>
      {uploading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <ImageIcon className="w-3.5 h-3.5" />
      )}
      {uploading ? "Uploading..." : currentImage ? "Image Added" : "Add Image"}
      <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </label>
  );
}

export default function ManualBuilderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("Untitled Assignment");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([createQuestion("multiple_choice")]);
  const [preview, setPreview] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(questions[0]?.id || null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);

  const addQuestion = (type: QuestionType) => {
    const q = createQuestion(type);
    setQuestions([...questions, q]);
    setActiveQuestion(q.id);
  };

  const removeQuestion = (id: string) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((q) => q.id !== id));
    if (activeQuestion === id) {
      const idx = questions.findIndex((q) => q.id === id);
      const next = questions[Math.max(0, idx - 1)];
      setActiveQuestion(next?.id || null);
    }
  };

  const duplicateQuestion = (id: string) => {
    const q = questions.find((q) => q.id === id);
    if (!q) return;
    const copy: Question = { ...q, id: generateId(), title: q.title + " (copy)" };
    if (q.options) copy.options = [...q.options];
    const idx = questions.findIndex((x) => x.id === id);
    const next = [...questions];
    next.splice(idx + 1, 0, copy);
    setQuestions(next);
    setActiveQuestion(copy.id);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const updateOption = (qId: string, optIdx: number, value: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === qId && q.options
          ? { ...q, options: q.options.map((o, i) => (i === optIdx ? value : o)) }
          : q
      )
    );
  };

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  const handleSave = async () => {
    if (!user) return;

    // Validate questions
    for (const q of questions) {
      if (!q.title.trim()) {
        setError("All questions must have a title.");
        return;
      }
      if ((q.type === "multiple_choice" || q.type === "true_false") && (!q.options || q.options.filter((o: string) => o.trim()).length < 2)) {
        setError(`"${q.title || "Untitled"}" needs at least 2 options.`);
        return;
      }
    }

    setSaving(true);
    setError("");

    const res = await fetch("/api/assignments/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        title,
        description,
        subject: "",
        questions,
        question_count: questions.length,
        total_points: totalPoints,
        time_limit: timeLimitEnabled ? timeLimitMinutes : 0,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to save");
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push("/teacher/assignments");
  };

  const QuestionEditor = ({ question }: { question: Question }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={question.title}
            onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
            placeholder="Enter your question..."
            className="w-full text-lg font-semibold bg-transparent border-0 border-b-2 border-gray-100 focus:border-primary focus:ring-0 pb-2 text-gray-900 placeholder-gray-300 outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-gray-400 font-semibold">Pts</span>
          <input
            type="number"
            min={1}
            value={question.points}
            onChange={(e) => updateQuestion(question.id, { points: Math.max(1, parseInt(e.target.value) || 1) })}
            className="w-14 px-2 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Multiple Choice */}
      {question.type === "multiple_choice" && (
        <div className="space-y-2">
          {question.options?.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full border-2 shrink-0 ${question.correctAnswer === String.fromCharCode(65 + i) ? "border-primary bg-primary" : "border-gray-300"}`} />
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(question.id, i, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                onClick={() => updateQuestion(question.id, { correctAnswer: String.fromCharCode(65 + i) })}
                className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${question.correctAnswer === String.fromCharCode(65 + i) ? "bg-emerald-50 text-emerald-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                Correct
              </button>
            </div>
          ))}
        </div>
      )}

      {/* True/False */}
      {question.type === "true_false" && (
        <div className="flex gap-3">
          {["True", "False"].map((val) => (
            <button
              key={val}
              onClick={() => updateQuestion(question.id, { correctAnswer: val })}
              className={`flex-1 py-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                question.correctAnswer === val
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      )}

      {/* Short Answer */}
      {question.type === "short_answer" && (
        <div>
          <input
            type="text"
            value={question.correctAnswer || ""}
            onChange={(e) => updateQuestion(question.id, { correctAnswer: e.target.value })}
            placeholder="Expected answer (optional)"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <p className="text-xs text-gray-400 mt-1">Leave blank for manual grading</p>
        </div>
      )}

      {/* Essay */}
      {question.type === "essay" && (
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
          <p className="text-sm text-gray-400">Essay answer — students will write their response here</p>
        </div>
      )}

      {/* Rating */}
      {question.type === "rating" && (
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className="w-12 h-12 rounded-lg border-2 border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-400 transition-all text-lg"
            >
              ★
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-bold bg-transparent border-0 outline-none text-gray-900 w-full"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            className="text-sm text-gray-400 bg-transparent border-0 outline-none w-full mt-0.5 placeholder-gray-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 font-medium">{questions.length} questions</span>
          <span className="w-px h-5 bg-gray-200" />
          <span className="text-sm text-gray-400 font-medium">{totalPoints} pts</span>
          <span className="w-px h-5 bg-gray-200 mx-1" />
          {/* Time Limit Toggle */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <button
              onClick={() => setTimeLimitEnabled(!timeLimitEnabled)}
              className={`relative w-8 h-4 rounded-full transition-colors ${timeLimitEnabled ? "bg-primary" : "bg-gray-200"}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${timeLimitEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
            {timeLimitEnabled ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 px-1.5 py-0.5 rounded-md border border-gray-200 text-xs font-semibold text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-xs text-gray-500">min</span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">No limit</span>
            )}
          </div>
          <button
            onClick={() => setPreview(!preview)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              preview ? "bg-primary text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {preview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/25 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question List Sidebar */}
        {!preview && (
          <div className="w-72 shrink-0 border-r border-gray-100 bg-gray-50/50 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <div className="relative group">
                <button className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:border-gray-300 transition-all">
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-primary" />
                    Add Question
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                <div className="absolute top-full left-0 right-0 mt-1 py-2 rounded-lg bg-white border border-gray-100 shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                  {questionTypes.map((qt) => (
                    <button
                      key={qt.type}
                      onClick={() => addQuestion(qt.type)}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <qt.icon className="w-4 h-4 text-gray-400" />
                      {qt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <Reorder.Group axis="y" values={questions} onReorder={setQuestions}>
                <AnimatePresence initial={false}>
                  {questions.map((q, i) => (
                    <Reorder.Item
                      key={q.id}
                      value={q}
                      as="div"
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                        activeQuestion === q.id
                          ? "bg-white border border-gray-200 shadow-sm"
                          : "hover:bg-white/80"
                      }`}
                      onClick={() => setActiveQuestion(q.id)}
                    >
                      <GripVertical className="w-4 h-4 text-gray-300 shrink-0 cursor-grab" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-400 uppercase">
                          {q.type.replace("_", " ")}
                        </div>
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {q.title || `Question ${i + 1}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); duplicateQuestion(q.id); }}
                          className="p-1 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeQuestion(q.id); }}
                          className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                          disabled={questions.length <= 1}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            </div>
          </div>
        )}

        {/* Main Editor / Preview */}
        <div className="flex-1 overflow-y-auto bg-white">
          {error && (
            <div className="flex items-center gap-2 px-8 py-3 bg-red-50 border-b border-red-100 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {preview ? (
            <div className="max-w-2xl mx-auto p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-400 mt-1">{questions.length} questions · {totalPoints} points</p>
              </div>
              <div className="space-y-8">
                {questions.map((q, i) => (
                  <div key={q.id} className="p-6 rounded-lg border border-gray-100 bg-white shadow-sm">
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
                          (q.options || []).filter((o: string) => o.trim()).map((opt, oi) => (
                            <label key={oi} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 cursor-pointer transition-all">
                              <input type="radio" name={`preview-${q.id}`} className="w-4 h-4 text-primary" />
                              <span className="text-sm text-gray-700">{opt}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-400 italic">No options provided</p>
                        )}
                      </div>
                    )}
                    {q.type === "true_false" && (
                      <div className="flex gap-3">
                        {["True", "False"].map((v) => (
                          <label key={v} className="flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border border-gray-100 hover:border-gray-200 cursor-pointer transition-all">
                            <input type="radio" name={`preview-${q.id}`} className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-gray-700">{v}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {q.type === "short_answer" && (
                      <input
                        type="text"
                        placeholder="Type your answer..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    )}
                    {q.type === "essay" && (
                      <textarea
                        rows={4}
                        placeholder="Write your essay..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                    )}
                    {q.type === "rating" && (
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} className="w-11 h-11 rounded-lg border-2 border-gray-200 text-gray-300 hover:border-amber-300 hover:text-amber-400 transition-all text-xl">★</button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <button className="px-8 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all shadow-sm shadow-primary/25">
                  Submit Assignment
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto p-8">
              {questions.length > 0 && activeQuestion && (() => {
                const q = questions.find((x) => x.id === activeQuestion);
                if (!q) return null;
                return (
                  <div key={q.id} className="p-6 rounded-lg border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="px-2.5 py-1 rounded-lg bg-primary/5 text-primary text-xs font-semibold">{q.type.replace("_", " ")}</span>
                      <span className="text-xs text-gray-400">{q.points} pt{q.points !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            defaultValue={q.title || ""}
                            onChange={(e) => updateQuestion(q.id, { title: e.target.value })}
                            placeholder="Enter your question..."
                            className="w-full text-lg font-semibold bg-transparent border-0 border-b-2 border-gray-100 focus:border-primary focus:ring-0 pb-2 text-gray-900 placeholder-gray-300 outline-none transition-colors"
                          />
                        </div>
                        <ImageUploadButton
                          user={user}
                          currentImage={q.image_url}
                          onUpload={(url) => updateQuestion(q.id, { image_url: url })}
                          onRemove={() => updateQuestion(q.id, { image_url: undefined })}
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-xs text-gray-400 font-semibold">Pts</span>
                          <input
                            type="number"
                            min={1}
                            defaultValue={q.points}
                            onChange={(e) => updateQuestion(q.id, { points: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="w-14 px-2 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>

                      {q.image_url && (
                        <div className="relative inline-block">
                          <img
                            src={q.image_url}
                            alt="Question image"
                            className="max-h-48 rounded-lg border border-gray-100 object-contain"
                          />
                          <button
                            onClick={() => updateQuestion(q.id, { image_url: undefined })}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {q.type === "multiple_choice" && (
                        <div className="space-y-2">
                          {q.options?.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full border-2 shrink-0 ${q.correctAnswer === String.fromCharCode(65 + i) ? "border-primary bg-primary" : "border-gray-300"}`} />
                              <input
                                type="text"
                                defaultValue={opt}
                                onChange={(e) => updateOption(q.id, i, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              />
                              <button
                                onClick={() => updateQuestion(q.id, { correctAnswer: String.fromCharCode(65 + i) })}
                                className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${q.correctAnswer === String.fromCharCode(65 + i) ? "bg-emerald-50 text-emerald-600" : "text-gray-400 hover:text-gray-600"}`}
                              >
                                Correct
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {q.type === "true_false" && (
                        <div className="flex gap-3">
                          {["True", "False"].map((val) => (
                            <button
                              key={val}
                              onClick={() => updateQuestion(q.id, { correctAnswer: val })}
                              className={`flex-1 py-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                                q.correctAnswer === val
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-gray-200 text-gray-500 hover:border-gray-300"
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      )}
                      {q.type === "short_answer" && (
                        <div>
                          <input
                            type="text"
                            onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })}
                            placeholder="Expected answer (optional)"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                          <p className="text-xs text-gray-400 mt-1">Leave blank for manual grading</p>
                        </div>
                      )}
                      {q.type === "essay" && (
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                          <p className="text-sm text-gray-400">Essay answer — students will write their response here</p>
                        </div>
                      )}
                      {q.type === "rating" && (
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button key={n} className="w-12 h-12 rounded-lg border-2 border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-400 transition-all text-lg">★</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
              {questions.length === 0 && (
                <div className="text-center py-16">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Add a question to get started</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
