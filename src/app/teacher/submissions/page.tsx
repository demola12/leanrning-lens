"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  Search,
  Eye,
  FileText,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
} from "lucide-react";

interface SubmissionItem {
  id: string;
  status: string;
  score: number | null;
  submitted_at: string | null;
  created_at: string;
  student: { id: string; full_name: string; ref_uuid: string };
  assignment: { id: string; title: string; question_count: number; total_points: number };
}

const statusStyles: Record<string, { label: string; color: string; bg: string }> = {
  submitted: { label: "Submitted", color: "text-amber-600", bg: "bg-amber-50" },
  graded: { label: "Graded", color: "text-emerald-600", bg: "bg-emerald-50" },
  reviewed: { label: "Reviewed", color: "text-indigo-600", bg: "bg-indigo-50" },
};

export default function TeacherSubmissionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchSubmissions = useCallback(async () => {
    if (!user) return;
    const res = await fetch(`/api/teacher/all-submissions?user_id=${user.id}`);
    const data = await res.json();
    if (data.submissions) setSubmissions(data.submissions);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  const filtered = submissions.filter(
    (s) =>
      (s.student?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.assignment?.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Submissions</h1>
        <p className="mt-1 text-gray-500">Review student submissions and grades.</p>
      </div>

      <div className="relative w-full sm:w-72 mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search submissions..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">No submissions yet</h2>
          <p className="text-sm text-gray-500">When students submit assignments, they will appear here.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  {["Student", "Assignment", "Status", "Score", "Submitted", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const st = statusStyles[s.status] || { label: s.status, color: "text-gray-500", bg: "bg-gray-100" };
                  return (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/teacher/assignments/submission?id=${s.id}`)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold">
                            {s.student?.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{s.student?.full_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{s.assignment?.title}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${st.bg} ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-semibold ${s.score !== null ? (s.score >= 70 ? "text-emerald-600" : s.score >= 40 ? "text-amber-600" : "text-red-500") : "text-gray-300"}`}>
                          {s.score !== null ? `${s.score}%` : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-400">{s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : new Date(s.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <Eye className="w-4 h-4 text-gray-300" />
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
