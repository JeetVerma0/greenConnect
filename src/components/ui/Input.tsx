import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-text-secondary/70">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none transition-all duration-300 focus:border-primary/50 focus:bg-white/[0.04] focus:ring-1 focus:ring-primary/20 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger font-medium mt-0.5">{error}</p>}
    </div>
  );
}

