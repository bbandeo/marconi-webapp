"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import Image from "next/image"
import { getOptimizedImageUrl } from "@/lib/cloudinary"

export default function HeroSection() {
  return (
    <section className="relative h-[calc(100vh-5rem)] flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={getOptimizedImageUrl("gustavo-papasergio-emoKYb99CRI-unsplash_w6gipy", {
            width: 1920,
            height: 1080,
            crop: "fill",
            quality: "auto",
            format: "auto",
          }) || "/placeholder.svg"}
          alt="Reconquista - Marconi Inmobiliaria"
          fill
          className="object-cover"
          priority
        />
        {/* Subtle dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Glass morphism blur effects - much softer */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-gray-900/30 via-40% via-gray-900/15 via-60% via-gray-900/5 via-80% to-transparent z-10" />
        
        {/* Bottom glass effect with visible backdrop blur - softened */}
        <div className="absolute bottom-0 left-0 right-0 h-64 z-20">
          <div className="h-full bg-gradient-to-t from-gray-900/70 via-gray-900/45 via-30% via-gray-900/25 via-60% via-gray-900/8 via-85% to-transparent backdrop-blur-xl border-t border-white/5 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-800/30 via-gray-800/10 via-70% to-transparent" />
          </div>
        </div>

        {/* Additional frosted glass panels for modern office look - softened */}
        <div className="absolute bottom-20 left-8 w-32 h-32 bg-white/2 backdrop-blur-md rounded-2xl border border-white/5 z-15 hidden md:block" />
        <div className="absolute bottom-32 right-12 w-24 h-40 bg-white/1 backdrop-blur-md rounded-xl border border-white/3 z-15 hidden lg:block" />
      </div>

      {/* Content */}
      <div className="relative z-30 h-full flex flex-col justify-center items-center px-4">
        <div className="container mx-auto text-center max-w-6xl">
          {/* Main Impactful Text */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="mt-16 md:mt-24"
          >
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="mb-8 md:mb-16 lg:mb-20"
              >
                <Image
                  src="/assets/impact_text/noesperesmas_logo.svg"
                  alt="No esperes más"
                  width={2000}
                  height={500}
                  className="w-full max-w-4xl md:max-w-6xl lg:max-w-8xl xl:max-w-[120rem] h-auto"
                  priority
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="mb-8 md:mb-16 lg:mb-20"
              >
                <Image
                  src="/assets/logos/logocasa.svg"
                  alt="Logo Casa"
                  width={120}
                  height={120}
                  className="w-16 h-16 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Company Branding at Bottom - Minimalist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="mt-auto mb-8 md:mb-12 text-center"
        >
          <div className="text-white">
            <Image
              src="/assets/logos/marconi_title.svg"
              alt="Marconi Inmobiliaria"
              width={400}
              height={120}
              className="h-16 md:h-28 lg:h-36 xl:h-40 w-auto mx-auto mb-4"
            />
          </div>
        </motion.div>

        {/* Scroll Indicator - Minimalist */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          className="hidden md:flex absolute bottom-6 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="flex flex-col items-center text-white/60"
          >
            <div className="w-px h-8 bg-white/30 mb-2"></div>
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}