"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useProfiles } from "@/lib/ProfilesContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  UserPlus,
  Check,
  Loader2,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "Assignments", href: "/student/assignments", icon: FileText },
  { label: "Reports", href: "/student/progress", icon: BarChart3 },
  { label: "Settings", href: "/student/settings", icon: Settings },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();
  const {
    children,
    activeProfile,
    activeProfileId,
    setActiveProfileId,
    loading: profilesLoading,
    addChild,
    refresh,
  } = useProfiles();

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [addChildOpen, setAddChildOpen] = useState(false);
  const [childName, setChildName] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAddChild = async () => {
    if (!childName.trim()) return;
    setAdding(true);
    await addChild(childName.trim());
    setChildName("");
    setAdding(false);
    setAddChildOpen(false);
    refresh();
  };

  const handleSwitchProfile = (id: string) => {
    setActiveProfileId(id);
    setSwitcherOpen(false);
    router.refresh();
  };

  return (
    <div className="w-64 shrink-0 h-screen bg-white border-r border-gray-100 flex flex-col">
      <div className="p-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="LearnLens" className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-gray-900">LearnLens</span>
        </Link>
      </div>

      {profilesLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        </div>
      ) : children.length > 0 ? (
        <div className="relative px-3 pt-3">
          <button
            onClick={() => setSwitcherOpen(!switcherOpen)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
              {activeProfile?.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {activeProfile?.full_name || "Select profile"}
              </p>
              <p className="text-xs text-gray-400 truncate">{activeProfile?.ref_uuid}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          </button>

          {switcherOpen && (
            <div className="absolute top-full left-3 right-3 mt-1 bg-white border border-gray-100 rounded-lg shadow-md z-30 py-1">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => handleSwitchProfile(child.id)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm transition-colors ${
                    child.id === activeProfileId
                      ? "bg-primary/5 text-primary"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${
                    child.id === activeProfileId ? "bg-primary" : "bg-gray-300"
                  }`}>
                    {child.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
                  </div>
                  <span className="flex-1 text-left truncate">{child.full_name}</span>
                  {child.id === activeProfileId && (
                    <Check className="w-3.5 h-3.5 shrink-0" />
                  )}
                </button>
              ))}
              <div className="border-t border-gray-50 mt-1 pt-1">
                <button
                  onClick={() => { setSwitcherOpen(false); setAddChildOpen(true); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Add child
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {addChildOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center p-4" onClick={() => setAddChildOpen(false)}>
          <div className="bg-white rounded-lg border border-gray-100 shadow-md p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900 mb-4">Add a child</h3>
            <p className="text-sm text-gray-500 mb-4">Each child gets their own profile, joining code, and teachers.</p>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Child's full name"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-4"
              autoFocus
            />
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setAddChildOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleAddChild} disabled={adding || !childName.trim()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-60">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Add
              </button>
            </div>
          </div>
        </div>
      )}

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
