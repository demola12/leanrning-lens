"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Users,
  Calendar,
  Clock,
  Send,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  BarChart3,
  BookOpen,
  ChevronDown,
  Eye,
  Trash2,
  Edit3,
} from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description?: string;
  subject: string;
  question_count: number;
  total_points: number;
  questions: any[];
  created_at: string;
  updated_at: string;
}

interface AssignedStudent {
  id: string;
  student_id: string;
  status: string;
  due_date: string | null;
  score: number | null;
  created_at: string;
  student: { id: string; full_name: string; ref_uuid: string; email: string };
}

interface TeacherStudent {
  id: string;
  full_name: string;
  ref_uuid: string;
}

const statusStyles: Record<string, { label: string; color: string; bg: string }> = {
  assigned: { label: "Assigned", color: "text-primary", bg: "bg-primary/5" },
  in_progress: { label: "In Progress", color: "text-blue-600", bg: "bg-blue-50" },
  submitted: { label: "Submitted", color: "text-amber-600", bg: "bg-amber-50" },
  graded: { label: "Graded", color: "text-emerald-600", bg: "bg-emerald-50" },
  reviewed: { label: "Reviewed", color: "text-indigo-600", bg: "bg-indigo-50" },
};

export default function AssignmentDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get("id");
  const { user } = useAuth();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [assignedStudents, setAssignedStudents] = useState<AssignedStudent[]>([]);
  const [teacherStudents, setTeacherStudents] = useState<TeacherStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    if (!assignmentId || !user) return;
    const [detailRes, assignedRes, studentsRes] = await Promise.all([
      fetch(`/api/assignments/get?id=${assignmentId}`),
      fetch(`/api/assignments/assigned-students?assignment_id=${assignmentId}`),
      fetch(`/api/teacher-students?user_id=${user.id}`),
    ]);
    const detail = await detailRes.json();
    const assigned = await assignedRes.json();
    const students = await studentsRes.json();

    if (detail.id) setAssignment(detail);
    if (assigned.assigned) setAssignedStudents(assigned.assigned);
    if (students.students) setTeacherStudents(students.students);
    setLoading(false);
  }, [assignmentId, user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAssign = async () => {
    if (!user || !assignmentId || selectedStudents.length === 0) return;
    setAssigning(true);
    const res = await fetch("/api/assignments/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teacher_user_id: user.id,
        assignment_id: assignmentId,
        student_ids: selectedStudents,
        due_date: dueDate || null,
      }),
    });
    if (res.ok) {
      setShowAssign(false);
      setSelectedStudents([]);
      setDueDate("");
      fetchData();
    }
    setAssigning(false);
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const assignedIds = new Set(assignedStudents.map((a) => a.student_id));
  const unassignedStudents = teacherStudents.filter((s) => !assignedIds.has(s.id));

  const filteredUnassigned = unassignedStudents.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ref_uuid.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const sortedAssigned = [...assignedStudents].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/teacher/assignments")}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{assignment.title}</h1>
            {assignment.description && (
              <p className="text-sm text-gray-500 mt-1">{assignment.description}</p>
            )}
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
              <span>{assignment.subject || "General"}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>{assignment.question_count} questions</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>{assignment.total_points} pts</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/teacher/assignments/edit?id=${assignmentId}`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:border-gray-300 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => setShowAssign(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/25"
          >
            <Send className="w-4 h-4" />
            Assign
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Assigned To", value: assignedStudents.length.toString(), icon: Users, color: "text-primary", bg: "bg-primary/5" },
          { label: "Completed", value: assignedStudents.filter((a) => a.status === "submitted" || a.status === "graded" || a.status === "reviewed").length.toString(), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "In Progress", value: assignedStudents.filter((a) => a.status === "in_progress").length.toString(), icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Avg Score", value: (() => { const graded = assignedStudents.filter((a) => a.score !== null); return graded.length > 0 ? `${Math.round(graded.reduce((s, a) => s + (a.score || 0), 0) / graded.length)}%` : "—"; })(), icon: BookOpen, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`p-5 rounded-lg ${s.bg} border border-gray-100`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{s.label}</span>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Questions Preview */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Questions Preview</h2>
        <div className="space-y-2">
          {(assignment.questions || []).slice(0, 5).map((q: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-white border border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{q.title || "Untitled question"}</p>
                <span className="text-xs text-gray-400">{q.type.replace("_", " ")} · {q.points} pt</span>
              </div>
              <Eye className="w-4 h-4 text-gray-300" />
            </div>
          ))}
          {(assignment.questions || []).length > 5 && (
            <p className="text-sm text-gray-400 text-center pt-2">
              +{(assignment.questions || []).length - 5} more questions
            </p>
          )}
        </div>
      </div>

      {/* Assigned Students Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Assigned Students</h2>
          <span className="text-sm text-gray-400">{assignedStudents.length} student{assignedStudents.length !== 1 ? "s" : ""}</span>
        </div>

        {assignedStudents.length === 0 ? (
          <div className="py-16 text-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50">
            <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No students assigned yet</h3>
            <p className="text-gray-500 text-sm mb-6">Assign this assignment to your students to track progress.</p>
            <button
              onClick={() => setShowAssign(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/25"
            >
              <Plus className="w-4 h-4" />
              Assign to Students
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    {["Student", "UUID", "Status", "Due Date", "Score", "Assigned", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedAssigned.map((a) => {
                    const st = statusStyles[a.status] || statusStyles.assigned;
                    return (
                      <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                              {a.student.full_name.split(" ").map((n: string) => n[0]).join("")}
                            </div>
                            <span className="font-semibold text-gray-900 text-sm">{a.student.full_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">{a.student.ref_uuid}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${st.bg} ${st.color}`}>{st.label}</span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">{a.due_date ? new Date(a.due_date).toLocaleDateString() : "—"}</td>
                        <td className="px-5 py-4">
                          <span className={`text-sm font-semibold ${a.score !== null ? "text-gray-900" : "text-gray-300"}`}>
                            {a.score !== null ? `${a.score}%` : "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-400">{new Date(a.created_at).toLocaleDateString()}</td>
                        <td className="px-5 py-4">
                          {(a.status === "submitted" || a.status === "graded" || a.status === "reviewed") && (
                            <button
                              onClick={() => router.push(`/teacher/assignments/submission?id=${a.id}`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-primary text-xs font-semibold hover:bg-primary/10 transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add more students button */}
        {assignedStudents.length > 0 && unassignedStudents.length > 0 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAssign(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-semibold hover:border-gray-300 transition-all"
            >
              <Plus className="w-4 h-4" />
              Assign to More Students
            </button>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      <AnimatePresence>
        {showAssign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowAssign(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Assign to Students</h2>
                <button onClick={() => setShowAssign(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search students..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                {/* Student count */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{selectedStudents.length} selected</span>
                  <button
                    onClick={() => setSelectedStudents(selectedStudents.length === filteredUnassigned.length ? [] : filteredUnassigned.map((s) => s.id))}
                    className="font-semibold text-primary hover:text-primary-dark transition-colors"
                  >
                    {selectedStudents.length === filteredUnassigned.length ? "Deselect all" : "Select all"}
                  </button>
                </div>

                {/* Student list */}
                <div className="max-h-64 overflow-y-auto space-y-1 -mx-2 px-2">
                  {filteredUnassigned.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-400">
                      {unassignedStudents.length === 0 ? "All your students are already assigned." : "No students match your search."}
                    </div>
                  ) : (
                    filteredUnassigned.map((s) => {
                      const selected = selectedStudents.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggleStudent(s.id)}
                          className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all ${
                            selected ? "bg-primary/5 border border-primary/20" : "hover:bg-gray-50 border border-transparent"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                            selected ? "border-primary bg-primary" : "border-gray-300"
                          }`}>
                            {selected && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {s.full_name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">{s.full_name}</div>
                            <div className="text-xs text-gray-400 font-mono">{s.ref_uuid}</div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Due date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due date (optional)</label>
                  <div className="relative max-w-xs">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowAssign(false)}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssign}
                    disabled={assigning || selectedStudents.length === 0}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/25 disabled:opacity-60"
                  >
                    {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {assigning ? "Assigning..." : `Assign to ${selectedStudents.length} student${selectedStudents.length !== 1 ? "s" : ""}`}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
