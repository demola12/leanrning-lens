"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Mail, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import AuthNavbar from "@/components/AuthNavbar";
import Logo from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/login`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <>
      <AuthNavbar />
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-full max-w-md px-6 py-12">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-emerald-500" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Check your email</h1>
              <p className="mt-2 text-gray-500">
                We sent a password reset link to{" "}
                <span className="font-semibold text-gray-700">{email}</span>
              </p>
              <p className="mt-6 text-sm text-gray-400">
                Didn&apos;t receive it?{" "}
                <button
                  onClick={() => setSent(false)}
                  className="font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  Try again
                </button>
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <div className="flex justify-center mb-4">
                  <Logo size="lg" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Reset your password</h1>
                <p className="mt-2 text-gray-500">
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-5">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

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
                      placeholder="you@school.edu"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all shadow-sm shadow-primary/25 disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-gray-500">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
