'use client'

import React, { useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { EmblaOptionsType } from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PropertyMiniMap } from '@/components/PropertyMiniMap'
import { Property } from '@/lib/supabase'
import { Home, MapPin, Bed, Bath, Square, ChevronLeft, ChevronRight } from 'lucide-react'

interface FeaturedPropertiesSliderProps {
  properties: Property[]
}

const OPTIONS: EmblaOptionsType = {
  align: 'start',
  loop: true,
  skipSnaps: false,
  inViewThreshold: 0.7,
  breakpoints: {
    '(min-width: 768px)': { 
      slidesToScroll: 2,
      align: 'start'
    },
    '(min-width: 1024px)': { 
      slidesToScroll: 3,
      align: 'start'
    }
  }
}

export function FeaturedPropertiesSlider({ properties }: FeaturedPropertiesSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS, [
    Autoplay({ 
      delay: 5000, 
      stopOnInteraction: true,
      stopOnMouseEnter: true 
    })
  ])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    
    onSelect()
    emblaApi.on('reInit', onSelect)
    emblaApi.on('select', onSelect)
    
    return () => {
      emblaApi.off('reInit', onSelect)
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-premium-xl">
        <Home className="w-16 h-16 text-premium-secondary mx-auto mb-premium-md opacity-40" />
        <h3 className="heading-lg text-premium-primary mb-premium-sm">
          Propiedades en preparación
        </h3>
        <p className="body-md text-premium-secondary">
          Estamos seleccionando las mejores propiedades para ti
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <div className="flex justify-end gap-4 mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          className="bg-gray-800/50 border-gray-700/30 text-white hover:bg-orange-500/20 hover:border-orange-500/40 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={scrollNext}
          disabled={!canScrollNext}
          className="bg-gray-800/50 border-gray-700/30 text-white hover:bg-orange-500/20 hover:border-orange-500/40 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Slider Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {properties.map((property, index) => (
            <div
              key={property.id}
              className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 px-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <Card className="group overflow-hidden bg-[#12141f] border border-gray-700/20 backdrop-blur-sm hover:border-orange-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-[1.02] cursor-pointer h-full rounded-2xl">
                  {/* IMAGEN CON OVERLAYS ESTRATÉGICOS */}
                  <Link href={`/propiedades/${property.id}`}>
                    <div className="relative overflow-hidden h-56">
                      {property.images && property.images.length > 0 ? (
                        <Image
                          src={property.images[0]}
                          alt={property.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <div className="text-gray-400 text-center">
                            <Home className="w-12 h-12 mx-auto mb-2 opacity-40" />
                            <p className="text-xs font-medium">Sin imagen disponible</p>
                          </div>
                        </div>
                      )}

                      {/* Gradiente inferior para destacar precio */}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                      {/* PILL BADGE - VENTA/ALQUILER CON GRADIENTE */}
                      <div className="absolute top-4 left-4">
                        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50 transition-shadow duration-300 backdrop-blur-sm">
                          {property.operation_type === "venta" ? "VENTA" : "ALQUILER"}
                        </div>
                      </div>

                      {/* PRECIO EN OVERLAY - BADGE PREMIUM CON GRADIENTE Y BORDE */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="absolute bottom-3 right-3 text-right"
                      >
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-md border border-white/20">
                          {property.currency}$ {property.price.toLocaleString()}
                        </div>
                      </motion.div>
                    </div>
                  </Link>

                  {/* INFORMACIÓN CON MÁS AIRE - PADDING GENEROSO */}
                  <CardContent className="p-4 flex-1">
                    <Link href={`/propiedades/${property.id}`}>
                      <div className="space-y-3">
                        {/* TÍTULO CON JERARQUÍA CLARA - MEJORADO */}
                        <h3 className="text-lg font-bold text-gray-100 hover:text-orange-400 transition-colors cursor-pointer line-clamp-1 leading-tight">
                          {property.title}
                        </h3>

                        {/* UBICACIÓN - GRIS MEJORADO PARA LEGIBILIDAD */}
                        <div className="flex items-center text-gray-400 text-sm">
                          <MapPin size={16} className="mr-2 flex-shrink-0" />
                          <span className="truncate">{property.neighborhood}, Reconquista</span>
                        </div>

                        {/* CARACTERÍSTICAS SI ESTÁN DISPONIBLES - ICONOS MEJORADOS */}
                        {(property.bedrooms || property.bathrooms || property.area_m2) && (
                          <div className="flex gap-4 text-gray-300 text-sm">
                            {property.bedrooms && (
                              <span className="flex items-center gap-1">
                                <span>🛏</span>
                                {property.bedrooms}
                              </span>
                            )}
                            {property.bathrooms && (
                              <span className="flex items-center gap-1">
                                <span>🛁</span>
                                {property.bathrooms}
                              </span>
                            )}
                            {property.area_m2 && (
                              <span className="flex items-center gap-1">
                                <span>📐</span>
                                {property.area_m2} m²
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide Counter */}
      <div className="text-center mt-6">
        <p className="text-gray-400 text-sm">
          Mostrando {Math.min(3, properties.length)} de {properties.length} propiedades destacadas
        </p>
      </div>
    </div>
  )
}