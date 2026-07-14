"use client";

import { Building2 } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="LearnLens" className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-gray-900">LearnLens</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-xs">Turn every assignment into a personalized learning experience powered by AI.</p>
          </div>

          {[
            { title: "Product", links: ["Features", "Pricing", "How It Works", "Integrations"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
            { title: "Support", links: ["Help Center", "Documentation", "API Status", "Contact"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold text-gray-800 mb-3 uppercase tracking-wider">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">&copy; 2026 LearnLens. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Terms of Service</a>
            <div className="flex items-center gap-2">
              {["X", "in", "GH"].map((s) => (
                <span key={s} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 hover:bg-gray-200 transition-colors cursor-pointer">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
