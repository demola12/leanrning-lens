"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "Assignments", href: "/student/assignments", icon: FileText },
  { label: "Progress", href: "/student/progress", icon: BarChart3 },
  { label: "Settings", href: "/student/settings", icon: Settings },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();

  return (
    <div className="w-64 shrink-0 h-screen bg-white border-r border-gray-100 flex flex-col">
      <div className="p-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="LearnLens" className="w-5 h-5" />
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
