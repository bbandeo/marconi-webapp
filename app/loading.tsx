"use client"

import { motion } from "framer-motion"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[40] flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, filter: "blur(6px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-white/80 tracking-wider"
      >
        Cargando…
      </motion.div>
    </div>
  )
}
