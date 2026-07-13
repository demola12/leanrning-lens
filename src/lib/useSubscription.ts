"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";

interface Subscription {
  plan: string;
  status: string;
  current_period_end: string | null;
  stripe_customer_id: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const res = await fetch(`/api/subscription/status?user_id=${user.id}`);
    const data = await res.json();
    setSubscription(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { refetch(); }, [refetch]);

  const createCheckoutSession = async (plan: string) => {
    if (!user) return;
    const res = await fetch("/api/subscription/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, plan }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  const openPortal = async () => {
    if (!user) return;
    const res = await fetch("/api/subscription/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  const cancelSubscription = async () => {
    if (!user) return;
    await fetch("/api/subscription/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id }),
    });
    refetch();
  };

  const resumeSubscription = async () => {
    if (!user) return;
    await fetch("/api/subscription/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id }),
    });
    refetch();
  };

  return { subscription, loading, createCheckoutSession, openPortal, cancelSubscription, resumeSubscription, refetch };
}
