"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Square,
  ArrowRight,
  Heart,
  ChevronDown,
  Phone,
  Mail,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import Link from "next/link";
import Image from "next/image";

// Importar servicios
import { useIsClient } from "@/hooks/use-is-client";
import { PropertyService } from "@/services/properties";
import type { Property } from "@/lib/supabase";

export default function PremiumHomePage() {
  const [scrolled, setScrolled] = useState(false);
  const isClient = useIsClient();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  // Cargar propiedades destacadas
  useEffect(() => {
    const loadFeaturedProperties = async () => {
      try {
        setLoadingProperties(true);
        const properties = await PropertyService.getFeaturedProperties();
        setFeaturedProperties(properties.slice(0, 6)); // Limitar a 6 propiedades
      } catch (error) {
        console.error("Error loading featured properties:", error);
      } finally {
        setLoadingProperties(false);
      }
    };

    loadFeaturedProperties();
  }, []);

  // Efecto de scroll para el header
  useEffect(() => {
    if (!isClient) return;
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isClient]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Premium Minimalista */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span
                className={`text-2xl font-light tracking-wider transition-colors ${
                  scrolled ? "text-gray-900" : "text-white"
                }`}
              >
                MARCONI
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {["Propiedades", "Servicios", "Nosotros", "Contacto"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className={`text-sm font-medium tracking-wide uppercase transition-colors hover:opacity-80 ${
                    scrolled ? "text-gray-700" : "text-white/90"
                  }`}
                >
                  {item}
                </Link>
              ))}
            </nav>

            {/* CTA Button */}
            <Button
              variant={scrolled ? "default" : "outline"}
              className={`hidden md:block ${
                scrolled
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "border-white text-white hover:bg-white hover:text-gray-900"
              }`}
            >
              Contactar Agente
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section Premium */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Background Image con overlay sutil */}
        <div className="absolute inset-0">
          <Image
            src={
              getOptimizedImageUrl("plaza_experiencialugarmundo_001", {
                width: 1920,
                height: 1080,
                crop: "fill",
                quality: "auto:best",
                format: "auto",
              }) || "/placeholder.svg"
            }
            alt="Luxury Real Estate - Reconquista"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-3xl"
          >
            {/* Subtítulo elegante */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-white/80 text-sm uppercase tracking-[0.2em] mb-4 font-light"
            >
              Bienvenido a la excelencia inmobiliaria
            </motion.p>

            {/* Título principal */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-white mb-6"
            >
              <span className="block text-6xl md:text-7xl font-serif font-light tracking-tight leading-[0.9]">
                Encuentra tu
              </span>
              <span className="block text-6xl md:text-7xl font-serif font-light tracking-tight leading-[0.9] mt-2">
                lugar ideal
              </span>
            </motion.h1>

            {/* Descripción */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-white/80 text-lg md:text-xl font-light leading-relaxed mb-12 max-w-2xl"
            >
              Más de 15 años creando hogares y oportunidades de inversión 
              excepcionales en Reconquista y alrededores.
            </motion.p>

            {/* Search Bar Elegante */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-2xl"
            >
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Buscar por ubicación, barrio..."
                    className="pl-12 h-14 border-0 text-base focus:ring-0 bg-transparent"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-full md:w-48 h-14 border-0 bg-gray-50">
                    <SelectValue placeholder="Tipo de propiedad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casa">Casa</SelectItem>
                    <SelectItem value="departamento">Departamento</SelectItem>
                    <SelectItem value="terreno">Terreno</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="h-14 px-8 bg-gray-900 hover:bg-gray-800 text-white font-medium">
                  Buscar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex flex-col items-center text-white/60"
          >
            <span className="text-xs uppercase tracking-wider mb-2">Explorar</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* Propiedades Destacadas - Diseño Premium */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Header de sección */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-premium-gold text-sm uppercase tracking-[0.2em] mb-4 font-medium">
                Selección exclusiva
              </p>
              <h2 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-6">
                Propiedades Destacadas
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Una cuidadosa selección de las mejores oportunidades inmobiliarias 
                disponibles en este momento.
              </p>
            </motion.div>
          </div>

          {/* Grid de propiedades */}
          {loadingProperties ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse">
                <div className="w-16 h-16 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group border-0 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden bg-white">
                    {/* Imagen */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      {property.images && property.images.length > 0 ? (
                        <Image
                          src={property.images[0]}
                          alt={property.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Badge elegante */}
                      {property.featured && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm border-0 px-3 py-1 text-xs font-medium shadow-sm">
                            DESTACADA
                          </Badge>
                        </div>
                      )}
                      
                      {/* Botón de favorito */}
                      <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                        <Heart className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>

                    <CardContent className="p-6">
                      {/* Precio */}
                      <div className="mb-4">
                        <p className="text-2xl font-light text-gray-900">
                          {formatPrice(property.price)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {property.operation_type === "alquiler" ? "Por mes" : "Precio total"}
                        </p>
                      </div>

                      {/* Título y ubicación */}
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-1">
                        {property.title}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center mb-4">
                        <MapPin className="w-4 h-4 mr-1" />
                        {property.neighborhood}, Reconquista
                      </p>

                      {/* Características */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 pb-4 border-b border-gray-100">
                        {property.bedrooms && (
                          <span className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            {property.bedrooms}
                          </span>
                        )}
                        {property.bathrooms && (
                          <span className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            {property.bathrooms}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Square className="w-4 h-4" />
                          {property.area_m2}m²
                        </span>
                      </div>

                      {/* CTAs */}
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="ghost"
                          className="flex-1 text-gray-900 hover:bg-gray-50 font-medium"
                        >
                          Ver Detalles
                        </Button>
                        <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-medium">
                          Contactar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Link a todas las propiedades */}
          <div className="text-center mt-12">
            <Link href="/propiedades">
              <Button
                variant="outline"
                size="lg"
                className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-medium px-8"
              >
                Ver todas las propiedades
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Sección de Estadísticas - Minimalista */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { number: "500+", label: "Propiedades Vendidas" },
              { number: "98%", label: "Clientes Satisfechos" },
              { number: "15+", label: "Años de Experiencia" },
              { number: "24/7", label: "Atención Disponible" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-light text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm uppercase tracking-wider text-gray-500">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Elegante y Sutil */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-6">
              Comience su búsqueda hoy
            </h2>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Nuestro equipo de expertos está preparado para guiarle hacia 
              la propiedad perfecta que se ajuste a su estilo de vida.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/propiedades">
                <Button
                  size="lg"
                  className="px-8 py-6 bg-gray-900 hover:bg-gray-800 text-white font-medium text-base"
                >
                  Explorar Propiedades
                </Button>
              </Link>
              <Link href="/contacto">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 border-gray-900 text-gray-900 hover:bg-gray-50 font-medium text-base"
                >
                  Agendar Consulta
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Premium */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Logo y descripción */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-light tracking-wider mb-4">MARCONI</h3>
              <p className="text-gray-400 leading-relaxed">
                La inmobiliaria líder en Reconquista, comprometida con encontrar
                el hogar perfecto para cada familia.
              </p>
            </div>

            {/* Enlaces rápidos */}
            <div>
              <h4 className="text-sm uppercase tracking-wider mb-4 text-gray-400">
                Enlaces
              </h4>
              <ul className="space-y-2">
                {["Propiedades", "Servicios", "Nosotros", "Contacto"].map((item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase()}`}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="text-sm uppercase tracking-wider mb-4 text-gray-400">
                Contacto
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Reconquista, Santa Fe
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +54 9 3482 308100
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  info@marconi.com
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Marconi Inmobiliaria. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}