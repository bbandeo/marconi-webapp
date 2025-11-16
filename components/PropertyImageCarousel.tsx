'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Home, ChevronLeft, ChevronRight } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import { Button } from '@/components/ui/button'

/**
 * Props for PropertyImageCarousel component
 */
interface PropertyImageCarouselProps {
  images: string[]
  propertyTitle: string
  propertyId: number
  onImageClick?: () => void
}

/**
 * Placeholder component shown when no images are available
 */
function PlaceholderImage() {
  return (
    <div className="relative aspect-[4/3] bg-night-blue/80 flex items-center justify-center rounded-t-2xl">
      <div className="text-center">
        <Home className="w-12 h-12 mx-auto mb-2 text-support-gray/40" />
        <p className="text-sm text-support-gray">Sin imágenes disponibles</p>
      </div>
    </div>
  )
}

/**
 * Single image component shown when property has only one image
 * No carousel controls needed for single images
 */
function SingleImage({ image, title }: { image: string; title: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
      <Image
        src={image}
        alt={`${title} - Vista principal`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
        priority
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = '/placeholder.svg'
        }}
      />
    </div>
  )
}

/**
 * PropertyImageCarousel Component
 *
 * Displays property images in a carousel format with navigation controls.
 * Handles special cases: no images, single image, and multiple images.
 *
 * Features:
 * - Embla Carousel integration (to be implemented in next task)
 * - Navigation controls (prev/next arrows)
 * - Position indicators (dots)
 * - Touch/swipe gestures
 * - Keyboard navigation
 * - Accessibility support
 *
 * Requirements covered: 3.1, 3.8, 2.5
 */
export function PropertyImageCarousel({
  images,
  propertyTitle,
  propertyId,
  onImageClick,
}: PropertyImageCarouselProps) {
  // Handle case: No images available
  if (!images || images.length === 0) {
    return <PlaceholderImage />
  }

  // Handle case: Single image (no carousel needed)
  if (images.length === 1) {
    return <SingleImage image={images[0]} title={propertyTitle} />
  }

  // Multiple images - Full carousel implementation with Embla
  // Configure Embla Carousel with optimized options
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,        // No circular behavior - more predictable for users
    skipSnaps: false,   // Always snap to an image
    duration: 20,       // Fast transition (ms)
    dragFree: false,    // Mandatory snap
    containScroll: 'trimSnaps' // Adjust snaps at the end
  })

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  // Navigation callbacks with stopPropagation to prevent card click
  const scrollPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation() // Prevent navigation to property detail page
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation() // Prevent navigation to property detail page
    emblaApi?.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent navigation to property detail page
    emblaApi?.scrollTo(index)
  }, [emblaApi])

  // Sync state with Embla API
  useEffect(() => {
    if (!emblaApi) return

    // Handler to update state when carousel position changes
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
      setCanScrollPrev(emblaApi.canScrollPrev())
      setCanScrollNext(emblaApi.canScrollNext())
    }

    // Listen to 'select' event fired by Embla when slide changes
    emblaApi.on('select', onSelect)

    // Initialize state immediately
    onSelect()

    // Cleanup: remove listener when component unmounts
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  return (
    <div className="relative group/carousel rounded-t-2xl overflow-hidden">
      {/* Embla Viewport - this is the window that shows the current slide */}
      <div className="overflow-hidden" ref={emblaRef}>
        {/* Embla Container - this holds all slides in a flex row */}
        <div className="flex">
          {images.map((image, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0"
            >
              {/* Image container with fixed aspect ratio */}
              <div className="relative aspect-[4/3]">
                <Image
                  src={image}
                  alt={`${propertyTitle} - Imagen ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  priority={index === 0} // Only first image has priority
                  loading={index === 0 ? 'eager' : 'lazy'}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder.svg'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Previous button - Only show if can scroll back */}
      {canScrollPrev && (
        <Button
          onClick={scrollPrev}
          size="sm"
          variant="ghost"
          className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 z-10 bg-black/70 hover:bg-vibrant-orange/80 text-bone-white hover:text-bone-white backdrop-blur-md rounded-full p-2.5 shadow-lg hover:scale-110 border border-white/10"
          aria-label="Ver imagen anterior"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </Button>
      )}

      {/* Next button - Only show if can scroll forward */}
      {canScrollNext && (
        <Button
          onClick={scrollNext}
          size="sm"
          variant="ghost"
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 z-10 bg-black/70 hover:bg-vibrant-orange/80 text-bone-white hover:text-bone-white backdrop-blur-md rounded-full p-2.5 shadow-lg hover:scale-110 border border-white/10"
          aria-label="Ver imagen siguiente"
        >
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </Button>
      )}

      {/* Dot indicators - Position indicators for current image */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => scrollTo(index, e)}
            className={`rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? 'bg-vibrant-orange w-6 h-2'  // Active: wider, orange
                : 'bg-white/60 hover:bg-white/80 w-2 h-2'  // Inactive: smaller, white
            }`}
            aria-label={`Ir a imagen ${index + 1} de ${images.length}`}
            aria-current={index === selectedIndex ? 'true' : 'false'}
          />
        ))}
      </div>

    </div>
  )
}

export default PropertyImageCarousel
