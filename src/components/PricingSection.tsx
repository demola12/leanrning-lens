"use client";

import { CheckCircle, Star, Users, Infinity } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const plans = [
  {
    name: "Solo ⭐",
    price: "£5.99",
    period: "/month",
    description: "Perfect for one child. Full access to AI-powered assignments, feedback, and reports.",
    features: [
      "1 student profile",
      "Unlimited assignments",
      "AI feedback",
      "Teacher feedback",
      "Personalized study plan",
      "Progress reports",
      "Assignment history",
      "Multi-teacher support",
      "PDF report export",
    ],
    cta: "Start Free Trial",
    highlighted: false,
    icon: Star,
  },
  {
    name: "Family",
    price: "£10.99",
    period: "/month",
    description: "Up to 3 student profiles. Ideal for families with multiple children.",
    features: [
      "Up to 3 student profiles",
      "Unlimited assignments",
      "AI feedback",
      "Teacher feedback",
      "Personalized study plan",
      "Progress reports",
      "Assignment history",
      "Multi-teacher support",
      "PDF report export",
      "Priority support",
      "Parent dashboard",
      "Family management",
    ],
    cta: "Start Free Trial",
    highlighted: true,
    icon: Users,
  },
  {
    name: "Unlimited",
    price: "£20.99",
    period: "/month",
    description: "Unlimited student profiles. For large families, guardians, or home education groups.",
    features: [
      "Unlimited student profiles",
      "Unlimited assignments",
      "AI feedback",
      "Teacher feedback",
      "Personalized study plan",
      "Progress reports",
      "Assignment history",
      "Multi-teacher support",
      "PDF report export",
      "Priority support",
      "Parent dashboard",
      "Family management",
    ],
    cta: "Start Free Trial",
    highlighted: false,
    icon: Infinity,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Simple, Family-Friendly Pricing</h2>
          <p className="mt-3 text-lg text-gray-500">One subscription works across all connected teachers.</p>
        </AnimatedSection>

        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-sm font-semibold text-primary">
            <CheckCircle className="w-4 h-4" />
            One subscription works across all connected teachers
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <AnimatedSection key={plan.name} delay={i * 0.15}>
                <div className={`relative rounded-lg p-7 border ${
                  plan.highlighted ? "bg-primary text-white border-primary" : "bg-white border-gray-200"
                }`}>
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-accent text-white text-xs font-semibold">
                      Most Popular
                    </div>
                  )}

                  <Icon className={`w-8 h-8 mb-3 ${plan.highlighted ? "text-accent" : "text-primary"}`} />
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
