"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import {
  Users,
  Plus,
  Search,
  Eye,
  Send,
  Copy,
  X,
  Check,
  KeyRound,
  Link2,
  UserPlus,
  Search as SearchIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface Student {
  id: string;
  full_name: string;
  ref_uuid: string;
  email: string;
  created_at: string;
}

export default function TeacherStudentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [teacherRef, setTeacherRef] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"invite" | null>(null);
  const [studentUuid, setStudentUuid] = useState("");
  const [uuidError, setUuidError] = useState("");
  const [uuidSuccess, setUuidSuccess] = useState(false);
  const [addingUuid, setAddingUuid] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchStudents = useCallback(async () => {
    if (!user) return;
    const res = await fetch(`/api/teacher-students?user_id=${user.id}`);
    const data = await res.json();
    if (data.students) {
      setStudents(data.students);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    // Fetch teacher's own profile to get their ref_uuid
    const init = async () => {
      const res = await fetch(`/api/teacher-students?user_id=${user.id}`);
      const data = await res.json();
      if (data.students) setStudents(data.students);
      // Get teacher's own ref
      const meRes = await fetch(`/api/lookup-profile?user_id=${user.id}`);
      const meData = await meRes.json();
      if (meData.ref_uuid) setTeacherRef(meData.ref_uuid);
      setLoading(false);
    };
    init();
  }, [user]);

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.ref_uuid.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = () => {
    setStudentUuid("");
    setUuidError("");
    setUuidSuccess(false);
    setCopied(false);
    setModal("invite");
  };

  const copyToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddByUuid = async () => {
    const trimmed = studentUuid.trim().toUpperCase();
    if (!trimmed) {
      setUuidError("Please enter a student UUID.");
      setUuidSuccess(false);
      return;
    }
    if (trimmed.length < 4) {
      setUuidError("UUID must be at least 4 characters.");
      setUuidSuccess(false);
      return;
    }

    setAddingUuid(true);
    setUuidError("");

    const res = await fetch("/api/link-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_ref_uuid: trimmed,
        teacher_ref: teacherRef,
      }),
    });
    const data = await res.json();

    setAddingUuid(false);

    if (!res.ok) {
      setUuidError(data.error || "Failed to add student.");
      setUuidSuccess(false);
      return;
    }

    setUuidSuccess(true);
    fetchStudents();
    setTimeout(() => {
      setStudentUuid("");
      setUuidSuccess(false);
    }, 2000);
  };

  const inviteLink = typeof window !== "undefined" && teacherRef
    ? `${window.location.origin}/auth/invite/student?ref=${teacherRef}`
    : "";

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Students</h1>
          <p className="mt-1 text-gray-500">Manage your students and invite new ones.</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-dark transition-all shadow-sm shadow-primary/25"
        >
          <Plus className="w-4 h-4" />
          Invite Student
        </button>
      </div>

      <div className="relative w-full sm:w-72 mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <div className="rounded-lg border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  {["Student", "UUID", "Email", "Joined", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((student, i) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/teacher/students/detail?id=${student.id}`)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-bold">
                          {student.full_name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{student.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                        {student.ref_uuid}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{student.email}</td>
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {new Date(student.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-all" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-all" title="Assign">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm">
                {students.length === 0
                  ? "No students yet. Invite your first student to get started."
                  : "No students match your search."}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {[
          { label: "Total Students", value: students.length.toString(), color: "text-primary", bg: "bg-primary/5" },
          { label: "Your Ref UUID", value: teacherRef || "...", color: "text-gray-600", bg: "bg-gray-50" },
          { label: "Invite Code", value: teacherRef ? "Active" : "—", color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((s) => (
          <div key={s.label} className={`p-4 rounded-lg ${s.bg} border border-gray-100`}>
            <div className="text-sm text-gray-500">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color} mt-1 truncate`}>{s.value}</div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {modal === "invite" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setModal(null)}
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
                <h2 className="text-lg font-bold text-gray-900">Add Student</h2>
                <button onClick={() => setModal(null)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center">
                      <SearchIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Add by Student UUID</h3>
                      <p className="text-xs text-gray-400">Enter the student&apos;s existing 8-character UUID</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={studentUuid}
                        onChange={(e) => { setStudentUuid(e.target.value.toUpperCase()); setUuidError(""); setUuidSuccess(false); }}
                        placeholder="e.g. A7K9X2C4"
                        maxLength={8}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <button
                      onClick={handleAddByUuid}
                      disabled={addingUuid}
                      className="flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/25 shrink-0 disabled:opacity-60"
                    >
                      {addingUuid ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      {addingUuid ? "Adding..." : "Add"}
                    </button>
                  </div>
                  {uuidError && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-red-500">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {uuidError}
                    </div>
                  )}
                  {uuidSuccess && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      Student added successfully!
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs font-semibold text-gray-300">OR</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center">
                      <Link2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Send invite link</h3>
                      <p className="text-xs text-gray-400">New students register and connect automatically</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 text-sm text-gray-500 truncate font-mono">
                      {inviteLink || "Loading..."}
                    </div>
                    <button
                      onClick={() => copyToClipboard(inviteLink)}
                      className={`p-4 rounded-lg border transition-all ${
                        copied
                          ? "bg-emerald-50 border-emerald-100 text-emerald-500"
                          : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  {copied && <p className="text-xs text-emerald-600 mt-2 font-semibold">Link copied to clipboard!</p>}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setModal(null)}
                  className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/25"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
