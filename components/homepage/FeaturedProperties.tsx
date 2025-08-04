"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Property } from "@/lib/supabase"
import Link from "next/link"
import PropertyCard from "./PropertyCard"
import LoadingSkeleton from "./LoadingSkeleton"

interface FeaturedPropertiesProps {
  featuredProperties: Property[]
  loading: boolean
}

export default function FeaturedProperties({ featuredProperties, loading }: FeaturedPropertiesProps) {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-800 to-gray-850 relative overflow-hidden">
      {/* Floating geometric elements with enhanced blur */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-48 h-48 bg-gradient-to-br from-brand-orange/15 to-orange-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-60 right-20 w-32 h-32 bg-gradient-to-br from-brand-orange/20 to-orange-500/20 rounded-lg rotate-45 blur-2xl" />
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-brand-orange/18 to-orange-500/18 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-gradient-to-br from-orange-400/12 to-brand-orange/12 rounded-full blur-2xl animate-pulse" />
      </div>
      
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4 relative">
            <span className="text-brand-orange text-sm font-semibold tracking-wider uppercase relative z-10 bg-gray-900/50 backdrop-blur-sm px-4 py-2 rounded-full border border-brand-orange/20">
              Oportunidades Únicas
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/10 to-orange-500/10 rounded-full blur-xl" />
          </div>
          <h2 className="text-5xl md:text-6xl font-museo font-medium text-white mb-6 leading-tight relative">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              Propiedades Destacadas
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Descubre las mejores oportunidades inmobiliarias en Reconquista
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {loading ? (
            <LoadingSkeleton />
          ) : featuredProperties.length > 0 ? (
            featuredProperties.map((property, index) => (
              <PropertyCard key={property.id} property={property} index={index} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 text-lg">No hay propiedades destacadas disponibles</p>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link href="/propiedades">
            <Button
              size="lg"
              variant="outline"
              className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white bg-transparent"
            >
              Ver todas las propiedades
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}