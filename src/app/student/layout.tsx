"use client";

import StudentSidebar from "@/components/StudentSidebar";
import { useRequireRole } from "@/lib/useRequireRole";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, authorized } = useRequireRole(["student"]);

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
      <StudentSidebar />
      <main className="flex-1 bg-gray-50/50">{children}</main>
    </div>
  );
}
