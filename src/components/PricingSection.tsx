"use client";

import { CheckCircle } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started with AI-powered assignments.",
    features: ["Create assignments", "Basic analytics", "Limited submissions (10/month)", "PDF upload"],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Student Pro",
    price: "$9",
    period: "/month",
    description: "For students who want the complete AI learning experience.",
    features: ["Unlimited AI analysis", "Study plans", "Progress tracking", "AI Tutor", "Exam readiness scoring", "Priority support"],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "School",
    price: "$99",
    period: "/month",
    description: "Complete platform for schools and districts.",
    features: ["Unlimited teachers", "Unlimited students", "Class analytics", "Admin dashboard", "LMS integration", "Dedicated support"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Simple, Transparent Pricing</h2>
          <p className="mt-3 text-lg text-gray-500">Choose the plan that fits your needs. No hidden fees.</p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <AnimatedSection key={plan.name} delay={i * 0.15}>
              <div className={`relative rounded-lg p-7 border ${
                plan.highlighted ? "bg-primary text-white border-primary" : "bg-white border-gray-200"
              }`}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-accent text-white text-xs font-semibold">
                    Most Popular
                  </div>
                )}

                <h3 className={`text-sm font-semibold ${plan.highlighted ? "text-primary-light" : "text-gray-800"}`}>
                  {plan.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className={`text-3xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
                  {plan.period && <span className={`text-sm ${plan.highlighted ? "text-primary-light" : "text-gray-400"}`}>{plan.period}</span>}
                </div>
                <p className={`mt-2 text-sm ${plan.highlighted ? "text-primary-light" : "text-gray-500"}`}>{plan.description}</p>

                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle className={`w-4 h-4 shrink-0 ${plan.highlighted ? "text-accent" : "text-primary"}`} />
                      <span className={plan.highlighted ? "text-primary-light" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button className={`mt-8 w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  plan.highlighted ? "bg-white text-primary hover:bg-gray-50" : "bg-primary text-white hover:bg-primary-dark"
                }`}>
                  {plan.cta}
                </button>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
