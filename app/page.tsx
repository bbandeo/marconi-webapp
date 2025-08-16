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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-secondary border-b border-border sticky top-0 z-50 shadow-md backdrop-blur supports-[backdrop-filter]:bg-secondary/80">
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
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  PROPIEDADES
                </Link>
                <Link
                  href="/agentes"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  AGENTES
                </Link>
                <Link
                  href="/contacto"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  CONTACTO
                </Link>
              </nav>

            {/* Mobile Search Bar */}
            <div className="md:hidden flex-1 max-w-xs ml-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar propiedades..."
                  className="pl-10 h-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground text-sm focus-visible:ring-[var(--ring)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Decorative divider line */}
                  <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent"></div>
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
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
                className="w-full p-10 md:p-20 flex justify-center bg-black/40 backdrop-blur-sm rounded-xl"
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
                  className="h-24 md:h-26 w-auto mx-auto opacity-90 mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                />
          </motion.div>
        </div>
      </section>
      {/* Propiedades Destacadas - CONECTADO CON BACKEND */}
      <section
        id="propiedades"
        className="py-16 bg-background relative overflow-hidden"
      >
        <div className="container mx-auto px-4 relative z-10">
                      <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 font-display tracking-tight">
                PROPIEDADES <span className="text-[hsl(var(--primary))]">DESTACADAS</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Las mejores oportunidades de inversión en Reconquista
              </p>
            </div>

                      {loadingProperties ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-[hsl(var(--primary))]/30 border-t-[hsl(var(--primary))] mx-auto rounded-full"></div>
                <p className="text-muted-foreground mt-4">Cargando propiedades...</p>
              </div>
            ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProperties.map((property) => (
                  <Card
                    key={property.id}
                                         className="bg-card border border-border/60 overflow-hidden group hover:border-border hover:shadow-xl transition-all duration-300 h-full flex flex-col rounded-xl"
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
                            <div className="w-full h-full bg-secondary flex items-center justify-center">
                                                             <div className="text-muted-foreground text-center">
                                 <div className="w-16 h-16 bg-muted rounded mx-auto mb-3"></div>
                                 <p>Sin imagen</p>
                               </div>
                            </div>
                          )}

                          {/* Status badges */}
                                                     <div className="absolute top-4 left-4">
                             <div className="bg-background/90 text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/30 px-3 py-1 rounded-full font-semibold text-xs backdrop-blur-md shadow-md tracking-wide">
                               {property.operation_type === "venta"
                                 ? "VENTA"
                                 : "ALQUILER"}
                             </div>
                           </div>

                          {/* Featured badge */}
                                                     {property.featured && (
                             <div className="absolute top-4 right-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-md">
                               <Eye className="w-4 h-4" />
                               DESTACADA
                             </div>
                           )}

                          {/* Favorite button */}
                                                     <Button
                             size="sm"
                             variant="ghost"
                             className="absolute bottom-4 right-4 bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground rounded-xl p-3 shadow-lg"
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
                            <h3 className="font-bold text-foreground text-lg mb-2 hover:text-[hsl(var(--primary))] transition-colors cursor-pointer">
                              {property.title}
                            </h3>
                          </Link>
                                                     <div className="flex items-center text-muted-foreground font-medium mb-1">
                             <MapPin className="w-4 h-4 mr-2 text-[hsl(var(--primary))]" />
                             {property.neighborhood}, Reconquista
                           </div>
                        </div>
                                                  <div className="text-right ml-2">
                            <div className="text-xl font-extrabold text-foreground mb-1">
                              {property.currency}${" "}
                              {property.price.toLocaleString()}
                            </div>
                            <div className="text-muted-foreground text-xs">
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
                          <div className="flex items-center gap-4 text-muted-foreground mb-4 text-sm">
                            {property.bedrooms && (
                              <div className="flex items-center bg-secondary/60 px-2 py-1 rounded-lg">
                                <Bed className="w-4 h-4 mr-1 text-[hsl(var(--primary))]" />
                                <span className="font-medium">
                                  {property.bedrooms}
                                </span>
                              </div>
                            )}
                            {property.bathrooms && (
                              <div className="flex items-center bg-secondary/60 px-2 py-1 rounded-lg">
                                <Bath className="w-4 h-4 mr-1 text-[hsl(var(--primary))]" />
                                <span className="font-medium">
                                  {property.bathrooms}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center bg-secondary/60 px-2 py-1 rounded-lg">
                              <Square className="w-4 h-4 mr-1 text-[hsl(var(--primary))]" />
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
                                    className="bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/20 px-2 py-1 rounded-lg text-xs font-medium"
                                  >
                                    {feature}
                                  </span>
                                ))}
                                {property.features.length > 3 && (
                                  <span className="text-muted-foreground text-xs px-2 py-1">
                                    +{property.features.length - 3} más
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                      </div>

                      {/* Action Buttons - Always at bottom */}
                      <div className="flex gap-2 pt-2 border-t border-border/60 mt-auto">
                        <Button
                          className="flex-1 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 transition-all duration-200 text-sm font-semibold rounded-xl shadow-md"
                          onClick={() => handlePropertyInterest(property)}
                        >
                          Me interesa <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-border text-foreground/80 hover:bg-accent hover:text-foreground rounded-xl"
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
                  <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground text-lg">
                    No hay propiedades destacadas disponibles
                  </p>
                  <p className="text-muted-foreground">
                    Próximamente agregaremos nuevas propiedades
                  </p>
                </div>
              )}

                          <div className="text-center mt-8">
              <Link href="/propiedades">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))]"
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
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[hsl(var(--primary))]/15 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-[hsl(var(--primary))]" />
                </div>
                <div className="text-3xl font-display font-semibold text-foreground mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[hsl(var(--primary))]">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-display font-semibold text-[hsl(var(--primary-foreground))] mb-6">
              ¿Listo para encontrar tu próximo hogar?
            </h2>
            <p className="text-xl text-[hsl(var(--primary-foreground))]/85 mb-8">
              Nuestro equipo de expertos está aquí para ayudarte en cada paso
              del camino
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/propiedades">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-[hsl(var(--primary-foreground))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-foreground))]/90"
                >
                  Explorar Propiedades
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contacto">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[hsl(var(--primary-foreground))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary-foreground))] hover:text-[hsl(var(--primary))]"
                >
                  Contactar Agente
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary border-t border-border py-12">
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
              <p className="text-muted-foreground mb-4">
                La inmobiliaria líder en Reconquista, comprometida con encontrar
                el hogar perfecto para cada familia.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-semibold mb-4">Enlaces</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    href="/propiedades"
                    className="hover:text-foreground transition-colors"
                  >
                    Propiedades
                  </Link>
                </li>
                <li>
                  <Link
                    href="/agentes"
                    className="hover:text-foreground transition-colors"
                  >
                    Agentes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contacto"
                    className="hover:text-foreground transition-colors"
                  >
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-foreground font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Reconquista, Santa Fe</li>
                <li>+54 9 3482 308100</li>
                <li>marconinegociosinmobiliarios@hotmail.com</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>
              &copy; 2025 Marconi Inmobiliaria. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
