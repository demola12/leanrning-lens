"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StudentSidebar from "@/components/StudentSidebar";
import { useRequireRole } from "@/lib/useRequireRole";
import { useAuth } from "@/lib/AuthContext";
import { ProfilesProvider } from "@/lib/ProfilesContext";
import { Loader2 } from "lucide-react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, authorized } = useRequireRole(["student"]);
  const { user } = useAuth();
  const router = useRouter();
  const [gatePassed, setGatePassed] = useState(false);

  useEffect(() => {
    if (loading || !authorized || !user) return;
    if (window.location.pathname === "/student/onboarding") {
      setGatePassed(true);
      return;
    }
    fetch(`/api/subscription/status?user_id=${user.id}`)
      .then((r) => r.json())
      .then((sub) => {
        if (!sub || sub.plan === "free") {
          router.replace("/student/onboarding");
        } else {
          setGatePassed(true);
        }
      })
      .catch(() => setGatePassed(true));
  }, [user, loading, authorized, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!authorized) return null;

  if (!gatePassed && window.location.pathname !== "/student/onboarding") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (window.location.pathname === "/student/onboarding") {
    return <ProfilesProvider>{children}</ProfilesProvider>;
  }

  return (
    <div className="flex min-h-screen">
      <ProfilesProvider>
        <StudentSidebar />
        <main className="flex-1 bg-gray-50/50">{children}</main>
      </ProfilesProvider>
    </div>
  );
}
