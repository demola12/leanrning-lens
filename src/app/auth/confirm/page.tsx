"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Mail, ArrowRight, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import AuthNavbar from "@/components/AuthNavbar";

function ConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    setSending(true);
    setError("");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    setSending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setResent(true);
    setTimeout(() => setResent(false), 30000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="w-full max-w-md px-6 py-12">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Confirm your email</h1>
          <p className="mt-2 text-gray-500">
            A confirmation link has been sent to{" "}
            <span className="font-semibold text-gray-700">{email || "your email"}</span>
          </p>
          <p className="mt-3 text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5">
            Check your inbox and click the link to verify your account. If you don't see it, check your spam or junk folder.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {resent && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm mb-4">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Confirmation link resent! Check your inbox.
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={sending || resent}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:border-gray-300 transition-all disabled:opacity-60"
        >
          {sending ? "Sending..." : <RefreshCw className="w-4 h-4" />}
          {resent ? "Link sent" : "Resend confirmation link"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already verified?{" "}
          <Link href="/auth/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">
            Sign in
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
