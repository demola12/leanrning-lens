"use client";

import { motion } from "framer-motion";
import { Upload, Link2, Monitor, BarChart3 } from "lucide-react";
import AnimatedSection from "./AnimatedSection";


const steps = [
  { number: "01", title: "Upload", description: "Teacher uploads a PDF or creates an assignment manually in seconds.", icon: Upload },
  { number: "02", title: "Assign", description: "Generate a shareable link and send it to your students instantly.", icon: Link2 },
  { number: "03", title: "Complete", description: "Students complete the assignment online from any device.", icon: Monitor },
  { number: "04", title: "AI Analysis", description: "The platform automatically analyzes answers and builds a personalized learning profile.", icon: BarChart3 },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">From PDF to Insights in Minutes</h2>
          <p className="mt-3 text-lg text-gray-500">A simple four-step process that transforms how teachers and students interact with assignments.</p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <AnimatedSection key={step.number} delay={i * 0.15}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">Step {step.number}</span>
                <h3 className="text-lg font-bold text-gray-900 mb-1.5">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
