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

  // Auto-sync when session_id is in the URL (returned from Stripe checkout)
  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return;

    let attempts = 0;
    const doSync = () => {
      fetch("/api/subscription/sync-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, session_id: sessionId }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            refetch();
            window.history.replaceState({}, "", window.location.pathname);
          } else if (attempts < 10) {
            attempts++;
            setTimeout(doSync, 2000);
          } else {
            alert("Payment received but plan sync failed. Please refresh the page.");
          }
        })
        .catch(() => {
          if (attempts < 10) {
            attempts++;
            setTimeout(doSync, 2000);
          }
        });
    };
    doSync();
  }, [user, refetch]);

  const createCheckoutSession = async (plan: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/subscription/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        alert(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      alert("Failed to start checkout. Please try again.");
    }
  };

  const openPortal = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/subscription/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        alert(data.error || "Please upgrade to a paid plan first, then you can manage billing.");
      }
    } catch (err) {
      alert("Failed to open billing portal.");
    }
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
