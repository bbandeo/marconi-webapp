"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";

export interface ScrollAnimationConfig {
  threshold?: number;
  triggerOnce?: boolean;
  margin?: string;
}

export function useScrollAnimation(config: ScrollAnimationConfig = {}) {
  const {
    threshold = 0.1,
    triggerOnce = true,
    margin = "0px"
  } = config;

  const ref = useRef(null);
  const isInView = useInView(ref, {
    threshold,
    once: triggerOnce,
    margin
  });

  // Common animation variants
  const variants = {
    fadeUp: {
      initial: { opacity: 0, y: 60 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, ease: "easeOut" }
    },
    fadeDown: {
      initial: { opacity: 0, y: -60 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, ease: "easeOut" }
    },
    slideLeft: {
      initial: { opacity: 0, x: -100 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.8, ease: "easeOut" }
    },
    slideRight: {
      initial: { opacity: 0, x: 100 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.8, ease: "easeOut" }
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5, ease: "easeOut" }
    },
    stagger: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return {
    ref,
    isInView,
    variants,
    // Helper functions for motion props
    getMotionProps: (variant: keyof typeof variants) => ({
      ref,
      initial: variants[variant].initial,
      animate: isInView ? variants[variant].animate : variants[variant].initial,
      transition: variants[variant].transition
    }),
    // For staggered animations
    getStaggerContainer: (staggerDelay = 0.1) => ({
      ref,
      initial: "initial",
      animate: isInView ? "animate" : "initial",
      variants: {
        initial: {},
        animate: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }
    }),
    getStaggerChild: (variant: keyof typeof variants = "stagger") => ({
      variants: {
        initial: variants[variant].initial,
        animate: variants[variant].animate,
      },
      transition: variants[variant].transition
    })
  };
}