import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AIStreamingTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  isStreaming?: boolean;
}

export const AIStreamingText: React.FC<AIStreamingTextProps> = ({
  text,
  speed = 30,
  onComplete,
  isStreaming = true,
}) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(text);
      onComplete?.();
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, isStreaming, onComplete]);

  return (
    <div className="relative">
      <motion.span>{displayedText}</motion.span>
      {displayedText.length < text.length && isStreaming && (
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-[2px] h-[1em] bg-primary ml-1 align-middle"
        />
      )}
      {isStreaming && (
        <motion.div
          className="absolute -top-4 -right-4 text-indigo-500"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Sparkles size={16} />
        </motion.div>
      )}
    </div>
  );
};