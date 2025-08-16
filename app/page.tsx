"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView, useSpring, AnimatePresence } from "framer-motion";
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
  Sparkles,
  TrendingUp,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import Link from "next/link";
import Image from "next/image";

// Importar servicios
import { useIsClient } from "@/hooks/use-is-client";
import { PropertyService } from "@/services/properties";
import type { Property } from "@/lib/supabase";
import { MapThumbnail } from "@/components/MapThumbnail";
import { FloatingParticles } from "@/components/ui/floating-particles";

export default function HomePage() {
  const [currentStat, setCurrentStat] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [typingText, setTypingText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);
  const isClient = useIsClient();
  
  // Refs para animaciones
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const propertiesRef = useRef(null);
  const ctaRef = useRef(null);
  
  // Scroll animations
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
  const textY = useTransform(scrollYProgress, [0, 0.5], ["0%", "30%"]);
  
  // Spring animations
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);
  
  // View detection
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const propertiesInView = useInView(propertiesRef, { once: true, amount: 0.1 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 });

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
    { number: "500+", label: "Propiedades Vendidas", icon: Home },
    { number: "1000+", label: "Clientes Satisfechos", icon: Heart },
    { number: "15+", label: "Años de Experiencia", icon: Award },
    { number: "4.9", label: "Calificación Promedio", icon: Star },
  ];
  
  const fullText = "Viví la experiencia de encontrar tu lugar en el mundo";
  
  // Animaciones avanzadas variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 120
      }
    }
  };
  
  const cardHoverVariants = {
    rest: { scale: 1, rotateZ: 0 },
    hover: { 
      scale: 1.02,
      rotateZ: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17
      }
    }
  };
  
  const gradientVariants = {
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };
  
  const heroVariants = {
    initial: { opacity: 0, scale: 1.1 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 1.2,
        ease: "easeOut"
      }
    }
  };
  
  const particleVariants = {
    animate: {
      y: [-100, -200],
      x: [0, 50],
      opacity: [0, 1, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

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

  // Typing effect mejorado
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypingText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setTimeout(() => setShowCursor(false), 1000);
      }
    }, 80);
    return () => clearInterval(timer);
  }, []);
  
  // Generar partículas flotantes
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 4
      }));
      setParticles(newParticles);
    };
    
    generateParticles();
    const interval = setInterval(generateParticles, 8000);
    return () => clearInterval(interval);
  }, []);
  
  // Mouse movement effect
  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
      x.set(ev.clientX);
      y.set(ev.clientY);
    };
    
    if (isClient) {
      window.addEventListener('mousemove', updateMousePosition);
      return () => window.removeEventListener('mousemove', updateMousePosition);
    }
  }, [isClient, x, y]);
  
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
      {/* Progress bar de navegación */}
      <motion.div 
        className="nav-progress"
        style={{ scaleX: scrollYProgress }}
      />
      
      {/* Header con efectos mejorados */}
      <header className="bg-gray-900/80 glass-dark border-b border-gray-700/20 sticky top-0 z-50">
        <div className="w-full px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/logos/marconi_header_orangewhite.png"
                alt="Marconi Inmobiliaria"
                width={120}
                height={40}
                className="h-8 w-auto transition-opacity duration-300 ease-out hover:opacity-80"
                priority
              />
            </Link>

            {/* Desktop Navigation con efectos mejorados */}
            <nav className="hidden md:flex items-center space-x-12">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/propiedades"
                  className="text-gray-300 hover:text-white transition-all duration-300 ease-out relative group font-medium tracking-wide interactive-highlight"
                >
                  PROPIEDADES
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300 ease-out group-hover:w-full"></span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/agentes"
                  className="text-gray-300 hover:text-white transition-all duration-300 ease-out relative group font-medium tracking-wide interactive-highlight"
                >
                  AGENTES
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300 ease-out group-hover:w-full"></span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/contacto"
                  className="text-gray-300 hover:text-white transition-all duration-300 ease-out relative group font-medium tracking-wide interactive-highlight"
                >
                  CONTACTO
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300 ease-out group-hover:w-full"></span>
                </Link>
              </motion.div>
            </nav>

            {/* Mobile Search Bar */}
            <div className="md:hidden flex-1 max-w-xs ml-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar propiedades..."
                  className="pl-10 h-10 bg-gray-800/60 border-gray-700/30 text-white placeholder:text-gray-400 text-sm focus:border-orange-500 transition-all duration-300 ease-out backdrop-blur-sm"
                />
              </div>
            </div>
          </div>
        </div>

      </header>

      {/* Hero Section mejorado */}
      <section className="relative h-[100vh] flex flex-col overflow-hidden">
        {/* Partículas flotantes */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="particle absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            variants={particleVariants}
            animate="animate"
            transition={{ delay: particle.delay }}
          />
        ))}
        
        {/* Background Image con parallax */}
        <motion.div 
          className="absolute inset-0"
          style={{ y: yBg, scale }}
        >
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
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50" />
          <div className="absolute inset-0 hero-gradient" />
        </motion.div>

        {/* Content con animaciones avanzadas */}
        <motion.div 
          className="relative z-10 h-full flex flex-col justify-center items-center px-8"
          style={{ y: textY }}
        >
          {/* Hero text con efectos inmersivos */}
          <div className="flex-1 flex items-center justify-center w-full">
            <motion.div
              variants={heroVariants}
              initial="initial"
              animate="animate"
              className="text-center max-w-4xl"
            >
              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-6 tracking-wide leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="inline-block">
                  {typingText}
                  {showCursor && <span className="typing-cursor text-orange-500">|</span>}
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl lg:text-3xl text-gray-200 font-light tracking-wide opacity-90 gradient-text-animated"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                Inmobiliaria de confianza en Reconquista
              </motion.p>
              
              <motion.div
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <Link href="/propiedades">
                  <Button 
                    size="lg" 
                    className="btn-premium btn-micro hover-glow-orange px-8 py-4 text-lg"
                  >
                    Explorar Propiedades
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </Button>
                </Link>
                <Link href="/contacto">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="glass border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg btn-micro"
                  >
                    Contactar Ahora
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Company Branding at Bottom con animación */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.6, duration: 0.8, type: "spring" }}
            className="mb-12 text-center"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src="/assets/logos/marconi_header_orangewhite.png"
                alt="Marconi Inmobiliaria"
                width={300}
                height={90}
                className="h-16 w-auto mx-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
              />
            </motion.div>
          </motion.div>
          
          {/* Scroll indicator animado */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <motion.div
                className="w-1 h-3 bg-orange-500 rounded-full mt-2"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </section>
      {/* Propiedades Destacadas - CONECTADO CON BACKEND */}
      <section
        id="propiedades"
        className="py-24 bg-gray-900 relative"
      >
        <div className="container mx-auto px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h2 
              className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-8 tracking-wide"
              variants={itemVariants}
            >
              PROPIEDADES{" "}
              <span className="gradient-text-animated font-medium text-shadow-lg">
                DESTACADAS
              </span>
            </motion.h2>
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Las mejores oportunidades de inversión en Reconquista
            </motion.p>
          </motion.div>

          {loadingProperties ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="relative">
                <motion.div 
                  className="w-12 h-12 border-2 border-gray-600 border-t-orange-500 rounded-full mx-auto"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-0 w-12 h-12 border border-orange-500/20 rounded-full mx-auto"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <motion.p 
                className="text-gray-300 mt-6 font-light text-lg"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Cargando propiedades...
              </motion.p>
            </motion.div>
          ) : (
            <>
              <motion.div 
                className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
              >
                {featuredProperties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    variants={itemVariants}
                    className="h-full"
                  >
                    <Card
                      className="glass-dark border border-gray-700/20 overflow-hidden group transition-all duration-500 ease-out h-full flex flex-col hover-glow-orange card-3d"
                    >
                      <div className="relative overflow-hidden group">
                      <Link href={`/propiedades/${property.id}`}>
                        <motion.div 
                          className="relative cursor-pointer h-56"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          {property.images && property.images.length > 0 ? (
                            <Image
                              src={property.images[0]}
                              alt={property.title}
                              fill
                              className="object-cover transition-all duration-500 ease-out group-hover:scale-110"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                              <motion.div 
                                className="text-gray-400 text-center"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <div className="w-16 h-16 bg-gray-600 rounded mx-auto mb-3"></div>
                                <p>Sin imagen</p>
                              </motion.div>
                            </div>
                          )}
                          
                          {/* Overlay con gradiente */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          {/* Badge animado */}
                          <motion.div 
                            className="absolute top-4 left-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                          >
                            <motion.span 
                              className="glass-orange text-white px-4 py-2 rounded-full font-medium text-sm"
                              whileHover={{ scale: 1.1 }}
                              transition={{ type: "spring", stiffness: 400 }}
                            >
                              {property.operation_type === "venta" ? "VENTA" : "ALQUILER"}
                            </motion.span>
                          </motion.div>
                          
                          {/* Ícono de favorito interactivo */}
                          <motion.div 
                            className="absolute top-4 right-4"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              className="glass p-2 hover:bg-white/20"
                            >
                              <Heart className="w-5 h-5 text-white" />
                            </Button>
                          </motion.div>
                        </motion.div>
                      </Link>
                      </div>

                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="mb-6">
                        <Link href={`/propiedades/${property.id}`}>
                          <motion.h3 
                            className="text-white text-xl mb-3 cursor-pointer font-medium leading-tight interactive-highlight"
                            whileHover={{ 
                              color: "rgb(249 115 22)",
                              scale: 1.02
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            {property.title}
                          </motion.h3>
                        </Link>
                        <div className="flex items-center text-gray-400 mb-4">
                          <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                          <span className="font-light">{property.neighborhood}, Reconquista</span>
                        </div>
                        <motion.div 
                          className="text-2xl font-light text-white"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <span className="gradient-text-animated">
                            {property.currency}$ {property.price.toLocaleString()}
                          </span>
                          {property.operation_type === "alquiler" && (
                            <span className="text-gray-400 text-base ml-2">/ mes</span>
                          )}
                        </motion.div>
                      </div>

                      <div className="flex-1">
                        {/* Property Details */}
                        {(property.bedrooms ||
                          property.bathrooms ||
                          property.area_m2) && (
                          <div className="flex items-center gap-6 text-gray-300 mb-6">
                            {property.bedrooms && (
                              <div className="flex items-center">
                                <Bed className="w-4 h-4 mr-2 text-orange-500" />
                                <span className="font-light">
                                  {property.bedrooms} hab
                                </span>
                              </div>
                            )}
                            {property.bathrooms && (
                              <div className="flex items-center">
                                <Bath className="w-4 h-4 mr-2 text-orange-500" />
                                <span className="font-light">
                                  {property.bathrooms} baños
                                </span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <Square className="w-4 h-4 mr-2 text-orange-500" />
                              <span className="font-light">
                                {property.area_m2}m²
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Features */}
                        {property.features && property.features.length > 0 && (
                          <div className="mb-6">
                            <div className="flex flex-wrap gap-2">
                              {property.features.slice(0, 2).map((feature, i) => (
                                <span
                                  key={i}
                                  className="text-gray-400 text-sm font-light"
                                >
                                  {feature}
                                </span>
                              ))}
                              {property.features.length > 2 && (
                                <span className="text-gray-500 text-sm font-light">
                                  +{property.features.length - 2} características
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Button con micro-interacción */}
                      <div className="pt-4 border-t border-gray-700/20 mt-auto">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            className="w-full btn-premium btn-micro font-medium text-lg py-3"
                            onClick={() => handlePropertyInterest(property)}
                          >
                            Ver detalles
                            <motion.div
                              className="ml-2 inline-block"
                              whileHover={{ x: 5 }}
                              transition={{ type: "spring", stiffness: 400 }}
                            >
                              <ArrowRight className="w-4 h-4" />
                            </motion.div>
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

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
                className="text-center mt-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <Link href="/propiedades">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="glass border-orange-500/50 text-orange-500 hover:bg-orange-500/10 bg-transparent btn-micro hover-glow-orange px-8 py-4 text-lg"
                    >
                      Ver todas las propiedades
                      <motion.div
                        className="ml-2 inline-block"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* Stats Section con efectos inmersivos */}
      <section className="py-24 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(249,115,22,0.15) 1px, transparent 0)',
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        <div className="container mx-auto px-8 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-4xl mx-auto"
          >
            {[
              { number: "500+", label: "Propiedades Vendidas", icon: Home },
              { number: "1000+", label: "Clientes Satisfechos", icon: Heart },
              { number: "15+", label: "Años de Experiencia", icon: Award },
              { number: "4.9", label: "Calificación Promedio", icon: Star },
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.1,
                    rotateY: 10,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  className="text-center group cursor-pointer"
                >
                  <motion.div className="glass-orange p-6 rounded-2xl">
                    <motion.div
                      className="text-orange-500 mb-3 flex justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <IconComponent className="w-8 h-8" />
                    </motion.div>
                    <motion.div 
                      className="text-4xl lg:text-5xl font-light text-white mb-3 gradient-text-animated"
                      whileHover={{ scale: 1.1 }}
                    >
                      {stat.number}
                    </motion.div>
                    <div className="text-gray-300 font-light text-sm tracking-wide">
                      {stat.label}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Mini Map Section con efectos */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-black relative">
        <div className="container mx-auto px-8">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div variants={itemVariants}>
              <motion.h2 
                className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-6 tracking-wide"
                whileInView={{ scale: [0.9, 1] }}
                transition={{ duration: 0.5 }}
              >
                Nuestra{" "}
                <span className="gradient-text-animated font-medium">
                  Ubicación
                </span>
              </motion.h2>
              <motion.p 
                className="text-gray-300 mb-6 text-lg leading-relaxed"
                variants={itemVariants}
              >
                <MapPin className="inline w-5 h-5 text-orange-500 mr-2" />
                Jorge Newbery 1562, Reconquista, Santa Fe, Argentina
              </motion.p>
              <Link href="/contacto">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="btn-premium btn-micro px-8 py-3 text-lg">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Contactanos
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
            <motion.div 
              className="glass-dark rounded-2xl overflow-hidden border border-gray-700/30 hover-glow-orange"
              variants={itemVariants}
              whileHover={{ scale: 1.02, rotateY: 5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative h-64 md:h-80 overflow-hidden">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="h-full"
                >
                  <MapThumbnail
                    query="Jorge Newbery 1562, Reconquista, Santa Fe, Argentina"
                    title="Ubicación de Marconi Inmobiliaria"
                  />
                </motion.div>
              </div>
              <div className="p-4 text-right">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    className="glass border-gray-600/50 text-gray-300 hover:text-white btn-micro"
                    onClick={() => window.open("https://www.google.com/maps/search/?api=1&query=Jorge%20Newbery%201562%2C%20Reconquista%2C%20Santa%20Fe%2C%20Argentina")}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver en Google Maps
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section con efectos avanzados */}
      <section className="py-24 bg-gradient-to-br from-orange-600 via-orange-500 to-orange-700 relative overflow-hidden">
        {/* Partículas de fondo */}
        <div className="absolute inset-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-8 text-center relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <motion.h2 
              className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-8 tracking-wide leading-tight"
              variants={itemVariants}
            >
              ¿Listo para encontrar tu{" "}
              <span className="gradient-text-animated font-medium">
                próximo hogar
              </span>?
            </motion.h2>
            <motion.p 
              className="text-lg md:text-xl text-orange-100 mb-10 font-light leading-relaxed"
              variants={itemVariants}
            >
              Nuestro equipo de expertos está aquí para ayudarte en cada paso del camino
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center"
              variants={itemVariants}
            >
              <Link href="/propiedades">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="bg-white text-orange-600 hover:bg-gray-100 font-medium px-10 py-4 btn-micro hover-glow-orange text-lg"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Explorar Propiedades
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/contacto">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="glass border-white/30 text-white hover:bg-white/10 font-medium px-10 py-4 btn-micro text-lg"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Contactar Agente
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800/30 py-16">
        <div className="container mx-auto px-8">
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
    </div>
  );
}
