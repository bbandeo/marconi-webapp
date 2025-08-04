"use client"

import { motion } from "framer-motion"
import { Star, Users, Home, Award } from "lucide-react"

export default function StatsSection() {
  const stats = [
    { icon: Home, number: "500+", label: "Propiedades Vendidas" },
    { icon: Users, number: "1000+", label: "Clientes Satisfechos" },
    { icon: Award, number: "15+", label: "Años de Experiencia" },
    { icon: Star, number: "4.9", label: "Calificación Promedio" },
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden">
      {/* Enhanced Background Pattern with stronger blur */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#F97316_1px,transparent_1px)] bg-[size:50px_50px] opacity-8" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,#F97316_1px,transparent_1px)] bg-[size:30px_30px] opacity-5" />
        <div className="absolute top-1/4 left-1/3 w-[32rem] h-[32rem] bg-gradient-to-br from-brand-orange/12 to-orange-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[28rem] h-[28rem] bg-gradient-to-bl from-orange-500/10 to-brand-orange/6 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-brand-orange/8 to-orange-400/8 rounded-full blur-[80px] transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-museo font-medium mb-4 relative">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              Nuestra Trayectoria
            </span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Números que respaldan nuestra experiencia y compromiso
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -5, scale: 1.05 }}
              className="text-center group relative"
            >
              {/* Enhanced Glow effect */}
              <div className="absolute -inset-6 bg-gradient-to-r from-brand-orange/20 to-orange-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="absolute -inset-3 bg-gradient-to-r from-brand-orange/15 to-orange-500/15 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
              
              <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 group-hover:border-brand-orange/30 transition-all duration-500">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-orange/20 to-orange-500/20 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-brand-orange/20 backdrop-blur-sm relative overflow-hidden">
                  <stat.icon className="h-9 w-9 text-brand-orange relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="text-4xl md:text-5xl font-museo font-semibold mb-3 group-hover:scale-110 transition-all duration-300">
                  <span className="bg-gradient-to-r from-white to-gray-200 group-hover:from-brand-orange group-hover:to-orange-500 bg-clip-text text-transparent">
                    {stat.number}
                  </span>
                </div>
                <div className="text-gray-300 text-lg font-medium leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}