import { type ReactNode, type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  hoverable?: boolean;
}

const paddingMap = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({ children, className = "", padding = "md", hoverable = true, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl glass-card ${paddingMap[padding]} ${
        hoverable ? "glass-card-hover" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

