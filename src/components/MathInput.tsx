"use client";

import { useRef, useEffect, useState } from "react";

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  variant?: "title" | "option";
}

export default function MathInput({ value, onChange, placeholder, className = "", variant = "title" }: MathInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showMath, setShowMath] = useState(false);

  useEffect(() => {
    if (!showMath || !containerRef.current) return;

    containerRef.current.innerHTML = `<math-field style="width:100%;min-height:${variant === "title" ? "40px" : "36px"};border:none;outline:none;background:transparent;font-size:${variant === "title" ? "18px" : "14px"};padding:${variant === "title" ? "0 0 8px 0" : "8px 12px"};border-radius:8px">${value}</math-field>`;

    const mf = containerRef.current.querySelector("math-field") as any;
    if (!mf) return;

    mf.addEventListener("input", () => onChange(mf.value));
    mf.addEventListener("blur", () => onChange(mf.value));
    mf.focus();

    return () => {
      if (mf) {
        onChange(mf.value);
      }
    };
  }, [showMath]);

  if (showMath) {
    return (
      <div className="relative flex items-start">
        <div
          ref={containerRef}
          className={`flex-1 ${className}`}
          style={{ border: "none", outline: "none" }}
        />
        <button
          type="button"
          onClick={() => setShowMath(false)}
          className="ml-1 mt-1.5 p-1.5 rounded text-gray-400 hover:text-primary hover:bg-primary/5 transition-all text-xs font-mono shrink-0"
        >
          Tx
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex items-start">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${baseStyles(variant)} ${className}`}
      />
      <button
        type="button"
        onClick={() => setShowMath(true)}
        title="Insert math (LaTeX)"
        className="ml-1 mt-1 p-1.5 rounded text-gray-400 hover:text-primary hover:bg-primary/5 transition-all text-xs font-mono shrink-0"
      >
        Σ
      </button>
    </div>
  );
}

function baseStyles(variant: string) {
  if (variant === "title") {
    return "w-full text-lg font-semibold bg-transparent border-0 border-b-2 border-gray-100 focus:border-primary focus:ring-0 pb-2 text-gray-900 placeholder-gray-300 outline-none transition-colors";
  }
  return "flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
}
