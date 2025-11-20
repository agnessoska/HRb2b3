import { cn } from "@/lib/utils";
import React, { type ReactNode } from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  variant?: "default" | "hover";
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = "default",
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative rounded-xl border bg-card/30 text-card-foreground backdrop-blur-xl shadow-sm transition-all duration-300",
        "before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-white/5 before:to-white/0 before:rounded-xl",
        "after:absolute after:inset-0 after:-z-20 after:bg-noise after:opacity-5",
        variant === "hover" && "hover:bg-card/40 hover:shadow-lg hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};