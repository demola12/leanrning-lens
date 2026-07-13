"use client";

import { LayoutDashboard, BookOpen, Calendar, BarChart3, Bot, Settings } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const masteryData = [
  { subject: "Algebra", mastery: 65, color: "bg-primary" },
  { subject: "Geometry", mastery: 88, color: "bg-emerald-500" },
  { subject: "Fractions", mastery: 92, color: "bg-emerald-500" },
  { subject: "Statistics", mastery: 45, color: "bg-amber-500" },
  { subject: "Trigonometry", mastery: 72, color: "bg-primary" },
  { subject: "Calculus", mastery: 30, color: "bg-red-400" },
];

const weekData = [
  { day: "Mon", score: 72 }, { day: "Tue", score: 78 }, { day: "Wed", score: 75 },
  { day: "Thu", score: 85 }, { day: "Fri", score: 88 }, { day: "Sat", score: 82 }, { day: "Sun", score: 92 },
];

export default function DashboardShowcase() {
  return (
    <section className="py-24 bg-gray-50/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Beautiful, Insightful Dashboard</h2>
          <p className="mt-3 text-lg text-gray-500">Everything students and teachers need in one place. Clean and incredibly powerful.</p>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="flex-1 text-center text-xs text-gray-400 font-medium">learnlens.app/dashboard/student</span>
            </div>

            <div className="flex">
              <div className="w-52 shrink-0 bg-gray-50/80 border-r border-gray-100 p-4 hidden lg:block">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center"><img src="/logo.png" alt="" className="w-4 h-4" /></div>
                  <span className="font-bold text-sm text-gray-900">LearnLens</span>
                </div>
                <div className="space-y-0.5">
                  {[{ label: "Dashboard", icon: LayoutDashboard, active: true },
                    { label: "Assignments", icon: BookOpen },
                    { label: "Study Plan", icon: Calendar },
                    { label: "Progress", icon: BarChart3 },
                    { label: "AI Tutor", icon: Bot },
                    { label: "Settings", icon: Settings },
                  ].map((item) => (
                    <div key={item.label} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${item.active ? "bg-primary text-white" : "text-gray-400"}`}>
                      <item.icon className="w-3.5 h-3.5" />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-5 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">A</div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Alex Thompson</h3>
                      <p className="text-xs text-gray-400">Grade 10 • Mathematics</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                    <span className="text-xl font-bold text-emerald-600">92</span>
                    <span className="text-xs text-emerald-600">/100</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="p-4 rounded-lg bg-white border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Subject Mastery</h4>
                    <div className="space-y-2.5">
                      {masteryData.map((s) => (
                        <div key={s.subject}>
                          <div className="flex justify-between text-xs mb-0.5"><span className="text-gray-500">{s.subject}</span><span className="font-semibold text-gray-700">{s.mastery}%</span></div>
                          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden"><div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.mastery}%` }} /></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-white border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">This Week&apos;s Performance</h4>
                    <div className="flex items-end gap-2 h-28">
                      {weekData.map((d) => (
                        <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full rounded-md bg-primary" style={{ height: `${d.score}%` }} />
                          <span className="text-xs text-gray-400">{d.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-primary text-white">
                    <h4 className="text-xs font-medium text-primary-light mb-1">Learning Streak</h4>
                    <div className="text-2xl font-bold">12 days</div>
                    <p className="text-xs text-primary-light mt-0.5">Keep going! You&apos;re on fire.</p>
                  </div>

                  <div className="p-4 rounded-lg bg-white border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Weak Topics</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {["Algebra", "Statistics", "Calculus"].map((t) => (
                        <span key={t} className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-100 text-xs font-medium text-amber-600">{t}</span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-white border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Next Recommendations</h4>
                    <div className="space-y-1.5">
                      {["Linear Equations Review", "Practice Quiz - Algebra", "Watch: Polynomials"].map((r) => (
                        <div key={r} className="flex items-center gap-2 text-xs text-gray-500"><div className="w-1 h-1 rounded-full bg-accent" />{r}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
