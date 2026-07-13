"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentIndex() {
  const router = useRouter();
  useEffect(() => { router.replace("/student/dashboard"); }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
