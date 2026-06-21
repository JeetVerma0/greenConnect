import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary: "bg-primary text-black font-semibold border border-transparent hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_0_16px_rgba(16,185,129,0.06)] hover:bg-primary-dark transition-all duration-200",
  secondary: "bg-card-opacity-bg border border-border text-text-primary hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_0_16px_rgba(16,185,129,0.06)] hover:bg-card-hover-bg transition-all duration-200",
  ghost: "text-text-secondary border border-transparent hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_0_16px_rgba(16,185,129,0.06)] hover:bg-card-opacity-bg hover:text-text-primary transition-all duration-200",
  danger: "bg-danger text-white font-medium border border-transparent hover:-translate-y-0.5 hover:border-danger/40 hover:shadow-[0_0_0_1px_rgba(239,68,68,0.12),0_0_16px_rgba(239,68,68,0.06)] hover:bg-red-600 transition-all duration-200",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-5 py-2.5 text-base rounded-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}


