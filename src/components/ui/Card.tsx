import { type ReactNode, type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({ children, className = "", padding = "md", ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-card ${paddingMap[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
