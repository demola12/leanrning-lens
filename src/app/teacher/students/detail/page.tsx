"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  BarChart3,
  TrendingUp,
  Target,
  AlertCircle,
  Loader2,
  Calendar,
} from "lucide-react";

const statusStyles: Record<string, { label: string; color: string; bg: string }> = {
  assigned: { label: "Assigned", color: "text-gray-500", bg: "bg-gray-100" },
  in_progress: { label: "In Progress", color: "text-blue-600", bg: "bg-blue-50" },
  submitted: { label: "Submitted", color: "text-amber-600", bg: "bg-amber-50" },
  graded: { label: "Graded", color: "text-emerald-600", bg: "bg-emerald-50" },
  reviewed: { label: "Reviewed", color: "text-indigo-600", bg: "bg-indigo-50" },
};

export default function StudentDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    fetch(`/api/teacher/student-detail?student_id=${studentId}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!data?.student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Student not found</p>
      </div>
    );
  }

  const { student, assignments } = data;

  const totalScore = assignments
    .filter((a: any) => a.score !== null)
    .reduce((s: number, a: any) => s + a.score, 0);
  const scoredCount = assignments.filter((a: any) => a.score !== null).length;
  const avgScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : null;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/teacher/students")}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{student.full_name}</h1>
          <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-400">
            <span className="font-mono text-xs">{student.ref_uuid}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{student.email}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Assigned", value: assignments.length.toString(), icon: FileText, color: "text-primary", bg: "bg-primary/5" },
          { label: "Completed", value: assignments.filter((a: any) => a.status === "submitted" || a.status === "graded").length.toString(), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "In Progress", value: assignments.filter((a: any) => a.status === "in_progress").length.toString(), icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Avg Score", value: avgScore !== null ? `${avgScore}%` : "—", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`p-4 rounded-lg ${s.bg} border border-gray-100`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Assignments List */}
      <h2 className="text-sm font-bold text-gray-800 mb-4">Assigned Assignments</h2>

      {assignments.length === 0 ? (
        <div className="py-16 text-center rounded-lg border border-dashed border-gray-200">
          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No assignments assigned yet.</p>
          <button
            onClick={() => router.push("/teacher/assignments")}
            className="mt-3 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            Go to Assignments
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {assignments.map((a: any, i: number) => {
            const st = statusStyles[a.status] || statusStyles.assigned;
            const graded = a.submission?.graded || [];
            const correct = graded.filter((g: any) => g.is_correct).length;
            const overdue = a.due_date && new Date(a.due_date) < new Date() && a.status === "assigned";

            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 p-4 rounded-lg bg-white border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {a.assignment?.title || "Untitled"}
                    </h3>
                    {overdue && <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                  </div>
                  {a.assignment?.description && <p className="text-xs text-gray-400 truncate">{a.assignment.description}</p>}
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                    <span>{a.assignment?.question_count || 0} questions</span>
                    {a.due_date && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className={overdue ? "text-red-400" : ""}>
                          Due {new Date(a.due_date).toLocaleDateString()}
                        </span>
                      </>
                    )}
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                  {a.score !== null && graded.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-3 text-xs">
                      <span className={`font-semibold ${a.score >= 70 ? "text-emerald-600" : a.score >= 40 ? "text-amber-600" : "text-red-500"}`}>
                        {a.score}%
                      </span>
                      <span className="text-gray-400">{correct}/{graded.length} correct</span>
                      {a.submission?.earned_points !== undefined && (
                        <span className="text-gray-400">{a.submission.earned_points}/{a.submission.total_points} pts</span>
                      )}
                    </div>
                  )}
                </div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${st.bg} ${st.color}`}>
                  {st.label}
                </span>
                {(a.status === "submitted" || a.status === "graded") && (
                  <button
                    onClick={() => router.push(`/teacher/assignments/submission?id=${a.id}`)}
                    className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
