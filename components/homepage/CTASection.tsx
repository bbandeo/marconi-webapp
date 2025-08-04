"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-brand-orange via-orange-500 to-orange-600 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-48 -translate-y-48 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-48 translate-y-48 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-x-32 -translate-y-32" />
        
        {/* Geometric patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_75%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>
      
      <div className="container mx-auto px-4 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-block mb-6 relative">
            <span className="bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full text-sm font-semibold tracking-wider uppercase shadow-2xl relative z-10">
              Comienza Hoy
            </span>
            <div className="absolute inset-0 bg-white/10 rounded-full blur-lg scale-110" />
          </div>
          <h2 className="text-5xl md:text-6xl font-museo font-semibold text-white mb-8 leading-tight relative">
            <span className="relative z-10">
              ¿Listo para encontrar tu próximo hogar?
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-orange-100/90 mb-12 leading-relaxed max-w-3xl mx-auto">
            Nuestro equipo de expertos está aquí para ayudarte en cada paso del camino
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link href="/propiedades">
                <Button 
                  size="lg" 
                  className="bg-white text-brand-orange hover:bg-gray-100 font-semibold text-lg px-8 py-4 h-auto shadow-2xl hover:shadow-white/25 transition-all duration-300 rounded-xl border border-white/20 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center">
                    Explorar Propiedades
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.open('https://wa.me/5493482123456?text=Hola,%20estoy%20interesado%20en%20sus%20servicios%20inmobiliarios', '_blank')}
                className="border-2 border-white/80 text-white hover:bg-white hover:text-brand-orange bg-white/10 backdrop-blur-md font-semibold text-lg px-8 py-4 h-auto transition-all duration-300 rounded-xl relative overflow-hidden group"
              >
                <span className="relative z-10">Contactar Agente</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}