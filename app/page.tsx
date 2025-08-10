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
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 shadow-md">
        <div className="w-full px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/assets/logos/marconi_header_orangewhite.png"
                alt="Marconi Inmobiliaria"
                width={140}
                height={45}
                className="h-8 md:h-10 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/propiedades"
                className="text-gray-300 hover:text-white transition-colors"
              >
                PROPIEDADES
              </Link>
              <Link
                href="/agentes"
                className="text-gray-300 hover:text-white transition-colors"
              >
                AGENTES
              </Link>
              <Link
                href="/contacto"
                className="text-gray-300 hover:text-white transition-colors"
              >
                CONTACTO
              </Link>
            </nav>

            {/* Mobile Search Bar */}
            <div className="md:hidden flex-1 max-w-xs ml-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar propiedades..."
                  className="pl-10 h-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 text-sm focus:border-brand-orange"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Decorative divider line */}
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-lg"></div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[92vh] flex flex-col">
        {/* Background Image */}
        <div className="absolute inset-0">
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
            className="object-cover"
            priority
          />
          {/* Subtle dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center">
          {/* Centered Impact Text */}
          <div className="flex-1 flex items-center justify-center w-full">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full"
            >
              <div
                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                className="w-full p-20 flex justify-center"
              >
                <Image
                  src="/assets/impact_text/vivilaexperiencia.PNG"
                  alt="Viví la experiencia de encontrar tu lugar en el mundo"
                  width={800}
                  height={200}
                  priority
                />
              </div>
            </motion.div>
          </div>

          {/* Company Branding at Bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.4 }}
            className="mb-8 text-center px-4"
          >
            <Image
              src="/assets/logos/marconi_header_orangewhite.png"
              alt="Marconi Inmobiliaria"
              width={400}
              height={120}
              className="h-24 md:h-26 w-auto mx-auto opacity-90 mb-3"
            />
          </motion.div>
        </div>
      </section>

      {/* Decorative Separator */}
      <section className="relative overflow-hidden bg-gray-900">
        {/* Animated wave separator */}
        <div className="relative h-24 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
          {/* Top wave */}
          <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
            <svg
              className="relative block w-full h-12"
              data-name="Layer 1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                opacity=".25"
                className="fill-black"
              ></path>
              <path
                d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                opacity=".5"
                className="fill-black"
              ></path>
              <path
                d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
                className="fill-black"
              ></path>
            </svg>
          </div>

          {/* Central decorative element */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-4">
              {/* Left line */}
              <div className="w-20 h-px bg-gradient-to-r from-transparent to-orange-500/60"></div>
              
              {/* Central icon */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                  <Home className="w-6 h-6 text-white" />
                </div>
                {/* Pulsing ring */}
                <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-orange-400/30 animate-ping"></div>
              </div>
              
              {/* Right line */}
              <div className="w-20 h-px bg-gradient-to-l from-transparent to-orange-500/60"></div>
            </div>
          </div>

          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
            <svg
              className="relative block w-full h-12"
              data-name="Layer 1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                opacity=".25"
                className="fill-black"
              ></path>
              <path
                d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                opacity=".5"
                className="fill-black"
              ></path>
              <path
                d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
                className="fill-black"
              ></path>
            </svg>
          </div>
        </div>
      </section>

      {/* Propiedades Destacadas - CONECTADO CON BACKEND */}
      <section
        id="propiedades"
        className="py-16 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden"
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              PROPIEDADES <span className="text-orange-500">DESTACADAS</span>
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Las mejores oportunidades de inversión en Reconquista
            </p>
          </div>

          {loadingProperties ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-white mt-4">Cargando propiedades...</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProperties.map((property) => (
                  <Card
                    key={property.id}
                    className="bg-gray-800/95 border-gray-600/30 border overflow-hidden group hover:border-gray-500/50 hover:shadow-2xl transition-all duration-300 backdrop-blur-sm h-full flex flex-col"
                  >
                    <div className="relative overflow-hidden">
                      <Link href={`/propiedades/${property.id}`}>
                        <div className="relative cursor-pointer h-48">
                          {property.images && property.images.length > 0 ? (
                            <Image
                              src={property.images[0]}
                              alt={property.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
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

                          {/* Status badges */}
                          <div className="absolute top-4 left-4">
                            <div className="bg-gray-900/90 text-orange-300 border border-orange-400/30 px-3 py-1 rounded-xl font-medium text-sm backdrop-blur-md shadow-lg">
                              {property.operation_type === "venta"
                                ? "VENTA"
                                : "ALQUILER"}
                            </div>
                          </div>

                          {/* Featured badge */}
                          {property.featured && (
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-600/90 to-yellow-500/90 text-white px-3 py-2 rounded-xl text-xs flex items-center gap-2 backdrop-blur-md shadow-lg">
                              <Eye className="w-4 h-4" />
                              DESTACADA
                            </div>
                          )}

                          {/* Favorite button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute bottom-4 right-4 bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white backdrop-blur-md rounded-xl p-3 shadow-lg"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </Link>
                    </div>

                    <CardContent className="p-4 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <Link href={`/propiedades/${property.id}`}>
                            <h3 className="font-bold text-white text-lg mb-2 hover:text-orange-300 transition-colors cursor-pointer">
                              {property.title}
                            </h3>
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
                        <Button
                          className="flex-1 bg-gradient-to-r from-orange-600/90 to-orange-500/90 hover:from-orange-600 hover:to-orange-500 text-white border border-orange-500/30 backdrop-blur-sm transition-all duration-300 text-sm font-medium rounded-xl shadow-lg"
                          onClick={() => handlePropertyInterest(property)}
                        >
                          Me interesa <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-500/40 text-gray-300 hover:bg-gray-700/60 hover:text-white bg-transparent backdrop-blur-sm rounded-xl"
                          onClick={() => handlePropertyInterest(property)}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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

              <div className="text-center mt-8">
                <Link href="/propiedades">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white bg-transparent"
                  >
                    Ver todas las propiedades{" "}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { icon: Home, number: "500+", label: "Propiedades Vendidas" },
              { icon: Users, number: "1000+", label: "Clientes Satisfechos" },
              { icon: Award, number: "15+", label: "Años de Experiencia" },
              { icon: Star, number: "4.9", label: "Calificación Promedio" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-orange/20 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-brand-orange" />
                </div>
                <div className="text-3xl font-museo font-medium text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Enhanced with gradients and animations */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-brand-orange to-orange-600">
          {/* Animated overlay patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-red-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          {/* Subtle geometric pattern overlay */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-3xl md:text-5xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              ¿Listo para encontrar tu próximo hogar?
            </motion.h2>
            <motion.p 
              className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Nuestro equipo de expertos está aquí para ayudarte en cada paso del camino
            </motion.p>
            <motion.div 
              className="flex flex-col md:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-white text-brand-orange hover:bg-gray-100 font-semibold px-8 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Explorar Propiedades
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-brand-orange font-semibold px-8 backdrop-blur-sm bg-white/10 hover:bg-white transition-all duration-300"
                >
                  Contactar Agente
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
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
    </div>
  );
}