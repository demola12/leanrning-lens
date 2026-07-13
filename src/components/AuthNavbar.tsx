"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

export default function AuthNavbar() {
  const { user, loading, role, signOut } = useAuth();
  const router = useRouter();

  const dashboardHref = role === "student" ? "/student" : role === "teacher" ? "/teacher" : role === "organization" ? "/organization" : "/dashboard";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/95">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="LearnLens" className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-gray-900">LearnLens</span>
        </Link>

        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <Link href={dashboardHref} className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">Dashboard</Link>
              <button onClick={async () => { await signOut(); router.push("/"); }} className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">Sign In</Link>
              <Link href="/auth/register" className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-all">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
