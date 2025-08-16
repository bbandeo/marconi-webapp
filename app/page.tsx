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
import { SectionDivider } from "@/components/ui/section-divider";

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
    <div className="min-h-screen bg-gray-900">
      {/* Enhanced Header with Floriana styling */}
      <header className="bg-gray-900/95 border-b border-floriana-orange-400/20 sticky top-0 z-50 shadow-floriana backdrop-blur-md">
        <div className="w-full px-6 relative">
          {/* Floating background elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-2 right-1/4 w-16 h-16 rounded-full bg-floriana-orange-500/10 blur-xl animate-float-slow" />
            <div className="absolute bottom-2 left-1/3 w-12 h-12 rounded-full bg-floriana-coral/15 blur-lg animate-float" />
          </div>
          
          <div className="flex items-center justify-between h-16 md:h-20 relative z-10">
            {/* Enhanced Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Image
                  src="/assets/logos/marconi_header_orangewhite.png"
                  alt="Marconi Inmobiliaria"
                  width={140}
                  height={45}
                  className="h-8 md:h-10 w-auto group-hover:brightness-110 transition-all duration-300"
                  priority
                />
              </motion.div>
            </Link>

            {/* Enhanced Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/propiedades"
                className="text-gray-300 hover:text-floriana-orange-300 transition-all duration-300 font-semibold tracking-wide relative group"
              >
                PROPIEDADES
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-floriana-orange-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                href="/agentes"
                className="text-gray-300 hover:text-floriana-orange-300 transition-all duration-300 font-semibold tracking-wide relative group"
              >
                AGENTES
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-floriana-orange-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                href="/contacto"
                className="text-gray-300 hover:text-floriana-orange-300 transition-all duration-300 font-semibold tracking-wide relative group"
              >
                CONTACTO
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-floriana-orange-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </nav>

            {/* Enhanced Mobile Search Bar */}
            <div className="md:hidden flex-1 max-w-xs ml-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-floriana-orange-400" />
                <Input
                  placeholder="Buscar propiedades..."
                  className="pl-10 h-10 glass-morphism border-floriana-orange-400/30 text-white placeholder:text-gray-300 text-sm focus:border-floriana-orange-400 focus:ring-floriana-orange-400/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced decorative divider line */}
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-floriana-orange-500 to-transparent shadow-floriana animate-gradient-x"></div>
      </header>

      {/* Hero Section - Floriana Inspired */}
      <section className="relative h-[60vh] md:h-[92vh] flex flex-col overflow-hidden">
        {/* Background Image with Enhanced Overlay */}
        <div className="absolute inset-0">
          <Image
            src={
              getOptimizedImageUrl("IMG_2850_c7gzcr", {
                width: 1920,
                height: 1080,
                gravity: "south",
                quality: "auto",
                format: "auto",
              }) || "/placeholder.svg"
            }
            alt="Reconquista - Marconi Inmobiliaria"
            fill
            className="object-cover scale-110 animate-scale-pulse"
            priority
          />
          {/* Enhanced gradient overlay inspired by Floriana */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-floriana-orange-400/20 blur-xl animate-float" />
          <div className="absolute bottom-1/3 left-1/4 w-24 h-24 rounded-full bg-floriana-coral/30 blur-lg animate-float-slow" />
          <div className="absolute top-1/2 right-1/3 w-16 h-16 rounded-full bg-floriana-peach/25 blur-md animate-bounce-slow" />
        </div>

        {/* Content - Enhanced Floriana style hero */}
        <div className="relative z-10 h-full">
          <div className="absolute inset-0 flex">
            {/* Main content panel with enhanced gradients */}
            <div className="relative h-full w-[75%] md:w-[60%] bg-floriana-primary clip-diagonal-left">
              {/* Decorative patterns overlay */}
              <div className="absolute inset-0 pattern-organic opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-floriana-coral/20 to-floriana-orange-600/30" />
              
              {/* Animated accent lines */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shine" />
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine" style={{ animationDelay: '1s' }} />
              
              <div className="relative h-full flex flex-col justify-center px-8 md:px-16">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="mb-4"
                >
                  <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white/90 text-sm font-medium border border-white/30">
                    ✨ Experiencia Premium en Inmobiliaria
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-white text-5xl md:text-8xl font-bold leading-[0.9] tracking-tight font-playfair"
                >
                  <span className="block text-gradient-orange bg-clip-text text-transparent bg-white">
                    Floriana
                  </span>
                  <span className="block text-4xl md:text-6xl font-inter font-light mt-2">
                    Marconi
                  </span>
                  <span className="block text-2xl md:text-3xl font-inter font-light text-white/90 mt-1">
                    Negocios Inmobiliarios
                  </span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-white/95 text-xl md:text-3xl mt-6 font-light leading-relaxed"
                >
                  Viví la experiencia de encontrar
                  <br />
                  <span className="text-floriana-amber font-medium">tu lugar en el mundo</span>
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="mt-10 flex flex-col sm:flex-row gap-4"
                >
                  <Link href="/propiedades">
                    <Button className="shine-effect bg-white text-floriana-orange-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-floriana transform hover:scale-105 transition-all duration-300">
                      Explorar Propiedades
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/contacto">
                    <Button variant="outline" className="glass-morphism border-white/60 text-white hover:bg-white/20 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-md">
                      Consulta Especializada
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
            
            {/* Right side with enhanced patterns and floating elements */}
            <div className="flex-1 relative">
              <div className="absolute inset-0 pattern-dots opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent" />
              
              {/* Enhanced floating elements */}
              <div className="absolute bottom-16 right-16 w-32 h-32 rounded-full glass-morphism animate-float-slow border border-white/20">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-floriana-orange-400/30 to-floriana-coral/30 animate-pulse-orange" />
              </div>
              
              <div className="absolute top-1/3 right-8 w-20 h-20 rounded-full glass-morphism animate-float border border-floriana-peach/30">
                <div className="w-full h-full rounded-full bg-floriana-peach/20" />
              </div>
              
              {/* Decorative text elements */}
              <div className="absolute bottom-8 right-8 text-white/60 text-sm font-medium">
                <div className="text-right">
                  <div className="text-floriana-amber">Premium</div>
                  <div>Real Estate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Divider between Hero and Featured Properties */}
      <SectionDivider variant="floriana" />
      {/* Propiedades Destacadas - Enhanced Floriana Style */}
      <section
        id="propiedades"
        className="py-20 bg-gradient-to-b from-gray-900 via-black to-gray-900 relative overflow-hidden"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/6 w-64 h-64 rounded-full bg-floriana-orange-500/10 blur-3xl animate-float-slow" />
          <div className="absolute bottom-1/4 right-1/6 w-48 h-48 rounded-full bg-floriana-coral/15 blur-2xl animate-float" />
          <div className="pattern-organic absolute inset-0 opacity-5" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block px-6 py-3 bg-floriana-primary/20 backdrop-blur-md rounded-full mb-6 border border-floriana-orange-400/30"
            >
              <span className="text-floriana-amber font-semibold text-sm tracking-wide">✨ PORTAFOLIO EXCLUSIVO</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 font-playfair">
              Propiedades{" "}
              <span className="text-gradient-orange bg-gradient-to-r from-floriana-coral to-floriana-orange-500 bg-clip-text text-transparent">
                Destacadas
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Descubrí las mejores oportunidades de inversión en Reconquista, 
              seleccionadas especialmente para vos
            </p>
          </motion.div>

          {loadingProperties ? (
            <div className="text-center py-16">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-floriana-orange-500/30"></div>
                <div className="absolute inset-0 rounded-full border-4 border-floriana-orange-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-white text-lg">Cargando propiedades exclusivas...</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProperties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                  >
                    <Card className="glass-morphism border-floriana-orange-400/20 border-2 overflow-hidden group hover:border-floriana-orange-400/60 hover:shadow-floriana-lg transition-all duration-500 backdrop-blur-sm h-full flex flex-col transform hover:scale-105 hover:-translate-y-2">
                      <div className="relative overflow-hidden">
                        <Link href={`/propiedades/${property.id}`}>
                          <div className="relative cursor-pointer h-56 group/image">
                            {property.images && property.images.length > 0 ? (
                              <Image
                                src={property.images[0]}
                                alt={property.title}
                                fill
                                className="object-cover group-hover/image:scale-110 transition-transform duration-700"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                <div className="text-gray-400 text-center">
                                  <div className="w-16 h-16 bg-gray-600 rounded mx-auto mb-3"></div>
                                  <p>Sin imagen</p>
                                </div>
                              </div>
                            )}

                            {/* Enhanced overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                            
                            {/* Status badges with enhanced styling */}
                            <div className="absolute top-4 left-4">
                              <div className="bg-floriana-primary/90 text-white border border-floriana-orange-400/50 px-4 py-2 rounded-2xl font-bold text-sm backdrop-blur-md shadow-floriana transform hover:scale-105 transition-transform">
                                {property.operation_type === "venta"
                                  ? "VENTA"
                                  : "ALQUILER"}
                              </div>
                            </div>

                            {/* Enhanced featured badge */}
                            {property.featured && (
                              <div className="absolute top-4 right-4 bg-gradient-to-r from-floriana-amber/90 to-floriana-peach/90 text-white px-4 py-2 rounded-2xl text-sm flex items-center gap-2 backdrop-blur-md shadow-floriana font-semibold">
                                <Eye className="w-4 h-4" />
                                DESTACADA
                              </div>
                            )}

                            {/* Enhanced favorite button */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute bottom-4 right-4 glass-morphism hover:bg-floriana-orange-500/20 text-white backdrop-blur-md rounded-2xl p-3 shadow-floriana border border-white/20 hover:border-floriana-orange-400/50 transition-all duration-300"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <Heart className="w-5 h-5" />
                            </Button>
                          </div>
                        </Link>
                      </div>

                      <CardContent className="p-6 flex flex-col h-full bg-gradient-to-b from-gray-800/80 to-gray-900/90">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <Link href={`/propiedades/${property.id}`}>
                              <h3 className="font-bold text-white text-xl mb-3 hover:text-floriana-orange-300 transition-colors cursor-pointer leading-tight">
                                {property.title}
                              </h3>
                            </Link>
                            <div className="flex items-center text-floriana-orange-300 font-medium mb-2">
                              <MapPin className="w-5 h-5 mr-2" />
                              <span className="text-base">{property.neighborhood}, Reconquista</span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-floriana-amber mb-1">
                              {property.currency}${" "}
                              {property.price.toLocaleString()}
                            </div>
                            <div className="text-floriana-orange-300 text-sm font-medium">
                              {property.operation_type === "alquiler"
                                ? "por mes"
                                : ""}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1">
                          {/* Enhanced Property Details */}
                          {(property.bedrooms ||
                            property.bathrooms ||
                            property.area_m2) && (
                            <div className="flex items-center gap-3 text-gray-300 mb-6 text-sm">
                              {property.bedrooms && (
                                <div className="flex items-center glass-morphism px-3 py-2 rounded-xl border border-floriana-orange-400/20">
                                  <Bed className="w-4 h-4 mr-2 text-floriana-orange-400" />
                                  <span className="font-semibold text-white">
                                    {property.bedrooms}
                                  </span>
                                </div>
                              )}
                              {property.bathrooms && (
                                <div className="flex items-center glass-morphism px-3 py-2 rounded-xl border border-floriana-orange-400/20">
                                  <Bath className="w-4 h-4 mr-2 text-floriana-orange-400" />
                                  <span className="font-semibold text-white">
                                    {property.bathrooms}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center glass-morphism px-3 py-2 rounded-xl border border-floriana-orange-400/20">
                                <Square className="w-4 h-4 mr-2 text-floriana-orange-400" />
                                <span className="font-semibold text-white">
                                  {property.area_m2}m²
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Enhanced Features */}
                          {property.features && property.features.length > 0 && (
                            <div className="mb-6">
                              <div className="flex flex-wrap gap-2">
                                {property.features.slice(0, 3).map((feature, i) => (
                                  <span
                                    key={i}
                                    className="bg-floriana-primary/20 text-floriana-orange-200 border border-floriana-orange-400/30 px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-md"
                                  >
                                    {feature}
                                  </span>
                                ))}
                                {property.features.length > 3 && (
                                  <span className="text-floriana-orange-300 text-xs px-2 py-1 font-medium">
                                    +{property.features.length - 3} más
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Enhanced Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-floriana-orange-400/20 mt-auto">
                          <Button
                            className="flex-1 bg-floriana-primary hover:bg-floriana-secondary text-white border border-floriana-orange-400/50 backdrop-blur-sm transition-all duration-300 text-sm font-bold rounded-2xl shadow-floriana transform hover:scale-105 shine-effect"
                            onClick={() => handlePropertyInterest(property)}
                          >
                            Me interesa <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-floriana-orange-400/40 text-floriana-orange-300 hover:bg-floriana-orange-500/20 hover:text-white glass-morphism rounded-2xl px-4 transform hover:scale-105 transition-all duration-300"
                            onClick={() => handlePropertyInterest(property)}
                          >
                            <MessageCircle className="w-5 h-5" />
                          </Button>
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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center mt-12"
              >
                <Link href="/propiedades">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-floriana-orange-400 text-floriana-orange-300 hover:bg-floriana-primary hover:text-white bg-transparent px-10 py-4 text-lg font-bold rounded-full shadow-floriana transform hover:scale-105 transition-all duration-300 shine-effect"
                  >
                    Explorar Todo el Portafolio{" "}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </section>
      <SectionDivider variant="organic" />

      {/* Stats Section - Enhanced Floriana Style */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-floriana-orange-500/5 blur-3xl animate-pulse-orange" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-floriana-coral/10 blur-2xl animate-float-slow" />
          <div className="pattern-dots absolute inset-0 opacity-10" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block px-6 py-3 bg-floriana-primary/20 backdrop-blur-md rounded-full mb-6 border border-floriana-orange-400/30"
            >
              <span className="text-floriana-amber font-semibold text-sm tracking-wide">📊 RESULTADOS COMPROBADOS</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 font-playfair">
              Nuestra{" "}
              <span className="text-gradient-orange bg-gradient-to-r from-floriana-coral to-floriana-orange-500 bg-clip-text text-transparent">
                Trayectoria
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Números que reflejan nuestro compromiso con la excelencia y la satisfacción de nuestros clientes
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { icon: Home, number: "500+", label: "Propiedades Vendidas", description: "Exitosas transacciones completadas" },
              { icon: Users, number: "1000+", label: "Clientes Satisfechos", description: "Familias que encontraron su hogar" },
              { icon: Award, number: "15+", label: "Años de Experiencia", description: "Liderando el mercado inmobiliario" },
              { icon: Star, number: "4.9", label: "Calificación Promedio", description: "Excelencia reconocida por clientes" },
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
                className="text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-floriana-primary/30 rounded-2xl mb-6 border border-floriana-orange-400/30 backdrop-blur-md shadow-floriana group-hover:shadow-floriana-lg transition-all duration-300"
                >
                  <stat.icon className="h-10 w-10 text-floriana-orange-300 group-hover:text-floriana-amber transition-colors duration-300" />
                </motion.div>
                
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.3, duration: 0.5, type: "spring" }}
                  className="text-4xl md:text-5xl font-playfair font-bold text-floriana-amber mb-3 animate-scale-pulse"
                >
                  {stat.number}
                </motion.div>
                
                <div className="text-xl font-semibold text-white mb-2 group-hover:text-floriana-orange-200 transition-colors duration-300">
                  {stat.label}
                </div>
                
                <div className="text-sm text-gray-400 leading-relaxed max-w-[200px] mx-auto">
                  {stat.description}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Additional achievement banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-4 px-8 py-4 glass-morphism rounded-full border border-floriana-orange-400/30">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-floriana-amber rounded-full animate-pulse"></div>
                <span className="text-floriana-amber font-semibold">Líder en Reconquista</span>
              </div>
              <div className="text-gray-300">|</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-floriana-coral rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span className="text-floriana-coral font-semibold">Servicio Premium</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <SectionDivider variant="floriana" flip={true} />

      {/* CTA Section - Enhanced Floriana Style */}
      <section className="py-24 bg-floriana-primary relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-animated opacity-80" />
        <div className="absolute inset-0 pattern-organic opacity-20" />
        
        {/* Floating decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/6 w-40 h-40 rounded-full bg-white/10 blur-2xl animate-float-slow" />
          <div className="absolute bottom-1/4 right-1/6 w-32 h-32 rounded-full bg-floriana-amber/20 blur-xl animate-float" />
          <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-floriana-peach/15 blur-lg animate-bounce-slow" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block px-8 py-4 bg-white/20 backdrop-blur-md rounded-full mb-8 border border-white/30"
            >
              <span className="text-white font-bold text-lg tracking-wide">🏡 TU HOGAR IDEAL TE ESPERA</span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-playfair font-bold text-white mb-8 leading-tight"
            >
              ¿Listo para encontrar
              <br />
              <span className="text-floriana-amber">tu próximo hogar?</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-2xl text-white/95 mb-12 leading-relaxed max-w-3xl mx-auto"
            >
              Nuestro equipo de expertos está aquí para acompañarte en cada paso del camino. 
              <br className="hidden md:block" />
              <span className="text-floriana-amber font-semibold">Experiencia premium garantizada.</span>
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col lg:flex-row gap-6 justify-center items-center"
            >
              <Link href="/propiedades">
                <Button
                  size="lg"
                  className="shine-effect bg-white text-floriana-orange-600 hover:bg-gray-100 px-12 py-6 text-xl font-bold rounded-full shadow-floriana-lg transform hover:scale-105 transition-all duration-300 min-w-[280px]"
                >
                  Explorar Propiedades
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              
              <Link href="/contacto">
                <Button
                  size="lg"
                  variant="outline"
                  className="glass-morphism border-white/60 text-white hover:bg-white/20 px-12 py-6 text-xl font-bold rounded-full backdrop-blur-md border-2 transform hover:scale-105 transition-all duration-300 min-w-[280px]"
                >
                  Consulta Personalizada
                </Button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-16 flex flex-wrap justify-center items-center gap-8 text-white/90"
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-floriana-amber rounded-full animate-pulse"></div>
                <span className="font-semibold">Servicio 24/7</span>
              </div>
              <div className="hidden md:block text-white/50">•</div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-floriana-peach rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span className="font-semibold">Asesoramiento Gratuito</span>
              </div>
              <div className="hidden md:block text-white/50">•</div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <span className="font-semibold">Garantía de Satisfacción</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer with Floriana styling */}
      <footer className="bg-gray-800/95 border-t border-floriana-orange-400/20 py-16 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/6 w-32 h-32 rounded-full bg-floriana-orange-500/5 blur-2xl animate-float-slow" />
          <div className="absolute bottom-1/4 right-1/6 w-24 h-24 rounded-full bg-floriana-coral/10 blur-xl animate-float" />
          <div className="pattern-dots absolute inset-0 opacity-5" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center space-x-2 mb-6"
              >
                <Image
                  src="/assets/logos/marconi_title.svg"
                  alt="Marconi Inmobiliaria"
                  width={140}
                  height={45}
                  className="h-8 w-auto brightness-110"
                />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-gray-300 mb-6 leading-relaxed text-lg"
              >
                La inmobiliaria líder en Reconquista, comprometida con encontrar
                el hogar perfecto para cada familia.
                <br />
                <span className="text-floriana-orange-300 font-semibold">Experiencia Floriana Premium.</span>
              </motion.p>
              
              {/* Social proof indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4 text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-floriana-amber rounded-full animate-pulse"></div>
                  <span className="text-floriana-amber font-medium">Desde 2010</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-floriana-coral rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <span className="text-floriana-coral font-medium">500+ Ventas</span>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-white font-bold mb-6 text-lg">Enlaces Rápidos</h3>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <Link
                    href="/propiedades"
                    className="hover:text-floriana-orange-300 transition-colors duration-300 flex items-center group"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Propiedades
                  </Link>
                </li>
                <li>
                  <Link
                    href="/agentes"
                    className="hover:text-floriana-orange-300 transition-colors duration-300 flex items-center group"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Agentes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contacto"
                    className="hover:text-floriana-orange-300 transition-colors duration-300 flex items-center group"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Contacto
                  </Link>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-white font-bold mb-6 text-lg">Contacto Directo</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-floriana-orange-400 flex-shrink-0" />
                  <span>Reconquista, Santa Fe</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-floriana-orange-400 rounded-full flex-shrink-0"></div>
                  <span>+54 9 3482 308100</span>
                </li>
                <li className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-floriana-orange-400 flex-shrink-0" />
                  <span className="text-sm">marconinegociosinmobiliarios@hotmail.com</span>
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="border-t border-floriana-orange-400/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <p className="text-gray-400 text-center md:text-left">
              &copy; 2025 Marconi Inmobiliaria. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Powered by</span>
              <span className="text-floriana-orange-300 font-semibold">Floriana Design</span>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
