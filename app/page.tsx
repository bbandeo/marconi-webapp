"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
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
import Header from "@/components/Header";

// Importar servicios
import { useIsClient } from "@/hooks/use-is-client";
import { PropertyService } from "@/services/properties";
import type { Property } from "@/lib/supabase";

// Componente para animación de contador
function CounterAnimation({ value, label, icon: Icon }: { value: string, label: string, icon: any }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      const numericValue = parseInt(value.replace(/\D/g, ''));
      let start = 0;
      const duration = 2000;
      const increment = numericValue / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= numericValue) {
          setCount(numericValue);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  const displayValue = isInView ? 
    (value.includes('+') ? `${count}+` : 
     value.includes('%') ? `${count}%` : 
     value.includes('.') ? value : 
     count.toString()) : '0';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="text-center group"
    >
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-600 to-red-600 rounded-full mb-6 shadow-xl shadow-orange-600/30 group-hover:shadow-orange-600/50 transition-all duration-300"
      >
        <Icon className="h-12 w-12 text-white" />
      </motion.div>
      <motion.div 
        className="text-4xl font-bold text-white mb-3"
        animate={isInView ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {displayValue}
      </motion.div>
      <div className="text-gray-300 text-lg font-medium">{label}</div>
    </motion.div>
  );
}

