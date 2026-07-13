"use client";

import { motion } from "framer-motion";

const logos = ["Stanford University", "MIT", "Harvard", "Cambridge", "Oxford", "UC Berkeley"];

export default function TrustedBy() {
  return (
    <section className="py-14 border-t border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">Trusted by leading institutions</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {logos.map((name, i) => (
            <motion.span
              key={name}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-base font-bold text-gray-300 tracking-tight"
            >
              {name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
