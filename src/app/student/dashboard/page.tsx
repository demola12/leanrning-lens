"use client";

import { LayoutDashboard } from "lucide-react";

export default function StudentDashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <LayoutDashboard className="w-10 h-10 text-gray-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-sm text-gray-500">Your upcoming assignments, recent activity, and learning insights will appear here.</p>
      </div>
    </div>
  );
}
