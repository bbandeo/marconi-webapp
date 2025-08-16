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
import Header from "@/components/Header";

// Importar servicios
import { useIsClient } from "@/hooks/use-is-client";
import { PropertyService } from "@/services/properties";
import type { Property } from "@/lib/supabase";

export default function HomePage() {
  const [currentStat, setCurrentStat] = useState(0);
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

      {/* Hero Section - PREMIUM CON IMPACT TEXT */}
      <section className="relative h-[60vh] md:h-[92vh] flex flex-col overflow-hidden">
        {/* Background Image Premium */}
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
            className="object-cover"
            priority
          />
          {/* Overlay Premium - Más sutil y sofisticado */}
          <div className="absolute inset-0 bg-night-blue/30" />
        </div>

        {/* Content - ESPACIADO DRAMÁTICO */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center">
          {/* Impact Text Original - RESTAURADO */}
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
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-vibrant-orange mx-auto"></div>
              <p className="text-premium-primary mt-premium-sm body-lg">Cargando propiedades...</p>
            </div>
          ) : (
            <>
              {/* GRID 2 COLUMNAS - MÁXIMO 6 PROPIEDADES */}
              <div className="grid md:grid-cols-2 gap-premium-lg max-w-7xl mx-auto">
                {featuredProperties.slice(0, 6).map((property) => (
                  <Card
                    key={property.id}
                    className="group cursor-pointer"
                  >
                    {/* IMAGEN PROTAGONISTA - PREMIUM */}
                    <Link href={`/propiedades/${property.id}`}>
                      <div className="relative overflow-hidden h-80 md:h-96">
                        {property.images && property.images.length > 0 ? (
                          <Image
                            src={property.images[0]}
                            alt={property.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder.svg";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-premium-card flex items-center justify-center">
                            <div className="text-premium-secondary text-center">
                              <Home className="w-16 h-16 mx-auto mb-4 opacity-40" />
                              <p className="body-md">Sin imagen disponible</p>
                            </div>
                          </div>
                        )}

                        {/* Overlay Premium Sutil */}
                        <div className="absolute inset-0 bg-gradient-to-t from-night-blue/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Status Badge Minimalista - CONTRASTE MEJORADO */}
                        <div className="absolute top-premium-sm left-premium-sm">
                          <div className="bg-night-blue/90 text-bone-white px-premium-sm py-2 rounded-xl caption-lg font-semibold backdrop-blur-md border border-vibrant-orange/30">
                            {property.operation_type === "venta" ? "VENTA" : "ALQUILER"}
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* INFORMACIÓN ESENCIAL - SOLO 4 ELEMENTOS */}
                    <CardContent className="card-premium">
                      <Link href={`/propiedades/${property.id}`}>
                        {/* TÍTULO */}
                        <h3 className="heading-md text-premium-primary mb-premium-sm hover:text-vibrant-orange transition-colors cursor-pointer line-clamp-2">
                          {property.title}
                        </h3>
                        
                        {/* UBICACIÓN */}
                        <div className="flex items-center text-premium-secondary mb-premium-sm">
                          <MapPin className="w-5 h-5 mr-2 text-vibrant-orange" />
                          <span className="body-md">{property.neighborhood}, Reconquista</span>
                        </div>
                        
                        {/* PRECIO - PROMINENTE */}
                        <div className="text-right">
                          <div className="display-sm text-premium-primary">
                            {property.currency}$ {property.price.toLocaleString()}
                          </div>
                          {property.operation_type === "alquiler" && (
                            <div className="caption-lg text-premium-secondary">
                              por mes
                            </div>
                          )}
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
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

              {/* CTA Premium - Solo si hay propiedades */}
              {featuredProperties.length > 0 && (
                <div className="text-center mt-premium-xl">
                  <Link href="/propiedades">
                    <Button size="lg" variant="outline">
                      VER TODO EL CATÁLOGO
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </Button>
                  </Link>
                  <p className="caption-lg text-premium-secondary mt-premium-sm">
                    Más de 200 propiedades disponibles
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Stats Section - PREMIUM REFINADO */}
      <section className="section-premium bg-premium-main">
        <div className="container-premium">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-premium-lg"
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
                <div className="inline-flex items-center justify-center w-20 h-20 bg-vibrant-orange/10 rounded-2xl mb-premium-sm">
                  <stat.icon className="h-10 w-10 text-vibrant-orange" />
                </div>
                <div className="display-md text-premium-primary mb-premium-sm">
                  {stat.number}
                </div>
                <div className="body-md text-premium-secondary">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section - PREMIUM NARANJA VIBRANTE */}
      <section className="section-premium bg-vibrant-orange">
        <div className="container-premium text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="display-lg text-bone-white mb-premium-lg">
              COMENZÁ TU BÚSQUEDA HOY
            </h2>
            <p className="body-xl text-bone-white/90 mb-premium-xl max-w-2xl mx-auto">
              Acompañamiento profesional para encontrar la propiedad perfecta para vos y tu familia
            </p>
            <div className="flex flex-col sm:flex-row gap-premium-md justify-center items-center">
              <Link href="/propiedades">
                <Button
                  size="xl"
                  className="bg-night-blue text-bone-white hover:bg-night-blue/90 border border-bone-white/20 shadow-2xl"
                >
                  EXPLORAR PROPIEDADES
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/contacto">
                <Button
                  size="xl"
                  variant="outline"
                  className="border-bone-white/60 text-bone-white hover:bg-bone-white/10 hover:border-bone-white bg-transparent"
                >
                  CONTACTAR EXPERTO
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - PREMIUM DESIGN */}
      <footer className="bg-premium-main border-t border-support-gray/20 section-premium">
        <div className="container-premium">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-premium-lg">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-premium-md">
                <Image
                  src="/assets/logos/marconi_title.svg"
                  alt="Marconi Inmobiliaria"
                  width={140}
                  height={45}
                  className="h-10 w-auto"
                />
              </div>
              <p className="body-lg text-premium-secondary mb-premium-md max-w-md">
                Experiencia premium en bienes raíces. Comprometidos con encontrar 
                la propiedad perfecta para cada familia.
              </p>
            </div>

            <div>
              <h3 className="heading-sm text-premium-primary mb-premium-md">Enlaces</h3>
              <ul className="space-y-3 text-premium-secondary">
                <li>
                  <Link
                    href="/propiedades"
                    className="body-md hover:text-vibrant-orange transition-colors"
                  >
                    Propiedades
                  </Link>
                </li>
                <li>
                  <Link
                    href="/agentes"
                    className="body-md hover:text-vibrant-orange transition-colors"
                  >
                    Agentes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contacto"
                    className="body-md hover:text-vibrant-orange transition-colors"
                  >
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="heading-sm text-premium-primary mb-premium-md">Contacto</h3>
              <ul className="space-y-3 text-premium-secondary">
                <li className="body-md">Reconquista, Santa Fe</li>
                <li className="body-md">+54 9 3482 308100</li>
                <li className="body-md">marconinegociosinmobiliarios@hotmail.com</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-support-gray/20 mt-premium-xl pt-premium-lg text-center">
            <p className="caption-lg text-premium-secondary">
              &copy; 2025 Marconi Inmobiliaria. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
