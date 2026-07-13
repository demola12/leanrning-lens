"use client";

import Button from "./Button";
import AnimatedSection from "./AnimatedSection";

export default function CTASection() {
  return (
    <section className="py-24">
      <AnimatedSection>
        <div className="mx-6 max-w-6xl mx-auto rounded-lg bg-primary border border-primary-dark overflow-hidden">
          <div className="px-8 py-20 md:py-24 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Study Smarter, Not Harder</h2>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
              Turn every assignment into a personalized learning experience powered by AI. Join thousands of students and teachers already on LearnLens.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="!bg-white !text-primary hover:!bg-gray-50">Get Started Free</Button>
              <Button size="lg" className="!border-white/30 !text-white hover:!bg-white/10">Book a Demo</Button>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
