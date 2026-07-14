"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  ClipboardCheck,
  Settings,
  LogOut,
  Wrench,
  ChevronDown,
  ChevronRight,
  Package,
  Store,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
  { label: "Assignments", href: "/teacher/assignments", icon: FileText },
  { label: "Students", href: "/teacher/students", icon: Users },
  { label: "Submissions", href: "/teacher/submissions", icon: ClipboardCheck },
  { label: "Settings", href: "/teacher/settings", icon: Settings },
];

export default function TeacherSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsActive = pathname.startsWith("/teacher/tools");

  return (
    <div className="w-64 shrink-0 h-screen bg-white border-r border-gray-100 flex flex-col">
      <div className="p-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="LearnLens" className="w-7 h-7" />
          </div>
          <span className="font-bold text-xl text-gray-900">LearnLens</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-white"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-2">
          <button
            onClick={() => setToolsOpen(!toolsOpen)}
            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              toolsActive
                ? "bg-primary text-white"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <span className="flex items-center gap-3">
              <Wrench className="w-4.5 h-4.5" />
              Tools
            </span>
            {toolsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {toolsOpen && (
            <div className="ml-3 mt-1 space-y-0.5 border-l border-gray-100 pl-3">
              <Link
                href="/teacher/tools/installed"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/teacher/tools/installed"
                    ? "bg-primary/10 text-primary"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <Package className="w-4 h-4" />
                Installed Tools
              </Link>
              <Link
                href="/teacher/tools/marketplace"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/teacher/tools/marketplace"
                    ? "bg-primary/10 text-primary"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <Store className="w-4 h-4" />
                Marketplace
              </Link>
            </div>
          )}
        </div>
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={async () => { await signOut(); router.push("/"); }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
