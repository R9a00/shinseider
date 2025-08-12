// Callout.jsx
import { Info, CheckCircle2, AlertTriangle, BookOpen } from "lucide-react";

const styles = {
  info:   "border-sky-500/30 bg-sky-50 text-sky-900",
  success:"border-emerald-500/30 bg-emerald-50 text-emerald-900",
  warning:"border-amber-500/30 bg-amber-50 text-amber-900",
  expert: "border-indigo-500/30 bg-indigo-50 text-indigo-900",
};

const icons = {
  info: Info, 
  success: CheckCircle2, 
  warning: AlertTriangle, 
  expert: BookOpen,
};

export default function Callout({ variant = "info", title, children }) {
  const Icon = icons[variant] || Info;
  
  return (
    <div className={`rounded-2xl border p-4 md:p-5 ${styles[variant]}`}>
      <div className="flex items-start gap-3">
        <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/60">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          {title && (
            <h3 className="mb-1 font-semibold tracking-tight">
              {title}
            </h3>
          )}
          <div className="prose prose-sm max-w-none leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}