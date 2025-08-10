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
  MessageCircle,
  Star,
  Users,
  Home,
  Award,
  Heart,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import Link from "next/link";
import Image from "next/image";
import { MapThumbnail } from "@/components/MapThumbnail";

// Importar servicios
import { useIsClient } from "@/hooks/use-is-client";
import { PropertyService } from "@/services/properties";
import type { Property } from "@/lib/supabase";

export default function HomePage() {
  const [currentStat, setCurrentStat] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const isClient = useIsClient();

  // Estados para datos del backend
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    propertyId: null as number | null,
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const stats = [
    { number: "200+", label: "Propiedades Vendidas" },
    { number: "98%", label: "Clientes Satisfechos" },
    { number: "5", label: "Años de Experiencia" },
    { number: "24/7", label: "Atención Disponible" },
  ];

  // Cargar propiedades destacadas al montar el componente
  useEffect(() => {
    const loadFeaturedProperties = async () => {
      try {
        setLoadingProperties(true);
        const properties = await PropertyService.getFeaturedProperties();
        setFeaturedProperties(properties);
      } catch (error) {
        console.error("Error loading featured properties:", error);
      } finally {
        setLoadingProperties(false);
      }
    };

    loadFeaturedProperties();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isClient) {
      return;
    }
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isClient]);

  /* 


  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchTerm) params.set("search", searchTerm)
    if (operationType) params.set("operation", operationType)
    if (propertyType) params.set("type", propertyType)

    window.location.href = `/propiedades?${params.toString()}`
  } */

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case "house":
        return "Casa";
      case "apartment":
        return "Departamento";
      case "commercial":
        return "Comercial";
      case "land":
        return "Terreno";
      default:
        return type;
    }
  };

  // Manejar interés en una propiedad específica
  const handlePropertyInterest = (property: Property) => {
    setContactForm((prev) => ({
      ...prev,
      message: `Hola, me interesa la propiedad: ${property.title} (${
        property.currency
      }$ ${property.price.toLocaleString()}). Me gustaría recibir más información.`,
      propertyId: property.id,
    }));

    // Scroll al formulario de contacto
    document
      .getElementById("contact-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div 
      className="min-h-screen bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`sticky top-0 z-50 transition-all duration-500 ease-out ${
          scrolled 
            ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-800/50 shadow-2xl h-16' 
            : 'bg-gray-900 border-b border-gray-800 shadow-md h-16 md:h-20'
        }`}
      >
        <div className="w-full px-6">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link href="/" className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src="/assets/logos/marconi_header_orangewhite.png"
                    alt="Marconi Inmobiliaria"
                    width={140}
                    height={45}
                    className={`w-auto transition-all duration-300 ${
                      scrolled ? 'h-7' : 'h-8 md:h-10'
                    }`}
                    priority
                  />
                </motion.div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.nav 
              className="hidden md:flex items-center space-x-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {['PROPIEDADES', 'AGENTES', 'CONTACTO'].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                >
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="text-gray-300 hover:text-white transition-all duration-300 relative group"
                  >
                    <span className="relative z-10">{item}</span>
                    <motion.div
                      className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400"
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.div>
              ))}
            </motion.nav>

            {/* Mobile Search Bar */}
            <motion.div 
              className="md:hidden flex-1 max-w-xs ml-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar propiedades..."
                  className="pl-10 h-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 text-sm focus:border-brand-orange transition-all duration-300 focus:shadow-lg focus:shadow-orange-500/20"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative divider line */}
        <motion.div 
          className="w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-lg"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        />
      </motion.header>

      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[92vh] flex flex-col overflow-hidden">
        {/* Background Image with parallax */}
        <motion.div 
          className="absolute inset-0 will-change-transform"
          style={{ 
            y: (isClient && scrolled) ? -50 : 0 
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Image
            src={
              getOptimizedImageUrl("IMG_2850_c7gzcr", {
                width: 1920,
                height: 1080,
                // crop: "none",
                gravity: "south",
                quality: "auto",
                format: "auto",
              }) || "/placeholder.svg"
            }
            alt="Reconquista - Marconi Inmobiliaria"
            fill
            className="object-cover scale-110"
            priority
          />
          {/* Enhanced overlay with gradient */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          />
          {/* Cinematic vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center">
          {/* Centered Impact Text */}
          <div className="flex-1 flex items-center justify-center w-full">
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.8, 
                ease: "easeOut",
                delay: 0.5
              }}
              className="w-full"
            >
              <motion.div
                className="w-full p-8 md:p-20 flex justify-center backdrop-blur-sm rounded-2xl"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
                whileHover={{ 
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  scale: 1.02
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  initial={{ opacity: 0, filter: "blur(20px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ 
                    duration: 1.2, 
                    delay: 0.8,
                    ease: "easeOut"
                  }}
                >
                  <Image
                    src="/assets/impact_text/vivilaexperiencia.PNG"
                    alt="Viví la experiencia de encontrar tu lugar en el mundo"
                    width={800}
                    height={200}
                    priority
                    className="drop-shadow-2xl"
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          {/* Company Branding at Bottom */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 1.2, 
              duration: 0.6,
              ease: "easeOut"
            }}
            className="mb-8 text-center px-4"
          >
            <motion.div
              whileHover={{ 
                scale: 1.05,
                filter: "brightness(1.1)"
              }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src="/assets/logos/marconi_header_orangewhite.png"
                alt="Marconi Inmobiliaria"
                width={400}
                height={120}
                className="h-24 md:h-26 w-auto mx-auto opacity-90 mb-3 drop-shadow-2xl"
              />
            </motion.div>
            
            {/* Subtle tagline animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 1.5, 
                duration: 0.5
              }}
              className="text-white/80 text-sm md:text-base font-light tracking-wide"
            >
              <motion.div
                className="w-16 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent mx-auto mb-2"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.8, duration: 0.8 }}
              />
              Tu hogar ideal te está esperando
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Premium Angular Transition */}
      <div className="relative overflow-hidden">
        {/* Main angular section */}
        <div className="relative h-20 bg-gradient-to-b from-gray-900 via-gray-800 to-black">
          {/* Angular cut overlay */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-amber-400/10 to-orange-500/20"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)'
            }}
          />
          
          {/* Decorative elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center space-x-6"
          >
            {/* Left decoration */}
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-orange-500" />
            
            {/* Center element */}
            <div className="relative">
              <div className="w-3 h-3 bg-orange-500 rotate-45 shadow-lg shadow-orange-500/50" />
              <div className="absolute -top-1 -left-1 w-5 h-5 border border-orange-500/30 rotate-45" />
            </div>
            
            {/* Right decoration */}
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-orange-500" />
          </motion.div>
        </div>
        
        {/* Bottom highlight */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
      </div>
      
      {/* Propiedades Destacadas - CONECTADO CON BACKEND */}
      <section
        id="propiedades"
        className="py-16 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden"
      >
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2 
              className="text-3xl md:text-5xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              PROPIEDADES <span className="text-orange-500">DESTACADAS</span>
            </motion.h2>
            <motion.div
              className="w-24 h-1 bg-gradient-to-r from-orange-500 to-amber-400 mx-auto rounded-full mb-6"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
            <motion.p 
              className="text-lg text-gray-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Las mejores oportunidades de inversión en Reconquista
            </motion.p>
          </motion.div>

          {loadingProperties ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-white mt-4">Cargando propiedades...</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProperties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                    whileHover={{ y: -8 }}
                  >
                    <Card className="bg-gray-800/95 border-gray-600/30 border overflow-hidden group hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 backdrop-blur-sm h-full flex flex-col"
                    >
                    <div className="relative overflow-hidden">
                      <Link href={`/propiedades/${property.id}`}>
                        <motion.div 
                          className="relative cursor-pointer h-48"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.4 }}
                        >
                          {property.images && property.images.length > 0 ? (
                            <motion.div
                              className="relative w-full h-full"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                            >
                              <Image
                                src={property.images[0]}
                                alt={property.title}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg";
                                }}
                              />
                              {/* Premium overlay on hover */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              />
                            </motion.div>
                          ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                              <div className="text-gray-400 text-center">
                                <div className="w-16 h-16 bg-gray-600 rounded mx-auto mb-3"></div>
                                <p>Sin imagen</p>
                              </div>
                            </div>
                          )}

                          {/* Status badges */}
                          <motion.div 
                            className="absolute top-4 left-4"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            <div className="bg-gray-900/90 text-orange-300 border border-orange-400/30 px-3 py-1 rounded-xl font-medium text-sm backdrop-blur-md shadow-lg">
                              {property.operation_type === "venta"
                                ? "VENTA"
                                : "ALQUILER"}
                            </div>
                          </motion.div>

                          {/* Featured badge */}
                          {property.featured && (
                            <motion.div 
                              className="absolute top-4 right-4 bg-gradient-to-r from-yellow-600/90 to-yellow-500/90 text-white px-3 py-2 rounded-xl text-xs flex items-center gap-2 backdrop-blur-md shadow-lg"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <Eye className="w-4 h-4" />
                              DESTACADA
                            </motion.div>
                          )}

                          {/* Favorite button */}
                          <motion.div
                            className="absolute bottom-4 right-4"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              className="bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white backdrop-blur-md rounded-xl p-3 shadow-lg transition-all duration-300 hover:shadow-orange-500/20"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <Heart className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        </motion.div>
                      </Link>
                    </div>

                    <CardContent className="p-4 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <Link href={`/propiedades/${property.id}`}>
                            <motion.h3 
                              className="font-bold text-white text-lg mb-2 cursor-pointer relative group"
                              whileHover={{ color: "#fed7aa" }}
                              transition={{ duration: 0.2 }}
                            >
                              <span className="relative z-10">{property.title}</span>
                              <motion.div
                                className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400"
                                whileHover={{ width: "100%" }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                              />
                            </motion.h3>
                          </Link>
                          <div className="flex items-center text-orange-300 font-medium mb-1">
                            <MapPin className="w-4 h-4 mr-2" />
                            {property.neighborhood}, Reconquista
                          </div>
                        </div>
                        <div className="text-right ml-2">
                          <div className="text-xl font-bold text-white mb-1">
                            {property.currency}${" "}
                            {property.price.toLocaleString()}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {property.operation_type === "alquiler"
                              ? "por mes"
                              : ""}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1">
                        {/* Property Details */}
                        {(property.bedrooms ||
                          property.bathrooms ||
                          property.area_m2) && (
                          <div className="flex items-center gap-4 text-gray-300 mb-4 text-sm">
                            {property.bedrooms && (
                              <div className="flex items-center bg-gray-700/40 px-2 py-1 rounded-lg">
                                <Bed className="w-4 h-4 mr-1 text-orange-300" />
                                <span className="font-medium">
                                  {property.bedrooms}
                                </span>
                              </div>
                            )}
                            {property.bathrooms && (
                              <div className="flex items-center bg-gray-700/40 px-2 py-1 rounded-lg">
                                <Bath className="w-4 h-4 mr-1 text-orange-300" />
                                <span className="font-medium">
                                  {property.bathrooms}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center bg-gray-700/40 px-2 py-1 rounded-lg">
                              <Square className="w-4 h-4 mr-1 text-orange-300" />
                              <span className="font-medium">
                                {property.area_m2}m²
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Features */}
                        {property.features && property.features.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {property.features.slice(0, 3).map((feature, i) => (
                                <span
                                  key={i}
                                  className="bg-orange-500/15 text-orange-300 border border-orange-500/25 px-2 py-1 rounded-lg text-xs font-medium"
                                >
                                  {feature}
                                </span>
                              ))}
                              {property.features.length > 3 && (
                                <span className="text-gray-400 text-xs px-2 py-1">
                                  +{property.features.length - 3} más
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons - Always at bottom */}
                      <div className="flex gap-2 pt-2 border-t border-gray-700/50 mt-auto">
                        <motion.div className="flex-1">
                          <motion.button
                            className="w-full bg-gradient-to-r from-orange-600/90 to-orange-500/90 hover:from-orange-600 hover:to-orange-500 text-white border border-orange-500/30 backdrop-blur-sm text-sm font-medium rounded-xl shadow-lg px-4 py-2 flex items-center justify-center gap-1"
                            onClick={() => handlePropertyInterest(property)}
                            whileHover={{ 
                              scale: 1.02,
                              boxShadow: "0 10px 25px rgba(251, 146, 60, 0.3)"
                            }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 400, 
                              damping: 17 
                            }}
                          >
                            Me interesa <ArrowRight className="w-3 h-3 ml-1" />
                          </motion.button>
                        </motion.div>
                        <motion.button
                          className="border-gray-500/40 text-gray-300 hover:bg-gray-700/60 hover:text-white bg-transparent backdrop-blur-sm rounded-xl p-2 border transition-all duration-300"
                          onClick={() => handlePropertyInterest(property)}
                          whileHover={{ 
                            scale: 1.05,
                            backgroundColor: "rgba(55, 65, 81, 0.6)"
                          }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 400, 
                            damping: 17 
                          }}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </CardContent>
                  </Card>
                  </motion.div>
                ))}
              </div>

              {featuredProperties.length === 0 && (
                <div className="text-center py-12">
                  <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-white text-lg">
                    No hay propiedades destacadas disponibles
                  </p>
                  <p className="text-gray-400">
                    Próximamente agregaremos nuevas propiedades
                  </p>
                </div>
              )}

              <motion.div 
                className="text-center mt-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link href="/propiedades">
                  <motion.button
                    className="px-8 py-4 border-2 border-orange-500 text-orange-500 bg-transparent font-semibold rounded-xl backdrop-blur-sm flex items-center justify-center gap-2 mx-auto"
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: "#ff6600",
                      color: "white",
                      boxShadow: "0 15px 35px rgba(251, 146, 60, 0.4)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 17 
                    }}
                  >
                    Ver todas las propiedades
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </motion.button>
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-900 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-1/4 w-32 h-32 border border-orange-500/20 rounded-full" />
          <div className="absolute bottom-10 right-1/4 w-24 h-24 border border-amber-400/20 rounded-full" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              NUESTROS <span className="text-orange-500">LOGROS</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-amber-400 mx-auto rounded-full" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { icon: Home, number: "500+", label: "Propiedades Vendidas" },
              { icon: Users, number: "1000+", label: "Clientes Satisfechos" },
              { icon: Award, number: "15+", label: "Años de Experiencia" },
              { icon: Star, number: "4.9", label: "Calificación Promedio" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.15,
                  duration: 0.6,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  y: -10,
                  scale: 1.05
                }}
                className="text-center group cursor-pointer"
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-amber-400/20 rounded-full mb-6 backdrop-blur-sm border border-orange-500/20 group-hover:border-orange-500/40 transition-all duration-300"
                  whileHover={{
                    boxShadow: "0 15px 35px rgba(251, 146, 60, 0.3)",
                    backgroundColor: "rgba(251, 146, 60, 0.1)"
                  }}
                >
                  <stat.icon className="h-10 w-10 text-orange-500 group-hover:text-orange-400 transition-colors duration-300" />
                </motion.div>
                <motion.div 
                  className="text-4xl font-bold text-white mb-2 group-hover:text-orange-100 transition-colors duration-300"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: index * 0.15 + 0.3 }}
                >
                  {stat.number}
                </motion.div>
                <motion.div 
                  className="text-gray-400 font-medium group-hover:text-gray-300 transition-colors duration-300"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: index * 0.15 + 0.4 }}
                >
                  {stat.label}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-amber-600/80 via-orange-600/70 to-orange-500/60 relative overflow-hidden">
        {/* Soft radial highlights */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-museo font-medium text-white mb-6 drop-shadow-lg">
              ¿Listo para encontrar tu próximo hogar?
            </h2>
            <p className="text-xl text-orange-50 mb-8 drop-shadow-sm">
              Nuestro equipo de expertos está aquí para ayudarte en cada paso
              del camino
            </p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link href="/propiedades">
                <motion.button
                  className="px-8 py-4 bg-white text-brand-orange font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 min-w-[200px]"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 15px 35px rgba(255, 255, 255, 0.3)",
                    backgroundColor: "#f9fafb"
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 17 
                  }}
                >
                  Explorar Propiedades
                  <motion.div
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </motion.button>
              </Link>
              <Link href="/contacto">
                <motion.button
                  className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl bg-transparent backdrop-blur-sm flex items-center justify-center min-w-[200px]"
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: "white",
                    color: "#ff6600",
                    borderColor: "white",
                    boxShadow: "0 15px 35px rgba(255, 255, 255, 0.2)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 17 
                  }}
                >
                  Contactar Agente
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Map Thumbnail Section - Dirección de la inmobiliaria */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-bold text-white mb-2">Nuestra ubicación</h3>
              <p className="text-gray-300">Jorge Newbery 1562, Reconquista, Santa Fe, Argentina</p>
              <div className="mt-4">
                <Link 
                  href="https://www.google.com/maps/search/?api=1&query=Jorge%20Newbery%201562%2C%20Reconquista%2C%20Santa%20Fe%2C%20Argentina"
                  target="_blank"
                  className="inline-flex items-center text-brand-orange hover:text-orange-400"
                >
                  <span className="underline">Ver en Google Maps</span>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="relative rounded-xl overflow-hidden border border-gray-700 bg-gray-800">
                <MapThumbnail 
                  query="Jorge Newbery 1562, Reconquista, Santa Fe, Argentina"
                  className="w-full aspect-video"
                  title="Mapa de la inmobiliaria"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
 
      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/assets/logos/marconi_title.svg"
                  alt="Marconi Inmobiliaria"
                  width={140}
                  height={45}
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-gray-400 mb-4">
                La inmobiliaria líder en Reconquista, comprometida con encontrar
                el hogar perfecto para cada familia.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Enlaces</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/propiedades"
                    className="hover:text-white transition-colors"
                  >
                    Propiedades
                  </Link>
                </li>
                <li>
                  <Link
                    href="/agentes"
                    className="hover:text-white transition-colors"
                  >
                    Agentes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contacto"
                    className="hover:text-white transition-colors"
                  >
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Reconquista, Santa Fe</li>
                <li>+54 9 3482 308100</li>
                <li>marconinegociosinmobiliarios@hotmail.com</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 Marconi Inmobiliaria. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
