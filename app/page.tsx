"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  Search,
  MapPin,
  Landmark,
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
import { FeaturedPropertiesSlider } from "@/components/FeaturedPropertiesSlider";
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
  
  // Parallax effects DISABLED to prevent elements escaping hero boundaries
  const { scrollY } = useScroll();
  // All transforms set to 0 to eliminate any movement
  const heroY = useTransform(scrollY, [0, 800], [0, 0]);
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 1]);
  const contentY = useTransform(scrollY, [0, 400], [0, 0]);
  const bottomY = useTransform(scrollY, [0, 500], [0, 0]);
  const scrollIndicatorY = useTransform(scrollY, [0, 300], [0, 0]);

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

      {/* HERO SECTION - LAYOUT MODERNO Y CONVERSIÓN */}
      <section className="relative min-h-screen overflow-hidden" style={{ contain: 'layout style paint', clipPath: 'inset(0)' }}>
        {/* Background con Parallax - Fixed overflow containment */}
        <motion.div 
          className="absolute inset-0 overflow-hidden"
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
            className="object-cover scale-105" // Further reduced scale to prevent overflow
            priority
          />
          
          {/* OVERLAY DINÁMICO AJUSTADO - NUEVAS OPACIDADES */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/0 to-black/80" />
          
          {/* EFECTO DIFUMINADO NARANJA AJUSTADO */}
          <div className="absolute inset-x-0 bottom-0 h-40 md:h-64 bg-gradient-to-t from-orange-600/80 via-orange-500/40 to-transparent" />
          
          {/* Overlay radial ajustado */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/0 to-black/25" />
        </motion.div>

        {/* CONTENIDO PRINCIPAL - LAYOUT UNIFICADO PARA TODOS LOS TAMAÑOS */}
        <div className="relative z-10 w-full min-h-screen flex flex-col overflow-hidden" style={{ contain: 'layout style', transform: 'translateY(-20vh)' }}>
          
          {/* CONTENIDO SUPERIOR - CLAIM CENTRADO */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-4">
              {/* CLAIM PRINCIPAL */}
              <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ y: contentY }}
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
            </div>
          </div>
          
          {/* CONTENIDO INFERIOR - LOGO + CTA POSICIONADO EN EL FONDO ABSOLUTO */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{ y: bottomY }}
            className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-6 sm:pb-8 lg:pb-10"
          >
            {/* LOGO RESPONSIVO AGRANDADO PARA DESKTOP */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.7, type: "spring", bounce: 0.3 }}
              className="mb-6 sm:mb-8"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl px-8 sm:px-10 lg:px-20 py-6 sm:py-7 lg:py-12 border border-white/20 shadow-2xl shadow-black/30">
                <Image
                  src="/assets/logos/marconi_header_orangewhite.png"
                  alt="Marconi Inmobiliaria"
                  width={900}
                  height={270}
                  className="h-20 sm:h-24 lg:h-36 w-auto opacity-95"
                />
              </div>
            </motion.div>
            
            {/* CTA PRIMARIO ÚNICO PARA TODOS LOS TAMAÑOS */}
            <Link href="/propiedades">
              <Button 
                size="lg"
                className="group bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold px-10 sm:px-11 lg:px-12 py-5 sm:py-5.5 lg:py-6 text-lg sm:text-xl rounded-full shadow-2xl shadow-orange-600/40 hover:shadow-orange-600/60 transition-all duration-300 hover:scale-105 border-0 min-w-[300px] sm:min-w-[320px] lg:min-w-[350px]"
              >
                <Search className="w-5 sm:w-5.5 lg:w-6 h-5 sm:h-5.5 lg:h-6 mr-3 sm:mr-3.5 lg:mr-4" />
                EXPLORAR PROPIEDADES
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="ml-3 sm:ml-3.5 lg:ml-4"
                >
                  <ArrowRight className="w-5 sm:w-5.5 lg:w-6 h-5 sm:h-5.5 lg:h-6" />
                </motion.div>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      {/* Propiedades Destacadas - PREMIUM DESIGN */}
      <section
        id="propiedades"
        className="section-premium relative overflow-hidden"
      >
        {/* Fondo dinámico con degradado y profundidad */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
          {/* Línea decorativa animada */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-0.5">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-orange-500/60 to-transparent animate-pulse" />
          </div>
          
          {/* Sombras suaves para profundidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
        </div>

        <div className="container-premium relative z-10">
          {/* Header Premium - ESPACIADO GENEROSO CON JERARQUÍA MEJORADA */}
          <div className="text-center mb-premium-xl group">
            {/* Título con jerarquía visual clara y microinteracciones */}
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 cursor-pointer"
            >
              <span className="hover:text-gray-200 transition-colors duration-300">PROPIEDADES</span>
              <br className="sm:hidden" />
              <span className="sm:ml-4"> </span>
              <motion.span 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 bg-clip-text text-transparent font-extrabold relative inline-block group-hover:from-orange-400 group-hover:via-orange-500 group-hover:to-red-400 transition-all duration-500"
                whileHover={{ scale: 1.05 }}
              >
                DESTACADAS
                {/* Subrayado animado */}
                <motion.div
                  className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full opacity-0 group-hover:opacity-100"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.span>
            </motion.h2>
            
            {/* Subtítulo más legible con tipografía y espaciado mejorado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center px-6 py-3 bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-700/50 hover:border-orange-500/30 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group/subtitle">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-4 group-hover/subtitle:bg-white transition-colors duration-300" />
                <p className="text-lg font-light text-gray-300 group-hover/subtitle:text-white transition-colors duration-300">
                  Hogares seleccionados con estándares de excelencia.
                </p>
              </div>
            </motion.div>
          </div>

          {loadingProperties ? (
            <div className="text-center py-premium-lg">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-support-gray/20 border-t-vibrant-orange mx-auto shadow-xl"></div>
              <p className="text-premium-primary mt-premium-md body-lg pulse-premium">Cargando propiedades...</p>
            </div>
          ) : (
            <>
              {/* SLIDER PROPIEDADES - DISEÑO ESTRATÉGICO PREMIUM */}
              <div className="max-w-7xl mx-auto">
                <FeaturedPropertiesSlider properties={featuredProperties} />
              </div>

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
                    Encontrá la propiedad perfecta para vos.
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* QUIÉNES SOMOS - Sección informativa con diseño consistente */}
      <section className="py-20 bg-gray-900 relative overflow-hidden">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Columna de texto */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-800/60 border border-gray-700/60 text-gray-200 text-sm">
              Conocé nuestro equipo
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              ¿Quiénes <span className="text-orange-500">somos?</span>
            </h2>
            <p className="text-lg text-gray-300">
              Somos <span className="font-semibold text-white">Marconi Inmobiliaria</span>, una empresa local que entiende tus
              necesidades. Conocemos Reconquista como la palma de nuestra mano y te acompañamos en cada paso.
            </p>
            <p className="text-lg text-gray-300">
              Con un enfoque joven y dinámico, nos especializamos en encontrar la propiedad perfecta para cada cliente,
              desde hogares familiares hasta inversiones estratégicas.
            </p>

            {/* Beneficios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-white/90 font-medium">Confianza local</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30">
                  <Landmark className="w-5 h-5" />
                </div>
                <span className="text-white/90 font-medium">Conocimiento del mercado</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-white/90 font-medium">Atención personalizada</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-white/90 font-medium">Experiencia comprobada</span>
              </div>
            </div>

            <Link href="/agentes">
              <Button 
                size="lg" 
                className="mt-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold px-8 py-4 rounded-full shadow-2xl shadow-orange-600/30 hover:shadow-orange-600/50 transition-all duration-300 group border-0 w-fit"
              >
                Conocé más
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="ml-3"
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Button>
            </Link>
          </motion.div>

          {/* Columna imagen */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rotate-[-4deg]">
              <div className="rounded-3xl border-4 border-orange-500/30 p-2 bg-orange-500/10">
                <div className="rounded-2xl overflow-hidden bg-gray-800">
                  <Image
                    src={
                      getOptimizedImageUrl("gustavo_vdczse", { width: 900, height: 600, gravity: "face", format: "auto", quality: "auto" }) || "/placeholder.svg"
                    }
                    alt="Foto de Gustavo Marconi"
                    width={900}
                    height={600}
                    className="w-full h-[360px] md:h-[420px] object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Tarjeta de nombre */}
            <div className="absolute -bottom-6 left-6 bg-black/80 text-white rounded-xl px-4 py-3 shadow-2xl border border-white/10">
              <div className="font-semibold">Gustavo Marconi</div>
              <div className="text-sm text-gray-300">Fundador & Agente Principal</div>
              <div className="text-orange-400 text-xs">★★★★★</div>
            </div>
          </motion.div>
        </div>
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
                  src="/assets/logos/marconi_header_orangewhite.png"
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
