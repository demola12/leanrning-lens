"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useProfiles } from "@/lib/ProfilesContext";
import { School, Loader2, Mail, Users, UserRound } from "lucide-react";

interface TeacherInfo {
  id: string;
  full_name: string;
  email: string;
  ref_uuid: string;
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const { activeProfile } = useProfiles();
  const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !activeProfile) {
      setTeachers([]);
      setLoading(false);
      return;
    }
    const fetchTeachers = async () => {
      setLoading(true);
      const res = await fetch(`/api/student/teachers?profile_id=${activeProfile.id}`);
      const data = await res.json();
      if (data.teachers) setTeachers(data.teachers);
      setLoading(false);
    };
    fetchTeachers();
  }, [user, activeProfile?.id]);

  if (!activeProfile) {
    return (
      <div className="p-8 max-w-4xl">
        <div className="py-24 text-center">
          <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">No profiles yet</h2>
          <p className="text-sm text-gray-400">Add a child profile from the sidebar to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
            {activeProfile.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{activeProfile.full_name}</h1>
            <p className="text-xs text-gray-400 font-mono">{activeProfile.ref_uuid}</p>
          </div>
        </div>
        <p className="mt-2 text-gray-500">View teachers and upcoming assignments for this profile.</p>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <School className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-bold text-gray-900">My Teachers</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : teachers.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No teachers yet</h3>
            <p className="text-sm text-gray-400">Share this profile's code with a teacher to get started.</p>
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 border border-gray-100">
              <span className="text-sm font-mono font-bold text-gray-700">{activeProfile.ref_uuid}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((t) => (
              <div key={t.id} className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {t.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-sm truncate">{t.full_name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{t.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="font-mono">{t.ref_uuid}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
