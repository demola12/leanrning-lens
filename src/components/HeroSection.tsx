"use client";

import { motion } from "framer-motion";
import {
  Upload,
  CheckCircle,
  BarChart3,
  Sparkles,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import Button from "./Button";

export default function HeroSection() {
  return (
    <section className="pt-32 pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 text-sm mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            AI-Powered Education Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight"
          >
            Turn Every Assignment Into{" "}
            <span className="text-primary">Personalized Learning</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed"
          >
            Teachers create assignments in minutes. Students receive AI-powered
            feedback, discover their strengths and weaknesses, and get a
            personalized study plan after every submission.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" variant="primary">
              Start Learning Free
            </Button>
            <Button size="lg" variant="secondary">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              Watch Demo
            </Button>
          </motion.div>
        </div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative mt-20 mx-auto max-w-5xl"
        >
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="flex-1 text-center text-xs text-gray-400 font-medium">learnlens.app/dashboard</span>
            </div>

            <div className="p-5">
              <div className="flex gap-5">
                {/* Sidebar */}
                <div className="w-44 shrink-0 hidden lg:block">
                  <div className="space-y-0.5">
                    {["Dashboard", "Assignments", "Study Plan", "Progress", "AI Tutor", "Settings"].map((item, i) => (
                      <div key={item} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${i === 0 ? "bg-primary text-white" : "text-gray-400"}`}>{item}</div>
                    ))}
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">Welcome back, Alex</h3>
                      <p className="text-xs text-gray-400">Mathematics • Grade 10</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold text-emerald-700">AI Analysis Ready</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-4 rounded-lg bg-primary text-white">
                      <div className="text-xs font-medium text-primary-light">Overall Score</div>
                      <div className="text-2xl font-bold mt-1">92%</div>
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-primary-light">
                        <TrendingUp className="w-3 h-3" />+8% this month
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Strengths</div>
                      <div className="mt-2.5 space-y-2">
                        {[{ label: "Fractions", score: 5 }, { label: "Geometry", score: 4 }].map((s) => (
                          <div key={s.label}>
                            <div className="flex justify-between text-xs"><span className="text-gray-600">{s.label}</span><span className="text-gray-300">{"★".repeat(s.score)}{"☆".repeat(5 - s.score)}</span></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Needs Improvement</div>
                      <div className="mt-2.5">
                        <div className="flex justify-between text-xs"><span className="text-gray-600">Algebra</span><span className="text-amber-500">★★☆☆☆</span></div>
                        <div className="mt-1 h-1.5 rounded-full bg-gray-200 overflow-hidden"><div className="h-full w-[35%] rounded-full bg-amber-400" /></div>
                        <div className="text-xs text-gray-400 mt-1.5"><span className="text-amber-500 font-semibold">Weak Topic Detected</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-gray-600">Recommended Next Topics</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {["Linear Equations", "Quadratic Functions", "Polynomials"].map((t) => (
                          <span key={t} className="px-2.5 py-1 rounded-md bg-white text-xs font-medium text-primary border border-primary/10">{t}</span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center"><Upload className="w-4 h-4 text-accent" /></div>
                        <div><div className="text-sm font-semibold text-gray-700">Assignment Upload</div><div className="text-xs text-gray-400">Drag & drop PDF here</div></div>
                      </div>
                      <div className="px-3 py-1.5 bg-accent text-white text-xs font-semibold rounded-lg">Upload</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
