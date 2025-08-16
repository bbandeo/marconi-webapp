import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export type SectionDividerProps = {
  variant?: "wave" | "angled" | "curve"
  flip?: boolean
  className?: string
}

export function SectionDivider({ variant = "wave", flip = false, className }: SectionDividerProps) {
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
          <path d="M0,0 C150,100 350,-100 600,0 C850,100 1050,-100 1200,0 L1200 120 L0 120 Z" className="fill-orange-500/30" />
          <path d="M0,0 C200,100 400,-50 600,0 C800,50 1000,-50 1200,0 L1200 120 L0 120 Z" className="fill-orange-500/40" />
        </motion.svg>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/70 to-transparent" />
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
          <path d="M0,64L48,53.3C96,43,192,21,288,21.3C384,21,480,43,576,53.3C672,64,768,64,864,53.3C960,43,1056,21,1152,21.3C1248,21,1344,43,1392,53.3L1440,64L1440,90L1392,90C1344,90,1248,90,1152,90C1056,90,960,90,864,90C768,90,672,90,576,90C480,90,384,90,288,90C192,90,96,90,48,90L0,90Z" className="fill-orange-500/30" />
        </motion.svg>
      </div>
    )
  }

  // angled
  return (
    <div className={cn("relative w-full", className)}>
      <div
        className={cn("h-10 md:h-16 w-full bg-gradient-to-r from-orange-600/70 to-orange-500/50", flip && "rotate-180")}
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 100%)" }}
      />
    </div>
  )
}

export default SectionDivider