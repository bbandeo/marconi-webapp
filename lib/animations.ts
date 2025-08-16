/**
 * Refined Animation System
 * Following minimalist design principles with consistent timing and accessibility
 */

// Animation constants following UI/UX guidelines
export const ANIMATION_DURATION = 300; // 300ms for all transitions
export const ANIMATION_EASING = "ease-out"; // Natural feeling easing

// Framer Motion variants for essential animations only
export const motionVariants = {
  // Simple fade in for page entry
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: ANIMATION_DURATION / 1000, ease: "easeOut" }
  },

  // Subtle slide up for content sections
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: ANIMATION_DURATION / 1000, ease: "easeOut" }
  },

  // Stagger container for lists
  staggerContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  },

  // Stagger items
  staggerItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: ANIMATION_DURATION / 1000, ease: "easeOut" }
  }
};

// CSS class utilities for consistent transitions
export const transitionClasses = {
  // Standard transition for most elements
  default: "transition-all duration-300 ease-out",
  
  // Color-only transitions for text/background changes
  colors: "transition-colors duration-300 ease-out",
  
  // Opacity-only transitions
  opacity: "transition-opacity duration-300 ease-out",
  
  // Transform-only transitions (use sparingly)
  transform: "transition-transform duration-300 ease-out"
};

// Hover effect classes - subtle and refined
export const hoverEffects = {
  // Subtle opacity change for buttons and interactive elements
  subtle: "hover:opacity-80 transition-opacity duration-300 ease-out",
  
  // Text color change for links
  textColor: "hover:text-orange-400 transition-colors duration-300 ease-out",
  
  // Background color change for cards
  background: "hover:bg-gray-800/60 transition-colors duration-300 ease-out",
  
  // Border color change
  border: "hover:border-orange-500/50 transition-colors duration-300 ease-out",
  
  // Minimal scale for important CTAs only
  scaleMinimal: "hover:scale-[1.02] transition-transform duration-300 ease-out"
};

// Loading state animations
export const loadingStates = {
  // Elegant pulse for loading elements
  pulse: "animate-pulse",
  
  // Spinning indicator
  spin: "animate-spin",
  
  // Custom shimmer effect using CSS
  shimmer: "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent"
};

// Scroll behavior utilities
export const scrollBehavior = {
  smooth: "scroll-smooth",
  auto: "scroll-auto"
};

// Media query for reduced motion accessibility
export const reduceMotionClasses = {
  respectMotion: "motion-reduce:transition-none motion-reduce:animate-none"
};

// Combined utility function for creating accessible animations
export function createAccessibleTransition(baseClasses: string): string {
  return `${baseClasses} ${reduceMotionClasses.respectMotion}`;
}

// Preset combinations for common use cases
export const presets = {
  // For property cards
  propertyCard: createAccessibleTransition(
    `${transitionClasses.colors} ${hoverEffects.background} ${hoverEffects.border}`
  ),
  
  // For buttons
  button: createAccessibleTransition(
    `${transitionClasses.colors} ${hoverEffects.subtle}`
  ),
  
  // For navigation links
  navLink: createAccessibleTransition(
    `${transitionClasses.colors} ${hoverEffects.textColor}`
  ),
  
  // For hero content
  heroContent: createAccessibleTransition(transitionClasses.opacity),
  
  // For loading elements
  loading: createAccessibleTransition(
    `${transitionClasses.opacity} ${loadingStates.pulse}`
  )
};

// Utility function to check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Motion configuration for Framer Motion that respects accessibility
export const motionConfig = {
  initial: "initial",
  animate: "animate",
  exit: "exit",
  // Disable animations if user prefers reduced motion
  transition: prefersReducedMotion() ? { duration: 0 } : undefined
};