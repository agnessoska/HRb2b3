import { motion } from "framer-motion";
import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AIBorderProps {
  children: ReactNode;
  className?: string;
}

export const AIBorder: React.FC<AIBorderProps> = ({ children, className }) => {
  return (
    <div className={cn("relative p-[1px] rounded-lg overflow-hidden group", className)}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-70"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ backgroundSize: "200% 200%" }}
      />
      <div className="relative bg-card rounded-[7px] h-full w-full">{children}</div>
    </div>
  );
};