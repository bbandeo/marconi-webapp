import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export type SectionDividerProps = {
  variant?: "wave" | "angled" | "curve" | "floriana" | "organic"
  flip?: boolean
  className?: string
}

export function SectionDivider({ variant = "wave", flip = false, className }: SectionDividerProps) {
  if (variant === "floriana") {
    return (
      <div className={cn("relative w-full overflow-hidden", className)}>
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-animated opacity-60" />
        
        {/* Main wave with Floriana colors */}
        <motion.svg
          initial={{ y: flip ? -12 : 12, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          preserveAspectRatio="none"
          viewBox="0 0 1440 120"
          className={cn("block w-full h-[60px] md:h-[100px] relative z-10", flip && "rotate-180")}
        >
          {/* Multiple wave layers for depth */}
          <motion.path 
            d="M0,0 C120,80 240,-80 360,40 C480,160 600,-80 720,40 C840,160 960,-80 1080,40 C1200,160 1320,-80 1440,40 L1440,120 L0,120 Z" 
            className="fill-floriana-orange-600/40"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <motion.path 
            d="M0,20 C150,100 300,-60 450,60 C600,180 750,-60 900,60 C1050,180 1200,-60 1440,60 L1440,120 L0,120 Z" 
            className="fill-floriana-coral/50"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 2.5, delay: 0.3, ease: "easeInOut" }}
          />
          <motion.path 
            d="M0,40 C180,120 360,-40 540,80 C720,200 900,-40 1080,80 C1260,200 1350,-40 1440,80 L1440,120 L0,120 Z" 
            className="fill-floriana-peach/60"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 3, delay: 0.6, ease: "easeInOut" }}
          />
        </motion.svg>
        
        {/* Shimmer effect */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shine" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-floriana-amber/70 to-transparent animate-shine" style={{ animationDelay: '1.5s' }} />
        
        {/* Floating decorative elements */}
        <div className="absolute top-1/2 left-1/4 w-4 h-4 rounded-full bg-white/40 animate-float" />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full bg-floriana-amber/60 animate-float-slow" />
        <div className="absolute bottom-1/4 left-2/3 w-2 h-2 rounded-full bg-floriana-coral/50 animate-bounce-slow" />
      </div>
    )
  }

  if (variant === "organic") {
    return (
      <div className={cn("relative w-full overflow-hidden", className)}>
        <motion.svg
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          preserveAspectRatio="none"
          viewBox="0 0 1440 160"
          className={cn("block w-full h-[80px] md:h-[120px]", flip && "rotate-180")}
        >
          {/* Organic flowing shapes */}
          <motion.path 
            d="M0,50 Q240,10 360,80 T720,60 Q960,20 1200,90 T1440,70 L1440,160 L0,160 Z" 
            className="fill-floriana-orange-500/30"
            initial={{ pathLength: 0, fill: "rgba(249, 115, 22, 0)" }}
            whileInView={{ pathLength: 1, fill: "rgba(249, 115, 22, 0.3)" }}
            transition={{ duration: 2 }}
          />
          <motion.path 
            d="M0,80 Q180,40 300,110 T600,90 Q840,50 1080,120 T1440,100 L1440,160 L0,160 Z" 
            className="fill-floriana-coral/40"
            initial={{ pathLength: 0, fill: "rgba(255, 120, 73, 0)" }}
            whileInView={{ pathLength: 1, fill: "rgba(255, 120, 73, 0.4)" }}
            transition={{ duration: 2.5, delay: 0.5 }}
          />
        </motion.svg>
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 pattern-organic opacity-20" />
      </div>
    )
  }

  if (variant === "wave") {
    return (
      <div className={cn("relative w-full overflow-hidden", className)}>
        <motion.svg
          initial={{ y: flip ? -8 : 8, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
          className={cn("block w-full h-[40px] md:h-[72px]", flip && "rotate-180")}
        >
          <path d="M0,0 C150,100 350,-100 600,0 C850,100 1050,-100 1200,0 L1200 120 L0 120 Z" className="fill-floriana-orange-500/30" />
          <path d="M0,0 C200,100 400,-50 600,0 C800,50 1000,-50 1200,0 L1200 120 L0 120 Z" className="fill-floriana-coral/40" />
        </motion.svg>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-floriana-orange-400/70 to-transparent" />
      </div>
    )
  }

  if (variant === "curve") {
    return (
      <div className={cn("relative w-full overflow-hidden", className)}>
        <motion.svg
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          preserveAspectRatio="none"
          viewBox="0 0 1440 90"
          className={cn("block w-full h-[48px] md:h-[80px]", flip && "rotate-180")}
        >
          <path d="M0,64L48,53.3C96,43,192,21,288,21.3C384,21,480,43,576,53.3C672,64,768,64,864,53.3C960,43,1056,21,1152,21.3C1248,21,1344,43,1392,53.3L1440,64L1440,90L1392,90C1344,90,1248,90,1152,90C1056,90,960,90,864,90C768,90,672,90,576,90C480,90,384,90,288,90C192,90,96,90,48,90L0,90Z" className="fill-floriana-orange-500/30" />
        </motion.svg>
      </div>
    )
  }

  // angled
  return (
    <div className={cn("relative w-full", className)}>
      <div
        className={cn("h-10 md:h-16 w-full bg-floriana-secondary", flip && "rotate-180")}
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 100%)" }}
      />
    </div>
  )
}

export default SectionDivider