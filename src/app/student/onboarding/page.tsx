"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/useSubscription";
import {
  Star,
  Users,
  Crown,
  Loader2,
  CheckCircle2,
  ArrowRight,
  X,
} from "lucide-react";

const plans = [
  {
    id: "solo",
    name: "Solo ⭐",
    price: "£5.99",
    period: "/month",
    desc: "Perfect for one child",
    icon: Star,
    color: "text-blue-500",
    features: ["1 student profile", "Unlimited assignments", "AI feedback", "Progress reports", "Multi-teacher support", "PDF report export"],
  },
  {
    id: "family",
    name: "Family",
    price: "£10.99",
    period: "/month",
    desc: "Up to 3 children",
    icon: Users,
    color: "text-primary",
    features: ["Up to 3 student profiles", "Unlimited assignments", "AI feedback", "Parent dashboard", "Family management", "Priority support"],
    popular: true,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price: "£20.99",
    period: "/month",
    desc: "Unlimited children",
    icon: Crown,
    color: "text-amber-500",
    features: ["Unlimited student profiles", "Everything in Family", "Priority support"],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { subscription, loading: subLoading, createCheckoutSession } = useSubscription();
  const [selected, setSelected] = useState("solo");
  const [redirecting, setRedirecting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const hasSessionId = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("session_id");

  useEffect(() => {
    if (subLoading) return;
    if (syncing) return;
    if (hasSessionId) return;
    if (subscription && subscription.plan !== "free") {
      router.replace("/student");
    }
  }, [subLoading, subscription, router, syncing, hasSessionId]);

  useEffect(() => {
    if (!hasSessionId) return;
    setSyncing(true);
    const check = () => {
      fetch(`/api/subscription/status?user_id=${user?.id}`)
        .then((r) => r.json())
        .then((sub) => {
          if (sub && sub.plan !== "free") {
            window.history.replaceState({}, "", "/student/onboarding");
            router.replace("/student");
          } else {
            setTimeout(check, 1500);
          }
        })
        .catch(() => setTimeout(check, 1500));
    };
    setTimeout(check, 2000);
  }, [hasSessionId, user, router]);

  const handleSubscribe = async () => {
    setRedirecting(true);
    await createCheckoutSession(selected);
  };

  const handleSkip = () => {
    router.replace("/student");
  };

  if (subLoading || syncing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">
            {syncing ? "Completing your subscription..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Choose your plan</h1>
          <p className="mt-2 text-gray-500">Pick a plan that fits your family. You can change or cancel anytime.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm text-primary font-semibold mb-6">
            <CheckCircle2 className="w-4 h-4" />
            One subscription works across all connected teachers
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selected === plan.id;
              return (
                <button
                  key={plan.id}
                  onClick={() => setSelected(plan.id)}
                  className={`relative text-left p-5 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-white text-xs font-semibold whitespace-nowrap">
                      Most Popular
                    </div>
                  )}
                  <Icon className={`w-8 h-8 ${plan.color} mb-3`} />
                  <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-1 flex items-baseline gap-0.5">
                    <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-sm text-gray-400">{plan.period}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{plan.desc}</p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <button
              onClick={handleSubscribe}
              disabled={redirecting}
              className="flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all shadow-sm disabled:opacity-60"
            >
              {redirecting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Subscribe to {plans.find((p) => p.id === selected)?.name}
              {!redirecting && <ArrowRight className="w-4 h-4" />}
            </button>
            <button
              onClick={handleSkip}
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Skip for now
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">You&apos;ll only be charged at the end of the month. Cancel anytime — no charges if you cancel before the billing date.</p>
        </div>
      </div>
    </div>
  );
}
