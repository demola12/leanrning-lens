"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  GraduationCap,
  School,
  Building2,
  KeyRound,
} from "lucide-react";
import AuthNavbar from "@/components/AuthNavbar";
import Logo from "./Logo";

type Role = "student" | "teacher" | "organization";

export interface RegisterFormProps {
  defaultRole?: Role;
  showRoleSelector?: boolean;
  showInviteCode?: boolean;
  redirectAfter?: string;
}

const roles: { id: Role; label: string; description: string; icon: any }[] = [
  {
    id: "student",
    label: "Student",
    description: "Complete assignments and get AI-powered feedback",
    icon: GraduationCap,
  },
  {
    id: "teacher",
    label: "Teacher",
    description: "Create assignments and track student progress",
    icon: School,
  },
  {
    id: "organization",
    label: "Organization",
    description: "Manage classes, teachers, and analytics across your institution",
    icon: Building2,
  },
];

export default function RegisterForm({
  defaultRole = "student",
  showRoleSelector = true,
  showInviteCode = false,
  redirectAfter,
}: RegisterFormProps) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, role } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user?.identities?.length === 0) {
      setError("An account with this email already exists.");
      setLoading(false);
      return;
    }

    // Create profile with ref_uuid via API
    if (data.user) {
      const res = await fetch("/api/register-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: data.user.id,
          full_name: name,
          role,
          email,
        }),
      });
      const result = await res.json();

      if (!res.ok) {
        console.error("Profile creation failed:", result.error);
      }

      // If student was invited by a teacher, link them
      if (role === "student") {
        const refSearchParams = new URLSearchParams(
          typeof window !== "undefined" ? window.location.search : ""
        );
        const teacherRef = refSearchParams.get("ref");
        const codeToUse = inviteCode || teacherRef || "";
        if (codeToUse) {
          await fetch("/api/link-student", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              student_ref_uuid: result.profile?.ref_uuid,
              teacher_ref: codeToUse,
            }),
          }).catch(console.error);
        }
      }
    }

    router.push(redirectAfter || `/auth/confirm?email=${encodeURIComponent(email)}`);
  };

  return (
    <>
      <AuthNavbar />
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-full max-w-md px-6 py-12">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
            <p className="mt-2 text-gray-500">Start your personalized learning journey</p>
          </div>

          {showRoleSelector && (
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                I am a...
              </label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const selected = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        selected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-gray-100 bg-white hover:border-gray-200"
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${selected ? "text-primary" : "text-gray-400"}`} />
                      <span className={`text-sm font-semibold ${selected ? "text-primary" : "text-gray-600"}`}>
                        {r.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {showInviteCode && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Invite Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="Enter invite code (e.g. K8M2QX)"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    role === "organization"
                      ? "Your institution name"
                      : role === "teacher"
                      ? "Ms. Johnson"
                      : "Alex Thompson"
                  }
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "organization" ? "admin@school.edu" : "you@school.edu"}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-11 py-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all disabled:opacity-60"
            >
              {loading
                ? "Creating account..."
                : role === "student"
                ? "Create Student Account"
                : role === "teacher"
                ? "Create Teacher Account"
                : "Create Organization Account"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