export default function HomePage() {
  const [currentStat, setCurrentStat] = useState(0);
  const isClient = useIsClient();
  
  // Parallax effect para el hero
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, -300]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.7]);

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
    <div className="min-h-screen bg-premium-main">
      {/* Header Premium */}
      <Header />

      {/* HERO SECTION - LAYOUT MODERNO Y CONV ERSIÓN */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background con Parallax */}
        <motion.div 
          className="absolute inset-0"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <Image
            src={
              getOptimizedImageUrl("IMG_2850_c7gzcr", {
                width: 1920,
                height: 1080,
                gravity: "south",
                quality: "auto",
                format: "auto",
                saturation: 10, // Mejorar saturación
                contrast: 10,   // Mejorar contraste
              }) || "/placeholder.svg"
            }
            alt="Reconquista - Marconi Inmobiliaria"
            fill
            className="object-cover scale-105" // Ligera escala para efecto parallax
            priority
          />
          
          {/* OVERLAY DINÁMICO - DEGRADADO TOP TO BOTTOM */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
          
          {/* EFECTO DIFUMINADO NARANJA RECUPERADO */}
          <div className="absolute inset-x-0 bottom-0 h-40 md:h-64 bg-gradient-to-t from-orange-600/80 via-orange-500/40 to-transparent" />
          
          {/* Overlay adicional para mejor contraste en el centro */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/40" />
        </motion.div>

        {/* CONTENIDO PRINCIPAL - LAYOUT DIFERENCIADO MOBILE/DESKTOP */}
        <div className="relative z-10 w-full h-full flex flex-col">
          
          {/* CONTENIDO SUPERIOR - CLAIM CENTRADO */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-4">
              {/* CLAIM PRINCIPAL */}
              <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="mb-8 lg:mb-0"
              >
                <div className="relative inline-block">
                  <Image
                    src="/assets/impact_text/vivilaexperiencia.PNG"
                    alt="Viví la experiencia de encontrar tu lugar en el mundo"
                    width={1000}
                    height={250}
                    className="w-full max-w-[90%] sm:max-w-3xl lg:max-w-4xl h-auto"
                    priority
                  />
                  <div className="absolute -inset-2 lg:-inset-4 bg-gradient-to-r from-orange-600/10 via-transparent to-red-600/10 rounded-2xl lg:rounded-3xl blur-2xl lg:blur-3xl -z-10" />
                </div>
              </motion.div>
              
              {/* SUBTÍTULO - SOLO MOBILE */}
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="lg:hidden text-lg sm:text-xl text-white/90 font-light max-w-xl mx-auto mb-12 leading-relaxed"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                Más de 200 propiedades premium en las mejores ubicaciones de Reconquista
              </motion.p>
              
              {/* CTAs MOBILE - AMBOS BOTONES */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="lg:hidden flex flex-col gap-4 justify-center items-center mb-16"
              >
                <Link href="/propiedades">
                  <Button 
                    size="lg"
                    className="group bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold px-8 py-5 text-base rounded-full shadow-2xl shadow-orange-600/40 hover:shadow-orange-600/60 transition-all duration-300 hover:scale-105 border-0 w-full min-w-[280px]"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    EXPLORAR PROPIEDADES
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="ml-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </Button>
                </Link>
                
                <Link href="/contacto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="group border-2 border-white/80 text-white hover:bg-white hover:text-gray-900 px-8 py-5 text-base font-bold rounded-full bg-transparent backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-xl shadow-black/20 w-full min-w-[280px]"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    CONTACTAR AGENTE
                  </Button>
                </Link>
              </motion.div>
              
              {/* LOGO MOBILE */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.7, type: "spring", bounce: 0.3 }}
                className="lg:hidden inline-block"
              >
                <div className="bg-white/10 backdrop-blur-md rounded-xl px-6 py-4 border border-white/20 shadow-2xl shadow-black/30">
                  <Image
                    src="/assets/logos/marconi_header_orangewhite.png"
                    alt="Marconi Inmobiliaria"
                    width={300}
                    height={90}
                    className="h-12 sm:h-16 w-auto opacity-95"
                  />
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* CONTENIDO INFERIOR - DESKTOP SOLO: LOGO + CTA CON PADDING GENEROSO */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="hidden lg:flex flex-col items-center pb-20"
          >
            {/* LOGO AGRANDADO DESKTOP */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.7, type: "spring", bounce: 0.3 }}
              className="mb-8"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-12 py-8 border border-white/20 shadow-2xl shadow-black/30">
                <Image
                  src="/assets/logos/marconi_header_orangewhite.png"
                  alt="Marconi Inmobiliaria"
                  width={500}
                  height={150}
                  className="h-28 w-auto opacity-95"
                />
              </div>
            </motion.div>
            
            {/* SOLO CTA PRIMARIO DESKTOP */}
            <Link href="/propiedades">
              <Button 
                size="lg"
                className="group bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold px-12 py-6 text-xl rounded-full shadow-2xl shadow-orange-600/40 hover:shadow-orange-600/60 transition-all duration-300 hover:scale-105 border-0 min-w-[350px]"
              >
                <Search className="w-6 h-6 mr-4" />
                EXPLORAR PROPIEDADES
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="ml-4"
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.div>
              </Button>
            </Link>
          </motion.div>
        </div>
        
        {/* INDICADOR DE SCROLL SUTIL - SOLO MOBILE */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="lg:hidden absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
          >
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </motion.div>
        </motion.div>
      </section>
      {/* Propiedades Destacadas - PREMIUM DESIGN */}
      <section
        id="propiedades"
        className="section-premium bg-premium-main relative overflow-hidden"
      >
        <div className="container-premium relative z-10">
          {/* Header Premium - ESPACIADO GENEROSO */}
          <div className="text-center mb-premium-xl">
            <h2 className="display-lg text-premium-primary mb-premium-md">
              PROPIEDADES <span className="accent-premium">DESTACADAS</span>
            </h2>
            <p className="body-lg text-premium-secondary max-w-2xl mx-auto">
              Selección exclusiva de propiedades premium en ubicaciones estratégicas
            </p>
          </div>

          {loadingProperties ? (
            <div className="text-center py-premium-lg">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-support-gray/20 border-t-vibrant-orange mx-auto shadow-xl"></div>
              <p className="text-premium-primary mt-premium-md body-lg pulse-premium">Cargando propiedades...</p>
            </div>
          ) : (
            <>
              {/* GRID PROPIEDADES - DISEÑO ESTRATÉGICO PREMIUM */}
              <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
                {featuredProperties.slice(0, 6).map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <Card className="group overflow-hidden bg-gray-800/50 border border-gray-700/30 backdrop-blur-sm hover:border-orange-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 cursor-pointer">
                      {/* IMAGEN CON OVERLAYS ESTRATÉGICOS */}
                      <Link href={`/propiedades/${property.id}`}>
                        <div className="relative overflow-hidden h-80 md:h-96">
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
                                <Home className="w-16 h-16 mx-auto mb-4 opacity-40" />
                                <p className="text-sm font-medium">Sin imagen disponible</p>
                              </div>
                            </div>
                          )}

                          {/* Gradiente inferior para destacar precio */}
                          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          
                          {/* PILL BADGE - VENTA/ALQUILER CON GRADIENTE */}
                          <div className="absolute top-6 left-6">
                            <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50 transition-shadow duration-300 backdrop-blur-sm">
                              {property.operation_type === "venta" ? "VENTA" : "ALQUILER"}
                            </div>
                          </div>

                          {/* PRECIO EN OVERLAY - TIPOGRAFÍA BOLD */}
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="absolute bottom-6 right-6 text-right"
                          >
                            <div className="bg-black/70 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10">
                              <div className="text-2xl font-bold text-white mb-1">
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
                      <CardContent className="p-8">
                        <Link href={`/propiedades/${property.id}`}>
                          {/* TÍTULO CON JERARQUÍA CLARA */}
                          <h3 className="text-xl font-bold text-white mb-4 hover:text-orange-400 transition-colors cursor-pointer line-clamp-2 leading-tight">
                            {property.title}
                          </h3>
                          
                          {/* UBICACIÓN - GRIS CLARO LEGIBLE */}
                          <div className="flex items-center text-gray-300 mb-6">
                            <MapPin className="w-5 h-5 mr-3 text-orange-400" />
                            <span className="text-base font-medium">{property.neighborhood}, Reconquista</span>
                          </div>
                          
                          {/* CARACTERÍSTICAS SI ESTÁN DISPONIBLES */}
                          {(property.bedrooms || property.bathrooms || property.area_m2) && (
                            <div className="flex items-center gap-4 text-gray-400 text-sm">
                              {property.bedrooms && (
                                <div className="flex items-center bg-gray-700/50 px-3 py-2 rounded-lg">
                                  <Bed className="w-4 h-4 mr-2 text-orange-400" />
                                  <span className="font-medium">{property.bedrooms}</span>
                                </div>
                              )}
                              {property.bathrooms && (
                                <div className="flex items-center bg-gray-700/50 px-3 py-2 rounded-lg">
                                  <Bath className="w-4 h-4 mr-2 text-orange-400" />
                                  <span className="font-medium">{property.bathrooms}</span>
                                </div>
                              )}
                              {property.area_m2 && (
                                <div className="flex items-center bg-gray-700/50 px-3 py-2 rounded-lg">
                                  <Square className="w-4 h-4 mr-2 text-orange-400" />
                                  <span className="font-medium">{property.area_m2}m²</span>
                                </div>
                              )}
                            </div>
                          )}
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {featuredProperties.length === 0 && (
                <div className="text-center py-premium-xl">
                  <Home className="w-16 h-16 text-premium-secondary mx-auto mb-premium-md opacity-40" />
                  <h3 className="heading-lg text-premium-primary mb-premium-sm">
                    Propiedades en preparación
                  </h3>
                  <p className="body-md text-premium-secondary">
                    Estamos seleccionando las mejores propiedades para ti
                  </p>
                </div>
              )}

              {/* CTA PREMIUM - BOTÓN FULL WIDTH LLAMATIVO */}
              {featuredProperties.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center mt-16"
                >
                  <Link href="/propiedades">
                    <Button 
                      size="lg" 
                      className="w-full max-w-md bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl shadow-orange-600/30 hover:shadow-orange-600/50 transition-all duration-300 hover:scale-105 group border-0"
                    >
                      VER TODO EL CATÁLOGO
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="ml-3"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </Button>
                  </Link>
                  <p className="text-gray-300 mt-4 text-lg font-medium">
                    Más de 200 propiedades premium disponibles
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* STATS SECTION - DINÁMICO CON ANIMACIONES DE CONTADOR */}
      <section className="py-20 bg-gray-900 relative overflow-hidden">
        {/* Separador decorativo con líneas sutiles */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
        
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              RESULTADOS QUE <span className="text-orange-500">HABLAN</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              La confianza de nuestros clientes respalda nuestra trayectoria
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <CounterAnimation value="500+" label="Propiedades Vendidas" icon={Home} />
            <CounterAnimation value="1000+" label="Clientes Satisfechos" icon={Users} />
            <CounterAnimation value="15+" label="Años de Experiencia" icon={Award} />
            <CounterAnimation value="4.9" label="Calificación Promedio" icon={Star} />
          </div>

          {/* Líneas divisorias sutiles entre métricas */}
          <div className="hidden md:block absolute inset-0 pointer-events-none">
            <div className="container mx-auto px-4 h-full flex items-center">
              <div className="w-full relative">
                <div className="absolute left-1/4 top-1/2 w-px h-24 bg-gradient-to-b from-transparent via-gray-600/30 to-transparent transform -translate-y-1/2" />
                <div className="absolute left-2/4 top-1/2 w-px h-24 bg-gradient-to-b from-transparent via-gray-600/30 to-transparent transform -translate-y-1/2" />
                <div className="absolute left-3/4 top-1/2 w-px h-24 bg-gradient-to-b from-transparent via-gray-600/30 to-transparent transform -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Separador decorativo inferior */}
        <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
      </section>

      {/* CTA SECTION - GRADIENTE DIAGONAL PREMIUM */}
      <section className="py-20 bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 relative overflow-hidden">
        {/* Patrón de textura sutil */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.1) 2px,
              rgba(255,255,255,0.1) 4px
            )`
          }} />
        </div>
        
        {/* Elementos decorativos flotantes */}
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 w-32 h-32 rounded-full bg-white/5 backdrop-blur-sm"
        />
        <motion.div 
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-20 w-24 h-24 rounded-full bg-white/5 backdrop-blur-sm"
        />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tight"
              style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
            >
              COMENZÁ TU BÚSQUEDA
              <span className="block text-4xl md:text-5xl font-bold mt-2">HOY MISMO</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto font-medium leading-relaxed"
            >
              Acompañamiento profesional premium para encontrar la propiedad perfecta que transforme tu vida
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link href="/propiedades">
                <Button
                  size="lg"
                  className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-4 text-lg font-bold rounded-full shadow-2xl shadow-black/30 hover:shadow-black/50 transition-all duration-300 hover:scale-105 border-2 border-white/20 hover:border-white/40 min-w-[280px]"
                >
                  EXPLORAR PROPIEDADES
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="ml-3"
                  >
                    <ArrowRight className="h-6 w-6" />
                  </motion.div>
                </Button>
              </Link>
              
              <Link href="/contacto">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 text-lg font-bold rounded-full bg-transparent backdrop-blur-sm hover:scale-105 transition-all duration-300 shadow-xl min-w-[280px]"
                >
                  CONTACTAR EXPERTO
                </Button>
              </Link>
            </motion.div>

            {/* Elemento decorativo inferior */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
              className="mt-12"
            >
              <div className="w-24 h-1 bg-white/40 mx-auto rounded-full" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SEPARADOR WAVE DIVIDER */}
      <div className="relative">
        <svg 
          className="w-full h-24 text-gray-900" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,40 C300,120 900,0 1200,40 L1200,120 L0,120 Z" />
        </svg>
      </div>

      {/* Footer - PREMIUM DESIGN */}
      <footer className="bg-gray-900 pt-8 pb-16 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <Image
                  src="/assets/logos/marconi_title.svg"
                  alt="Marconi Inmobiliaria"
                  width={140}
                  height={45}
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-lg text-gray-300 mb-6 max-w-md leading-relaxed">
                Experiencia premium en bienes raíces. Comprometidos con encontrar 
                la propiedad perfecta para cada familia.
              </p>
              
              {/* Iconos de redes sociales minimalistas */}
              <div className="flex space-x-4">
                <div className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:border-orange-500 hover:bg-orange-500/10 transition-all duration-300 cursor-pointer group">
                  <div className="w-4 h-4 bg-gray-400 group-hover:bg-orange-500 transition-colors duration-300 rounded-sm"></div>
                </div>
                <div className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:border-orange-500 hover:bg-orange-500/10 transition-all duration-300 cursor-pointer group">
                  <div className="w-4 h-4 bg-gray-400 group-hover:bg-orange-500 transition-colors duration-300 rounded-sm"></div>
                </div>
                <div className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:border-orange-500 hover:bg-orange-500/10 transition-all duration-300 cursor-pointer group">
                  <div className="w-4 h-4 bg-gray-400 group-hover:bg-orange-500 transition-colors duration-300 rounded-sm"></div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-6">Enlaces</h3>
              <ul className="space-y-4 text-gray-300">
                <li>
                  <Link
                    href="/propiedades"
                    className="text-base hover:text-orange-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    Propiedades
                  </Link>
                </li>
                <li>
                  <Link
                    href="/agentes"
                    className="text-base hover:text-orange-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    Agentes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contacto"
                    className="text-base hover:text-orange-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-6">Contacto</h3>
              <ul className="space-y-4 text-gray-300">
                <li className="text-base">📍 Reconquista, Santa Fe</li>
                <li className="text-base">📞 +54 9 3482 308100</li>
                <li className="text-base">✉️ marconinegociosinmobiliarios@hotmail.com</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700/50 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-base">
              &copy; 2025 Marconi Inmobiliaria. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
