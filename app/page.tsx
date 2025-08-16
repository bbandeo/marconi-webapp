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
import { MapThumbnail } from "@/components/MapThumbnail";

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
      <header className="bg-gray-900 border-b border-gray-700/20 sticky top-0 z-50 backdrop-blur-sm">
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

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-12">
              <Link
                href="/propiedades"
                className="text-gray-300 hover:text-white transition-all duration-300 ease-out relative group font-medium tracking-wide"
              >
                PROPIEDADES
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 ease-out group-hover:w-full"></span>
              </Link>
              <Link
                href="/agentes"
                className="text-gray-300 hover:text-white transition-all duration-300 ease-out relative group font-medium tracking-wide"
              >
                AGENTES
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 ease-out group-hover:w-full"></span>
              </Link>
              <Link
                href="/contacto"
                className="text-gray-300 hover:text-white transition-all duration-300 ease-out relative group font-medium tracking-wide"
              >
                CONTACTO
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 ease-out group-hover:w-full"></span>
              </Link>
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

      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[90vh] flex flex-col">
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
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center px-8">
          {/* Simplified Impact Text */}
          <div className="flex-1 flex items-center justify-center w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center max-w-4xl"
            >
              <h1 className="text-4xl md:text-6xl font-light text-white mb-6 tracking-wide leading-tight">
                Viví la experiencia de encontrar
                <span className="block text-orange-500 font-medium">tu lugar en el mundo</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 font-light tracking-wide opacity-90">
                Inmobiliaria de confianza en Reconquista
              </p>
            </motion.div>
          </div>

          {/* Company Branding at Bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-12 text-center"
          >
            <Image
              src="/assets/logos/marconi_header_orangewhite.png"
              alt="Marconi Inmobiliaria"
              width={300}
              height={90}
              className="h-16 w-auto mx-auto opacity-80"
            />
          </motion.div>
        </div>
      </section>
      {/* Propiedades Destacadas - CONECTADO CON BACKEND */}
      <section
        id="propiedades"
        className="py-24 bg-gray-900 relative"
      >
        <div className="container mx-auto px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-8 tracking-wide">
              PROPIEDADES <span className="text-orange-500 font-medium">DESTACADAS</span>
            </h2>
            <p className="text-xl text-gray-300 font-light leading-relaxed max-w-2xl mx-auto">
              Las mejores oportunidades de inversión en Reconquista
            </p>
          </div>

          {loadingProperties ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-gray-600 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-300 mt-6 font-light">Cargando propiedades...</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {featuredProperties.map((property) => (
                  <Card
                    key={property.id}
                    className="bg-gray-800/40 border border-gray-700/20 overflow-hidden group hover:border-gray-600/30 transition-all duration-300 ease-out backdrop-blur-sm h-full flex flex-col hover:shadow-xl"
                  >
                    <div className="relative overflow-hidden">
                      <Link href={`/propiedades/${property.id}`}>
                        <div className="relative cursor-pointer h-56">
                          {property.images && property.images.length > 0 ? (
                            <Image
                              src={property.images[0]}
                              alt={property.title}
                              fill
                              className="object-cover transition-opacity duration-300 ease-out group-hover:opacity-95"
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

                          {/* Simple operation type indicator */}
                          <div className="absolute top-4 left-4">
                            <span className="bg-black/60 text-white px-3 py-1 rounded font-medium text-sm backdrop-blur-sm">
                              {property.operation_type === "venta"
                                ? "VENTA"
                                : "ALQUILER"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>

                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="mb-6">
                        <Link href={`/propiedades/${property.id}`}>
                          <h3 className="text-white text-xl mb-3 hover:text-orange-300 transition-colors duration-300 ease-out cursor-pointer font-medium leading-tight">
                            {property.title}
                          </h3>
                        </Link>
                        <div className="flex items-center text-gray-400 mb-4">
                          <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                          <span className="font-light">{property.neighborhood}, Reconquista</span>
                        </div>
                        <div className="text-2xl font-light text-white">
                          {property.currency}$ {property.price.toLocaleString()}
                          {property.operation_type === "alquiler" && (
                            <span className="text-gray-400 text-base ml-2">/ mes</span>
                          )}
                        </div>
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

                      {/* Single Action Button */}
                      <div className="pt-4 border-t border-gray-700/20 mt-auto">
                        <Button
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white transition-all duration-300 ease-out font-medium hover:shadow-lg transform hover:-translate-y-0.5"
                          onClick={() => handlePropertyInterest(property)}
                        >
                          Ver detalles <ArrowRight className="w-4 h-4 ml-2" />
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
                    className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white bg-transparent btn-minimal hover-glow-subtle"
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
      <section className="py-24 bg-black">
        <div className="container mx-auto px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-4xl mx-auto"
          >
            {[
              { number: "500+", label: "Propiedades Vendidas" },
              { number: "1000+", label: "Clientes Satisfechos" },
              { number: "15+", label: "Años de Experiencia" },
              { number: "4.9", label: "Calificación Promedio" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="text-center group"
              >
                <div className="text-4xl font-light text-white mb-3 transition-colors duration-300 ease-out group-hover:text-orange-500">
                  {stat.number}
                </div>
                <div className="text-gray-400 font-light text-sm tracking-wide border-t border-gray-800 pt-3">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mini Map Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Nuestra <span className="text-brand-orange">Ubicación</span>
              </h2>
              <p className="text-gray-300 mb-4">
                Jorge Newbery 1562, Reconquista, Santa Fe, Argentina
              </p>
              <Link href="/contacto">
                <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white btn-minimal">
                  Contactanos
                </Button>
              </Link>
            </div>
            <div className="rounded-lg overflow-hidden border border-gray-700 bg-gray-800">
              <div className="relative h-64 md:h-80">
                <MapThumbnail
                  query="Jorge Newbery 1562, Reconquista, Santa Fe, Argentina"
                  title="Ubicación de Marconi Inmobiliaria"
                />
              </div>
              <div className="p-3 text-right">
                <Button
                  variant="outline"
                  className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white btn-minimal"
                  onClick={() => window.open("https://www.google.com/maps/search/?api=1&query=Jorge%20Newbery%201562%2C%20Reconquista%2C%20Santa%20Fe%2C%20Argentina")}
                >
                  Ver en Google Maps
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-orange-600">
        <div className="container mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-light text-white mb-8 tracking-wide leading-tight">
              ¿Listo para encontrar tu próximo hogar?
            </h2>
            <p className="text-lg text-orange-100 mb-10 font-light leading-relaxed">
              Nuestro equipo de expertos está aquí para ayudarte en cada paso del camino
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/propiedades">
                <Button
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-gray-100 font-medium px-8 py-3 transition-all duration-300 ease-out hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Explorar Propiedades
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contacto">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white border-2 text-white hover:bg-white hover:text-orange-600 bg-transparent font-medium px-8 py-3 transition-all duration-300 ease-out"
                >
                  Contactar Agente
                </Button>
              </Link>
            </div>
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
