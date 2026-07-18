"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Mail, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import AuthNavbar from "@/components/AuthNavbar";

function ConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const ref = searchParams.get("ref") || "";
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const handleChange = (i: number, value: string) => {
    if (value.length > 1) return;
    const next = [...code];
    next[i] = value;
    setCode(next);
    if (value && i < 5) {
      const nextInput = document.getElementById(`otp-${i + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      const prev = document.getElementById(`otp-${i - 1}`);
      prev?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = code.join("");
    if (token.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/auth/login");
  };

  const handleResend = async () => {
    setResent(true);
    setError("");
    await supabase.auth.resend({
      type: "signup",
      email,
    });
    setTimeout(() => setResent(false), 30000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="w-full max-w-md px-6 py-12">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Check your email</h1>
          <p className="mt-2 text-gray-500">
            We sent a 6-digit confirmation code to{" "}
            <span className="font-semibold text-gray-700">{email || "your email"}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {resent && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Code resent! Check your inbox.
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
              Confirmation code
            </label>
            <div className="flex items-center justify-center gap-2">
              {code.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all shadow-sm shadow-primary/25 disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify Email"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={handleResend}
            disabled={resent}
            className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors disabled:text-gray-400"
          >
            {resent ? "Code sent" : "Resend code"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link
            href="/auth/login"
            className="font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <>
      <AuthNavbar />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center pt-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <ConfirmForm />
      </Suspense>
    </>
  );
}
