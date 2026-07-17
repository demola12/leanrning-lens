"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import {
  Users,
  FileText,
  ClipboardCheck,
  CalendarClock,
  Plus,
  FileUp,
  UserPlus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Loader2,
  Sparkles,
  PenLine,
  UserCheck,
  Upload,
  RefreshCw,
  Send,
} from "lucide-react";

interface DashboardData {
  teacherName: string;
  stats: {
    students: number;
    assignments: number;
    activeAssignments: number;
    pendingReviews: number;
    dueThisWeek: number;
  };
  recentAssignments: any[];
  pendingReviews: any[];
  activity: {
    id: string;
    type: string;
    description?: string;
    student_id?: string;
    assignment_id?: string;
    metadata?: Record<string, any>;
    timestamp: string;
  }[];
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

const activityIcon = (type: string) => {
  switch (type) {
    case "student_joined":
      return <UserCheck className="w-4 h-4 text-blue-600" />;
    case "student_submitted":
      return <Upload className="w-4 h-4 text-violet-600" />;
    case "student_resubmitted":
      return <RefreshCw className="w-4 h-4 text-orange-600" />;
    case "assignment_published":
      return <Send className="w-4 h-4 text-emerald-600" />;
    case "pdf_converted":
      return <FileText className="w-4 h-4 text-indigo-600" />;
    default:
      return <Sparkles className="w-4 h-4 text-gray-400" />;
  }
};

const activityColor = (type: string) => {
  switch (type) {
    case "student_joined":
      return { bg: "bg-blue-50" };
    case "student_submitted":
      return { bg: "bg-violet-50" };
    case "student_resubmitted":
      return { bg: "bg-orange-50" };
    case "assignment_published":
      return { bg: "bg-emerald-50" };
    case "pdf_converted":
      return { bg: "bg-indigo-50" };
    default:
      return { bg: "bg-gray-50" };
  }
};

const activityLabel = (type: string, entry: any) => {
  const meta = entry.metadata || {};
  const name = meta?.student_name || "A student";
  const title = meta?.assignment_title || "an assignment";

  switch (type) {
    case "student_joined":
      return (
        <>
          <span className="font-semibold text-gray-900">{meta?.student_name || "A student"}</span>
          {" joined via invite"}
        </>
      );
    case "student_submitted":
      return (
        <>
          <span className="font-semibold text-gray-900">{name}</span>
          {" submitted "}
          <span className="font-medium text-gray-800">{title}</span>
        </>
      );
    case "student_resubmitted":
      return (
        <>
          <span className="font-semibold text-gray-900">{name}</span>
          {" resubmitted "}
          <span className="font-medium text-gray-800">{title}</span>
        </>
      );
    case "assignment_published":
      return (
        <>
          <span className="font-medium text-gray-800">{title}</span>
          {" published"}
        </>
      );
    case "pdf_converted":
      return (
        <>
          PDF converted into questions for{" "}
          <span className="font-medium text-gray-800">{meta?.assignment_title || "an assignment"}</span>
        </>
      );
    default:
      return <span>{entry.description || "Activity"}</span>;
  }
};

const kpiCards = [
  { key: "students", label: "Students", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "activeAssignments", label: "Active Assignments", icon: FileText, color: "text-primary", bg: "bg-primary/5" },
  { key: "pendingReviews", label: "Pending Reviews", icon: ClipboardCheck, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "dueThisWeek", label: "Due This Week", icon: CalendarClock, color: "text-rose-600", bg: "bg-rose-50" },
];

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/teacher/dashboard?user_id=${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchDashboard();
  }, [user, fetchDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 max-w-4xl">
        <div className="text-center py-24">
          <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-gray-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to LearnLens</h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Create your first assignment to get started. Your dashboard will show student progress, submissions, and activity here.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => router.push("/teacher/assignments")}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-dark transition-all shadow-sm shadow-primary/25"
            >
              <FileUp className="w-4 h-4" />
              Upload PDF
            </button>
            <button
              onClick={() => router.push("/teacher/assignments/create")}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold text-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
            >
              <PenLine className="w-4 h-4" />
              Create Manually
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { stats } = data;

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Good morning, {data.teacherName || "Sarah"} {""}
          </h1>
          <p className="mt-1 text-gray-500">Ready to continue teaching today?</p>
        </div>
        <button className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-3 mb-10">
        <button
          onClick={() => router.push("/teacher/assignments/create")}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-dark transition-all shadow-sm shadow-primary/25"
        >
          <Plus className="w-4 h-4" />
          New Assignment
        </button>
        <button
          onClick={() => router.push("/teacher/assignments/create")}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 font-semibold text-sm rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
        >
          <FileUp className="w-4 h-4" />
          Upload PDF
        </button>
        <button
          onClick={() => router.push("/teacher/students")}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 font-semibold text-sm rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Invite Student
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key as keyof typeof stats];
          return (
            <div key={card.key} className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Assignments</h2>
            <button
              onClick={() => router.push("/teacher/assignments")}
              className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {data.recentAssignments.slice(0, 5).map((a: any) => (
              <div
                key={a.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/teacher/assignments/edit?id=${a.id}`)}
              >
                <div className="w-9 h-9 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{a.title}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  a.status === "published"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {a.status === "published" ? "Published" : "Draft"}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Pending Reviews</h2>
            <button
              onClick={() => router.push("/teacher/submissions")}
              className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {data.pendingReviews.length === 0 ? (
              <div className="p-6 rounded-lg bg-white border border-gray-100 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">All caught up!</p>
              </div>
            ) : (
              data.pendingReviews.slice(0, 5).map((s: any) => (
                <div
                  key={s.id}
                  className="p-4 rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/teacher/submissions`)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                      <ClipboardCheck className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {s.student?.full_name || "Student"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {s.assignment?.title || "Assignment"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Submitted {timeAgo(s.submitted_at)}
                    </span>
                    <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                      Needs Review
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Activity Feed</h2>
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm divide-y divide-gray-50">
          {data.activity.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-400">No recent activity</p>
            </div>
          ) : (
            data.activity.slice(0, 10).map((entry) => {
              const icon = activityIcon(entry.type);
              const color = activityColor(entry.type);
              const label = activityLabel(entry.type, entry);
              return (
                <div key={entry.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className={`w-8 h-8 rounded-full ${color.bg} flex items-center justify-center shrink-0`}>
                    {icon}
                  </div>
                  <p className="text-sm text-gray-700 flex-1 min-w-0">
                    {label}
                  </p>
                  <span className="text-xs text-gray-400 shrink-0">{timeAgo(entry.timestamp)}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
