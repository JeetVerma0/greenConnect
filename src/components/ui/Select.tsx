import { type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = "", id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-wider text-text-secondary/70">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none transition-all duration-300 focus:border-primary/50 focus:bg-[var(--card-hover-bg)] focus:ring-1 focus:ring-primary/20 dark:border-white/10 dark:bg-[#0a0f0d] dark:focus:bg-white/[0.04] [.light_&]:border-border [.light_&]:bg-surface [.light_&]:focus:bg-[var(--card-hover-bg)] ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface dark:bg-[#0a0f0d] [.light_&]:bg-surface text-text-primary">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

