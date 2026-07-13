"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import RegisterForm from "@/components/RegisterForm";

function InviteStudentContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") || "";

  return (
    <RegisterForm
      defaultRole="student"
      showRoleSelector={false}
      showInviteCode
      redirectAfter={`/auth/confirm?ref=${encodeURIComponent(ref)}&invite=1`}
    />
  );
}

export default function InviteStudentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <InviteStudentContent />
    </Suspense>
  );
}
