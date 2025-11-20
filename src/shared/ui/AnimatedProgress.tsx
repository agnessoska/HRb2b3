import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedProgressProps {
  value: number; // 0 to 100
  className?: string;
  colorClass?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  className,
  colorClass = "bg-primary",
  height = 8,
  showLabel = false,
  label,
}) => {
  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between mb-1 text-xs font-medium text-muted-foreground">
          <span>{label}</span>
          <span>{Math.round(value)}%</span>
        </div>
      )}
      <div
        className="w-full bg-secondary rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          className={cn("h-full rounded-full", colorClass)}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </div>
    </div>
  );
};