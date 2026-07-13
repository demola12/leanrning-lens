"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export function useRequireRole(allowedRoles: string[]) {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (!role || !allowedRoles.includes(role)) {
      router.push("/dashboard");
    }
  }, [user, loading, role, allowedRoles, router]);

  return { user, role, loading, authorized: !loading && !!user && !!role && allowedRoles.includes(role) };
}
