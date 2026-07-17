"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useProfiles } from "@/lib/ProfilesContext";
import { motion } from "framer-motion";
import {
  FileText,
  Search,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Calendar,
} from "lucide-react";

interface AssignedItem {
  id: string;
  status: string;
  score: number | null;
  due_date: string | null;
  created_at: string;
  submitted_at: string | null;
  assignment: {
    id: string;
    title: string;
    subject: string;
    question_count: number;
    total_points: number;
    time_limit: number;
    questions: any[];
  };
}

const statusStyles: Record<string, { label: string; color: string; bg: string }> = {
  assigned: { label: "Not Started", color: "text-gray-500", bg: "bg-gray-100" },
  in_progress: { label: "In Progress", color: "text-blue-600", bg: "bg-blue-50" },
  submitted: { label: "Submitted", color: "text-amber-600", bg: "bg-amber-50" },
  graded: { label: "Graded", color: "text-emerald-600", bg: "bg-emerald-50" },
  reviewed: { label: "Reviewed", color: "text-indigo-600", bg: "bg-indigo-50" },
};

export default function StudentAssignmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeProfile } = useProfiles();
  const [assignments, setAssignments] = useState<AssignedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchAssignments = useCallback(async () => {
    if (!user || !activeProfile) {
      setAssignments([]);
      setLoading(false);
      return;
    }
    const res = await fetch(`/api/student/assignments?profile_id=${activeProfile.id}`);
    const data = await res.json();
    if (data.assignments) setAssignments(data.assignments);
    setLoading(false);
  }, [user, activeProfile?.id]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const filtered = assignments.filter(
    (a) => a.assignment.title.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = assignments.filter(
    (a) => a.status === "assigned" || a.status === "in_progress"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Assignments</h1>
        <p className="mt-1 text-gray-500">Complete your assignments and track your progress.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Assigned", value: assignments.length.toString(), color: "text-primary", bg: "bg-primary/5" },
          { label: "Pending", value: pendingCount.toString(), color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Submitted", value: assignments.filter((a) => a.status === "submitted").length.toString(), color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Graded", value: assignments.filter((a) => a.status === "graded").length.toString(), color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((s) => (
          <div key={s.label} className={`p-4 rounded-lg ${s.bg} border border-gray-100`}>
            <div className="text-sm text-gray-500">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color} mt-1`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-72 mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assignments..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {assignments.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-20 h-20 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No assignments yet</h2>
          <p className="text-gray-500">Your teacher hasn&apos;t assigned anything yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => {
            const st = statusStyles[item.status] || statusStyles.assigned;
            const isOverdue = item.due_date && new Date(item.due_date) < new Date() && item.status === "assigned";
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 p-5 rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  if (item.status === "submitted" || item.status === "graded" || item.status === "reviewed") {
                    router.push(`/student/assignments/result?id=${item.id}`);
                  } else {
                    router.push(`/student/assignments/take?id=${item.id}`);
                  }
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{item.assignment.title}</h3>
                  {(item.assignment as any).description && <p className="text-xs text-gray-400 truncate mt-0.5">{(item.assignment as any).description}</p>}
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>{item.assignment.subject || "General"}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>{item.assignment.question_count} questions</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>{item.assignment.total_points} pts</span>
                    {item.assignment.time_limit > 0 && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.assignment.time_limit} min
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {item.due_date && (
                    <div className={`hidden md:flex items-center gap-1 text-xs ${isOverdue ? "text-red-500" : "text-gray-400"}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.due_date).toLocaleDateString()}
                    </div>
                  )}
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${st.bg} ${st.color}`}>
                    {st.label}
                  </span>
                  {item.score !== null && (
                    <span className={`text-sm font-bold ${item.score >= 70 ? "text-emerald-600" : item.score >= 40 ? "text-amber-600" : "text-red-500"}`}>
                      {item.score}%
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
