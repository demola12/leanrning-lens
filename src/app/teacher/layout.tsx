"use client";

import TeacherSidebar from "@/components/TeacherSidebar";
import { useRequireRole } from "@/lib/useRequireRole";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, authorized } = useRequireRole(["teacher"]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="flex min-h-screen">
      <TeacherSidebar />
      <main className="flex-1 bg-gray-50/50">{children}</main>
    </div>
  );
}
