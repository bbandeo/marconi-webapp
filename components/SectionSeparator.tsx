"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface SectionSeparatorProps {
  variant?: "gradient" | "wave" | "dots" | "minimal";
  className?: string;
}

export function SectionSeparator({ variant = "gradient", className = "" }: SectionSeparatorProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const renderSeparator = () => {
    switch (variant) {
      case "wave":
        return (
          <div className={`relative h-16 overflow-hidden ${className}`}>
            <motion.div
              ref={ref}
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="h-full w-full bg-gradient-to-r from-transparent via-premium-orange-500 to-transparent origin-left"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={isInView ? { x: "100%" } : { x: "-100%" }}
              transition={{ 
                duration: 2, 
                ease: "easeInOut",
                delay: 0.3,
                repeat: Infinity,
                repeatDelay: 3
              }}
              className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            <svg
              className="absolute bottom-0 w-full h-8"
              viewBox="0 0 1200 60"
              preserveAspectRatio="none"
            >
              <motion.path
                ref={ref}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                d="M0,30 C150,0 350,60 600,30 C850,0 1050,60 1200,30 L1200,60 L0,60 Z"
                fill="url(#wave-gradient)"
                stroke="none"
              />
              <defs>
                <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(249, 115, 22, 0)" />
                  <stop offset="50%" stopColor="rgba(249, 115, 22, 0.8)" />
                  <stop offset="100%" stopColor="rgba(249, 115, 22, 0)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        );

      case "dots":
        return (
          <div className={`flex justify-center items-center py-8 ${className}`}>
            <div className="flex space-x-2">
              {[0, 1, 2, 3, 4].map((index) => (
                <motion.div
                  key={index}
                  ref={index === 2 ? ref : undefined}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                  className={`w-2 h-2 rounded-full ${
                    index === 2 
                      ? "bg-premium-orange-500 w-3 h-3" 
                      : "bg-premium-orange-500/50"
                  }`}
                />
              ))}
            </div>
          </div>
        );

      case "minimal":
        return (
          <div className={`flex justify-center py-6 ${className}`}>
            <motion.div
              ref={ref}
              initial={{ width: 0, opacity: 0 }}
              animate={isInView ? { width: "200px", opacity: 1 } : { width: 0, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-px bg-gradient-to-r from-transparent via-premium-orange-500 to-transparent"
            />
          </div>
        );

      default: // gradient
        return (
          <motion.div
            ref={ref}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-1 bg-gradient-to-r from-transparent via-premium-orange-500 to-transparent origin-center ${className}`}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={isInView ? { x: "100%" } : { x: "-100%" }}
              transition={{ 
                duration: 2, 
                ease: "easeInOut",
                delay: 0.5,
                repeat: Infinity,
                repeatDelay: 4
              }}
              className="h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
            />
          </motion.div>
        );
    }
  };

  return (
    <div className="w-full flex justify-center">
      {renderSeparator()}
    </div>
  );
}