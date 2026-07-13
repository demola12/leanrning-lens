"use client";

import { BrainCircuit, Lightbulb, Clock, TrendingUp, Target } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const testimonials = [
  { name: "Sarah Chen", role: "Student, Grade 11", quote: "LearnLens helped me understand exactly where I was going wrong. My grades went from B to A in just one term.", avatar: "SC" },
  { name: "Marcus Johnson", role: "Student, University", quote: "The study plans are incredible. I finally know what to focus on instead of wasting hours on topics I already know.", avatar: "MJ" },
  { name: "Emily Rodriguez", role: "Teacher, High School", quote: "I save at least 5 hours a week on grading. The AI insights show me exactly which students need help and where.", avatar: "ER" },
  { name: "David Kim", role: "Teacher, Middle School", quote: "The personalized feedback for each student is a game-changer. Every student feels like they have a personal tutor.", avatar: "DK" },
];

const studentBenefits = [
  { icon: BrainCircuit, title: "Understand Your Mistakes", description: "Instead of memorizing answers, learn why you got it wrong." },
  { icon: TrendingUp, title: "Track Your Progress", description: "See how you improve over time with detailed analytics." },
  { icon: Target, title: "Know What to Study", description: "AI identifies your weak areas and tells you exactly what to focus on." },
];

const teacherBenefits = [
  { icon: Clock, title: "Save Hours Creating Assignments", description: "Upload any PDF and let AI create interactive assignments automatically." },
  { icon: BrainCircuit, title: "AI-Powered Grading Support", description: "Reduce grading time while maintaining quality feedback." },
  { icon: Lightbulb, title: "Understand Every Student", description: "See learning gaps across your entire class instantly." },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900">Why Students Love LearnLens</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {studentBenefits.map((b, i) => (
              <AnimatedSection key={b.title} delay={i * 0.1}>
                <div className="p-6 rounded-lg border border-gray-200 bg-white">
                  <b.icon className="w-5 h-5 text-primary mb-3" />
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">{b.title}</h3>
                  <p className="text-sm text-gray-500">{b.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900">Why Teachers Love LearnLens</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {teacherBenefits.map((b, i) => (
              <AnimatedSection key={b.title} delay={i * 0.1}>
                <div className="p-6 rounded-lg border border-gray-200 bg-white">
                  <b.icon className="w-5 h-5 text-primary mb-3" />
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">{b.title}</h3>
                  <p className="text-sm text-gray-500">{b.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900">What Our Users Say</h2>
            <p className="mt-2 text-base text-gray-500">Join thousands of students and teachers already using LearnLens.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 0.1}>
                <div className="p-5 rounded-lg border border-gray-200 bg-white h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">{t.avatar}</div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{t.name}</div>
                      <div className="text-xs text-gray-400">{t.role}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
