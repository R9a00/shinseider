// SimpleDetailedToggle.jsx
import { useEffect, useState } from "react";

const KEY = "kb_view_pref"; // "simple" | "detailed"

export default function SimpleDetailedToggle({ onChange }) {
  const [mode, setMode] = useState("simple");
  
  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved && (saved === "simple" || saved === "detailed")) {
      setMode(saved);
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem(KEY, mode);
    onChange?.(mode);
  }, [mode, onChange]);

  const handleKeyDown = (e, value) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setMode(value);
    }
  };

  const base = "flex-1 px-3 py-2 text-sm md:text-base font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2";
  
  return (
    <div 
      role="tablist" 
      aria-label="表示モード" 
      className="inline-flex rounded-xl bg-emerald-100 p-1 shadow-inner"
    >
      {[
        { value: "simple", label: "🌱 Simple（5分）" },
        { value: "detailed", label: "🎓 Detailed（専門）" }
      ].map(({ value, label }) => (
        <button
          key={value}
          role="tab"
          aria-selected={mode === value}
          tabIndex={mode === value ? 0 : -1}
          onClick={() => setMode(value)}
          onKeyDown={(e) => handleKeyDown(e, value)}
          className={`${base} ${
            mode === value 
              ? "bg-white shadow text-emerald-800" 
              : "text-emerald-700 hover:text-emerald-800 hover:bg-white/50"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}