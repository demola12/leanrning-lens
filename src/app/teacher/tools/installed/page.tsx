"use client";

import { Package } from "lucide-react";

export default function InstalledToolsPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Installed Tools</h1>
        <p className="mt-1 text-gray-500">Tools and integrations available in your workspace.</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-gray-300" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">No tools installed</h2>
        <p className="text-sm text-gray-400">Check the Marketplace to find and install tools.</p>
      </div>
    </div>
  );
}
