"use client";

import { Building2 } from "lucide-react";

export default function OrganizationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Organization Dashboard</h1>
        <p className="text-sm text-gray-500">Manage classes, view institutional analytics, and oversee accounts here.</p>
      </div>
    </div>
  );
}
