"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import {
  FileText,
  Plus,
  MoreHorizontal,
  Copy,
  Trash2,
  Edit3,
  Send,
  Search,
  X,
  FileUp,
  PenLine,
  Sparkles,
  Loader2,
} from "lucide-react";

type Tab = "templates" | "assigned";
type ModalView = null | "new";

interface Assignment {
  id: string;
  title: string;
  description?: string;
  subject: string;
  question_count: number;
  total_points: number;
  times_used: number;
  filename: string;
  questions: any[];
  created_at: string;
  updated_at: string;
}

export default function TeacherAssignmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("templates");
  const [modal, setModal] = useState<ModalView>(null);
  const [search, setSearch] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  const [step, setStep] = useState<"choose" | "assign">("choose");

  const fetchAssignments = useCallback(async () => {
    if (!user) return;
    const res = await fetch(`/api/assignments/list?user_id=${user.id}`);
    const data = await res.json();
    if (data.assignments) setAssignments(data.assignments);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchAssignments();
  }, [user, fetchAssignments]);

  const filteredTemplates = assignments.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.subject || "").toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setStep("choose"); setModal("new"); };
  const closeModal = () => { setModal(null); };

  const handleDelete = async (id: string) => {
    if (!user || deleting) return;
    setDeleting(id);
    await fetch("/api/assignments/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, assignment_id: id }),
    });
    fetchAssignments();
    setDeleting(null);
  };

  const handleDuplicate = async (id: string) => {
    if (!user || duplicating) return;
    setDuplicating(id);
    await fetch("/api/assignments/duplicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, assignment_id: id }),
    });
    fetchAssignments();
    setDuplicating(null);
  };

  const handleEdit = (id: string) => {
    router.push(`/teacher/assignments/edit?id=${id}`);
  };

  const handleAssign = (id: string) => {
    router.push(`/teacher/assignments/detail?id=${id}`);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Assignments</h1>
          <p className="mt-1 text-gray-500">Create, reuse, and manage assignments.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-dark transition-all shadow-sm shadow-primary/25"
        >
          <Plus className="w-4 h-4" />
          New Assignment
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/5 flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-primary/60" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No assignments yet</h2>
          <p className="text-gray-500 mb-8">Create your first assignment or build a reusable template.</p>
          <div className="flex gap-4">
            <button onClick={openNew} className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-dark transition-all shadow-sm shadow-primary/25">
              <FileUp className="w-4 h-4" />
              Upload PDF
            </button>
            <button onClick={() => router.push("/teacher/assignments/create")} className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold text-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
              <PenLine className="w-4 h-4" />
              Create Manually
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100">
              {(["templates", "assigned"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t === "templates" ? "Templates" : "Assigned"}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assignments..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {tab === "templates" && (
            <div className="space-y-3">
              {filteredTemplates.map((tmpl, i) => (
                <motion.div
                  key={tmpl.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-5 rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{tmpl.title}</h3>
                    {tmpl.description && <p className="text-xs text-gray-400 truncate mt-0.5">{tmpl.description}</p>}
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{tmpl.subject || "General"}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span>{tmpl.question_count} questions</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span>{tmpl.total_points} pts</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 hidden md:block">{timeAgo(tmpl.updated_at)}</div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAssign(tmpl.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Assign
                    </button>
                    <div className="relative group">
                      <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-44 py-2 rounded-lg bg-white border border-gray-100 shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                        <button
                          onClick={() => handleEdit(tmpl.id)}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDuplicate(tmpl.id)}
                          disabled={duplicating === tmpl.id}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <Copy className="w-4 h-4" />
                          {duplicating === tmpl.id ? "Duplicating..." : "Duplicate"}
                        </button>
                        <button
                          onClick={() => handleDelete(tmpl.id)}
                          disabled={deleting === tmpl.id}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          {deleting === tmpl.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {tab === "assigned" && (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm">Assignments you send to students will appear here.</p>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {modal === "new" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">New Assignment</h2>
                <button onClick={closeModal} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-500">How would you like to create this assignment?</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: FileUp, title: "Upload PDF", desc: "Extract questions from any PDF automatically", color: "text-primary", action: () => {} },
                    { icon: Sparkles, title: "AI Builder", desc: "Generate questions with AI from any topic", color: "text-accent", action: () => {} },
                    { icon: PenLine, title: "Manual Builder", desc: "Write your own questions from scratch", color: "text-emerald-500", action: () => { closeModal(); router.push("/teacher/assignments/create"); } },
                  ].map((opt) => (
                    <button
                      key={opt.title}
                      onClick={opt.action}
                      className="flex flex-col items-center text-center p-6 rounded-lg border-2 border-gray-100 bg-white hover:border-primary/30 hover:bg-primary/5 transition-all"
                    >
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
                        opt.color === "text-primary" ? "from-primary/10 to-primary/5" :
                        opt.color === "text-accent" ? "from-cyan-50 to-cyan-100/30" :
                        "from-emerald-50 to-emerald-100/30"
                      } flex items-center justify-center mb-4`}>
                        <opt.icon className={`w-6 h-6 ${opt.color}`} />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">{opt.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
