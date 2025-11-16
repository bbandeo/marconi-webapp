"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"

interface HeroProps {
  backgroundImage: string
  alt: string
  title: string | ReactNode
  description: string
  showCounter?: boolean
  counterText?: string
  counterValue?: number
  withAnimation?: boolean
  imageClassName?: string
  children?: ReactNode
  ctaText?: string
  ctaAction?: () => void
  ctaIcon?: ReactNode
}

export default function Hero({
  backgroundImage,
  alt,
  title,
  description,
  showCounter = false,
  counterText,
  counterValue,
  withAnimation = false,
  imageClassName = "object-cover",
  children,
  ctaText,
  ctaAction,
  ctaIcon
}: HeroProps) {
  const ContentWrapper = withAnimation ? motion.div : 'div'

  return (
    <section className="relative section-premium overflow-hidden hero-viewport-height">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt={alt}
          fill
          className={imageClassName}
          priority
        />
        {/* Premium overlay with depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-night-blue/70 via-night-blue/50 to-night-blue/40" />
        {/* Enhanced orange gradient for continuity - Sutil y estratégico */}
        <div className="absolute inset-x-0 bottom-0 h-48 md:h-64 bg-gradient-to-t from-orange-600/40 via-orange-500/20 to-transparent" />
      </div>

      {/* Centered content wrapper with flexbox */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10 h-full flex items-center justify-center">
        <ContentWrapper
          {...(withAnimation && {
            initial: { opacity: 0, y: 30 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.8, ease: "easeOut" }
          })}
          className="text-center max-w-5xl w-full"
        >
          {/* Title with enhanced spacing and glow effect */}
          <h1 className="hero-title mb-12 md:mb-16 text-white drop-shadow-2xl">
            {title}
          </h1>

          {/* Subtitle with generous spacing */}
          {description && description.trim() !== "" && (
            <div className="mb-10 md:mb-14 max-w-3xl mx-auto">
              <p className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed font-light tracking-wide">
                {description}
              </p>
            </div>
          )}

          {/* Counter */}
          {showCounter && counterValue !== undefined && (
            <div className="mb-8 md:mb-12">
              <p className="text-xl md:text-2xl text-white/80 font-medium">{counterValue} {counterText}</p>
            </div>
          )}

          {/* CTA Button with smooth transitions */}
          {ctaText && ctaAction && (
            <motion.div
              {...(withAnimation && {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.8, delay: 0.3 }
              })}
              className="mb-8"
            >
              <Button
                onClick={ctaAction}
                size="lg"
                className="bg-brand-orange hover:bg-orange-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 group"
              >
                {ctaText}
                {ctaIcon || <ArrowDown className="ml-2 w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />}
              </Button>
            </motion.div>
          )}

          {/* Additional Content (e.g., filters) */}
          {children}
        </ContentWrapper>
      </div>
    </section>
  )
}