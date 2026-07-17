"use client";

import { BarChart3 } from "lucide-react";

export default function StudentReportsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-sm text-gray-500">Your scores, skill mastery, and learning streaks will appear here.</p>
      </div>
    </div>
  );
}
