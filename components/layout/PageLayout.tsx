"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionSeparator } from "@/components/SectionSeparator";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showHero?: boolean;
  heroImage?: string;
  className?: string;
}

export function PageLayout({ 
  children, 
  title, 
  subtitle, 
  showHero = false, 
  heroImage,
  className = "" 
}: PageLayoutProps) {
  const headerAnimation = useScrollAnimation({ threshold: 0.1 });

  return (
    <div className="min-h-screen bg-premium-gray-950 gradient-bg">
      {/* Header */}
      <header className="bg-premium-gray-950/90 backdrop-blur-xl border-b border-premium-gray-800/50 sticky top-0 z-50 shadow-premium">
        <div className="w-full px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 hover-glow">
              <Image
                src="/assets/logos/marconi_header_orangewhite.png"
                alt="Marconi Inmobiliaria"
                width={140}
                height={45}
                className="h-8 md:h-10 w-auto transition-all duration-300"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/propiedades"
                className="text-gray-300 hover:text-premium-orange-500 transition-all duration-300 font-medium tracking-wide relative group"
              >
                PROPIEDADES
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-premium-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="/agentes"
                className="text-gray-300 hover:text-premium-orange-500 transition-all duration-300 font-medium tracking-wide relative group"
              >
                AGENTES
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-premium-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="/contacto"
                className="text-gray-300 hover:text-premium-orange-500 transition-all duration-300 font-medium tracking-wide relative group"
              >
                CONTACTO
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-premium-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>

            {/* Mobile Search Bar */}
            <div className="md:hidden flex-1 max-w-xs ml-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-premium-orange-400" />
                <Input
                  placeholder="Buscar propiedades..."
                  className="pl-10 h-10 bg-premium-gray-900/80 border-premium-gray-700/50 text-white placeholder:text-gray-400 text-sm focus:border-premium-orange-500 backdrop-blur-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced decorative divider line */}
        <div className="section-separator"></div>
      </header>

      {/* Hero Section (conditional) */}
      {showHero && title && (
        <>
          <section className="relative py-24 md:py-32 overflow-hidden">
            {/* Background */}
            {heroImage ? (
              <div className="absolute inset-0">
                <Image
                  src={heroImage}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-premium-gray-950/90" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-premium-gray-950 via-premium-gray-925 to-premium-gray-950" />
            )}

            {/* Animated particles background */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-premium-orange-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0.2, 0.8, 0.2],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 relative z-10">
              <motion.div
                {...headerAnimation.getMotionProps("fadeUp")}
                className="text-center max-w-4xl mx-auto"
              >
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  {title.split(' ').map((word, index) => (
                    <span key={index}>
                      {index === title.split(' ').length - 1 ? (
                        <span className="gradient-text font-museo">{word}</span>
                      ) : (
                        `${word} `
                      )}
                    </span>
                  ))}
                </h1>
                
                {subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={headerAnimation.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed"
                  >
                    {subtitle}
                  </motion.p>
                )}
              </motion.div>
            </div>
          </section>
          <SectionSeparator variant="gradient" />
        </>
      )}

      {/* Main Content */}
      <main className={className}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-premium-gray-950 border-t border-premium-gray-800/50 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-premium-gray-950 via-premium-gray-925 to-premium-gray-950" />
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Main footer content */}
          <div className="py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-2"
                >
                  <Image
                    src="/assets/logos/marconi_title.svg"
                    alt="Marconi Inmobiliaria"
                    width={160}
                    height={50}
                    className="h-10 w-auto"
                  />
                </motion.div>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-premium-gray-300 text-lg leading-relaxed max-w-md"
                >
                  La inmobiliaria líder en Reconquista, comprometida con encontrar
                  el hogar perfecto para cada familia desde hace más de 15 años.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex space-x-4"
                >
                  {[
                    { icon: "📧", label: "Email" },
                    { icon: "📱", label: "WhatsApp" },
                    { icon: "📍", label: "Ubicación" },
                  ].map((social, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-12 h-12 bg-premium-orange-500/20 border border-premium-orange-500/30 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-premium-orange-500/30 transition-colors duration-300"
                    >
                      <span className="text-lg">{social.icon}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-white font-bold text-lg mb-6">Enlaces Rápidos</h3>
                <ul className="space-y-3">
                  {[
                    { href: "/propiedades", label: "Propiedades" },
                    { href: "/agentes", label: "Agentes" },
                    { href: "/contacto", label: "Contacto" },
                  ].map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="text-premium-gray-400 hover:text-premium-orange-400 transition-colors duration-300 flex items-center group"
                      >
                        <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <h3 className="text-white font-bold text-lg mb-6">Contacto</h3>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-premium-orange-400 flex-shrink-0 mt-1" />
                    <span className="text-premium-gray-400">Jorge Newbery 1562, Reconquista, Santa Fe</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="text-premium-orange-400">📱</span>
                    <span className="text-premium-gray-400">+54 9 3482 308100</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="text-premium-orange-400">📧</span>
                    <span className="text-premium-gray-400 text-sm">marconinegociosinmobiliarios@hotmail.com</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>

          {/* Bottom section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="border-t border-premium-gray-800/50 py-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-premium-gray-400 text-center md:text-left">
                &copy; 2025 Marconi Inmobiliaria. Todos los derechos reservados.
              </p>
              <div className="flex items-center space-x-2 text-premium-gray-400">
                <span>Hecho con</span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-premium-orange-400"
                >
                  ❤️
                </motion.span>
                <span>en Reconquista</span>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}