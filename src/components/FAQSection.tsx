"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

const faqs = [
  { question: "Can I upload PDFs?", answer: "Yes! You can upload any PDF — worksheets, textbook pages, exam papers — and our AI will automatically extract questions and create an interactive assignment." },
  { question: "Does AI grade written answers?", answer: "Our AI can grade multiple-choice, short answer, and even essay-style responses. It analyzes content, structure, and key concepts to provide accurate, constructive feedback." },
  { question: "Can teachers use existing worksheets?", answer: "Absolutely. Upload any existing worksheet as a PDF or image, and LearnLens will digitize it into an interactive assignment with automatic grading." },
  { question: "Do students need an account?", answer: "Yes, students need a free account to access assignments, receive AI feedback, and track their progress. Sign-up takes less than a minute." },
  { question: "How accurate is the AI analysis?", answer: "Our AI achieves over 95% accuracy on standard assignment grading and analysis. It continuously improves through feedback from thousands of educators." },
  { question: "What subjects are supported?", answer: "LearnLens supports Math, Science, English, History, and most other subjects. Our AI adapts to different question types and subject-specific requirements." },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24">
      <div className="max-w-3xl mx-auto px-6">
        <AnimatedSection className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Frequently Asked Questions</h2>
        </AnimatedSection>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <AnimatedSection key={faq.question} delay={i * 0.05}>
              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                  <span className="font-semibold text-sm text-gray-900">{faq.question}</span>
                  <motion.div animate={{ rotate: openIndex === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
