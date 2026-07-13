"use client";

import { FileText, Brain, Calendar, TrendingUp, CheckCircle, Sparkles, Target } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const features = [
  {
    title: "AI Assignment Creation",
    description: "Upload any worksheet, textbook page, or exam PDF. AI extracts questions and creates an interactive assignment automatically.",
    icon: FileText,
    image: (
      <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <span className="font-semibold text-gray-900 text-sm">math_homework.pdf</span>
        </div>
        <div className="space-y-2">
          <div className="h-2 w-3/4 rounded bg-gray-100" />
          <div className="h-2 w-1/2 rounded bg-gray-100" />
          <div className="h-2 w-5/6 rounded bg-gray-100" />
        </div>
        <div className="mt-4 flex gap-2">
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" />12 Questions Extracted</span>
          <span className="px-2.5 py-1 rounded-md bg-primary/5 border border-primary/10 text-xs font-semibold text-primary flex items-center gap-1"><Sparkles className="w-3 h-3" />AI Ready</span>
        </div>
      </div>
    ),
  },
  {
    title: "Personalized Learning Analysis",
    description: "Instead of just giving a score, AI identifies strengths, weaknesses, learning gaps, confidence level, and recommended revision topics.",
    icon: Brain,
    reverse: true,
    image: (
      <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Analysis</span>
          <span className="text-xl font-bold text-primary">92%</span>
        </div>
        {[{ label: "Fractions", score: 5 }, { label: "Geometry", score: 4 }, { label: "Algebra", score: 2 }].map((s) => (
          <div key={s.label}>
            <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">{s.label}</span><span className="text-gray-300">{"★".repeat(s.score)}{"☆".repeat(5 - s.score)}</span></div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${(s.score / 5) * 100}%` }} /></div>
          </div>
        ))}
        <div className="pt-2 border-t border-gray-100 text-xs text-amber-600 font-semibold flex items-center gap-1"><Target className="w-3 h-3" />Learning Gap: Algebra requires attention</div>
      </div>
    ),
  },
  {
    title: "Study Plan Generator",
    description: "After every assignment, AI creates weekly study goals, practice questions, a revision roadmap, and estimated exam readiness.",
    icon: Calendar,
    image: (
      <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3"><Calendar className="w-4 h-4 text-accent" /><span className="font-semibold text-gray-900 text-sm">Weekly Study Plan</span></div>
        <div className="space-y-1.5">
          {["Mon: Linear Equations", "Wed: Quadratic Functions", "Fri: Polynomials"].map((d) => (
            <div key={d} className="flex items-center gap-2.5 p-2 rounded-md bg-gray-50"><div className="w-1.5 h-1.5 rounded-full bg-accent" /><span className="text-xs text-gray-600">{d}</span></div>
          ))}
        </div>
        <div className="mt-3 px-3 py-2 rounded-md bg-cyan-50 border border-cyan-100 text-xs"><span className="font-semibold text-accent">Exam Readiness:</span> <span className="text-gray-500">75% — On track</span></div>
      </div>
    ),
  },
  {
    title: "Progress Tracking",
    description: "Beautiful charts showing improvement over time. Track skill mastery, learning streaks, and subject progress with detailed analytics.",
    icon: TrendingUp,
    reverse: true,
    image: (
      <div className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
        <span className="text-sm font-semibold text-gray-700 block mb-3">Progress Overview</span>
        {[{ label: "Algebra", pct: 65 }, { label: "Geometry", pct: 88 }, { label: "Fractions", pct: 92 }, { label: "Statistics", pct: 45 }].map((s) => (
          <div key={s.label} className="mb-2.5">
            <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">{s.label}</span><span className="font-semibold text-gray-700">{s.pct}%</span></div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${s.pct}%` }} /></div>
          </div>
        ))}
      </div>
    ),
  },
];

export default function FeatureSection() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Everything You Need to Teach Smarter</h2>
          <p className="mt-3 text-lg text-gray-500">Powerful AI tools that save teachers hours while giving students the personalized attention they deserve.</p>
        </AnimatedSection>

        <div className="space-y-20">
          {features.map((feature, i) => (
            <AnimatedSection key={feature.title} delay={i * 0.1}>
              <div className={`flex flex-col ${feature.reverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-10 lg:gap-16`}>
                <div className="flex-1">
                  <feature.icon className="w-6 h-6 text-primary mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-base text-gray-500 leading-relaxed">{feature.description}</p>
                  <ul className="mt-5 space-y-2.5">
                    {(feature.title === "Personalized Learning Analysis"
                      ? ["Identifies strengths and weaknesses", "Detects learning gaps", "Measures confidence level", "Recommends revision topics"]
                      : feature.title === "Study Plan Generator"
                      ? ["Weekly study goals", "Practice questions", "Revision roadmap", "Estimated exam readiness"]
                      : feature.title === "Progress Tracking"
                      ? ["Line charts and radar charts", "Skill heatmap", "Subject mastery tracking", "Learning streak analytics"]
                      : ["Extracts questions from PDFs", "Creates interactive assignments", "Auto-grading support", "Custom question editing"]
                    ).map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 w-full max-w-md">{feature.image}</div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
