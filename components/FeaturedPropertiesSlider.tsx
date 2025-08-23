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
                <Card className="group overflow-hidden bg-gray-800/50 border border-gray-700/30 backdrop-blur-sm hover:border-orange-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 cursor-pointer h-full">
                  {/* IMAGEN CON OVERLAYS ESTRATÉGICOS */}
                  <Link href={`/propiedades/${property.id}`}>
                    <div className="relative overflow-hidden h-64 md:h-72">
                      {property.images && property.images.length > 0 ? (
                        <Image
                          src={property.images[0]}
                          alt={property.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
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

                      {/* PRECIO EN OVERLAY - TIPOGRAFÍA BOLD */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="absolute bottom-4 right-4 text-right"
                      >
                        <div className="bg-black/70 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10">
                          <div className="text-lg font-bold text-white mb-0.5">
                            {property.currency}$ {property.price.toLocaleString()}
                          </div>
                          {property.operation_type === "alquiler" && (
                            <div className="text-xs text-gray-300 font-medium">
                              por mes
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </Link>

                  {/* INFORMACIÓN CON MÁS AIRE - PADDING GENEROSO */}
                  <CardContent className="p-6 flex-1">
                    <Link href={`/propiedades/${property.id}`}>
                      {/* TÍTULO CON JERARQUÍA CLARA */}
                      <h3 className="text-lg font-bold text-white mb-3 hover:text-orange-400 transition-colors cursor-pointer line-clamp-2 leading-tight">
                        {property.title}
                      </h3>
                      
                      {/* UBICACIÓN - GRIS CLARO LEGIBLE */}
                      <div className="flex items-center text-gray-300 mb-4">
                        <MapPin className="w-4 h-4 mr-2 text-orange-400" />
                        <span className="text-sm font-medium">{property.neighborhood}, Reconquista</span>
                      </div>

                      {/* MINI MAPA */}
                      <div className="mb-4">
                        <PropertyMiniMap 
                          property={{
                            address: property.address,
                            neighborhood: property.neighborhood,
                            city: property.city,
                            title: property.title
                          }}
                          className="h-24 w-full"
                        />
                      </div>
                      
                      {/* CARACTERÍSTICAS SI ESTÁN DISPONIBLES */}
                      {(property.bedrooms || property.bathrooms || property.area_m2) && (
                        <div className="flex items-center gap-2 text-gray-400 text-xs flex-wrap">
                          {property.bedrooms && (
                            <div className="flex items-center bg-gray-700/50 px-2 py-1.5 rounded-lg">
                              <Bed className="w-3 h-3 mr-1.5 text-orange-400" />
                              <span className="font-medium">{property.bedrooms}</span>
                            </div>
                          )}
                          {property.bathrooms && (
                            <div className="flex items-center bg-gray-700/50 px-2 py-1.5 rounded-lg">
                              <Bath className="w-3 h-3 mr-1.5 text-orange-400" />
                              <span className="font-medium">{property.bathrooms}</span>
                            </div>
                          )}
                          {property.area_m2 && (
                            <div className="flex items-center bg-gray-700/50 px-2 py-1.5 rounded-lg">
                              <Square className="w-3 h-3 mr-1.5 text-orange-400" />
                              <span className="font-medium">{property.area_m2}m²</span>
                            </div>
                          )}
                        </div>
                      )}
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