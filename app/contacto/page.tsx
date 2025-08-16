"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  Check,
  ArrowRight,
  Building2,
  Users,
  Award,
  Star,
  Facebook,
  Instagram,
  Globe,
  HeadphonesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import { MapThumbnail } from "@/components/MapThumbnail";
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionSeparator } from "@/components/SectionSeparator";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function ContactoPage() {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Animation hooks
  const contactMethodsAnimation = useScrollAnimation({ threshold: 0.1 });
  const formAnimation = useScrollAnimation({ threshold: 0.2 });
  const mapAnimation = useScrollAnimation({ threshold: 0.1 });
  const featuresAnimation = useScrollAnimation({ threshold: 0.1 });

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError("");

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          message: `Asunto: ${contactForm.subject}\n\n${contactForm.message}`,
          source: 'contact_page',
          property_id: null,
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setContactForm({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        throw new Error('Error al enviar la consulta');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitError('Hubo un error al enviar tu consulta. Por favor, intenta nuevamente.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Teléfono",
      content: "+54 3482 308100",
      color: "text-green-500",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      content: "+54 9 3482 308100",
      action: "https://api.whatsapp.com/send?phone=543482308100&text=Hola!%20%F0%9F%91%8B%20Me%20gustar%C3%ADa%20obtener%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20servicios%2C%20gracias.",
      color: "text-green-500",
    },
    {
      icon: Mail,
      title: "Email",
      content: "marconinegociosinmobiliarios@hotmail.com",
      action: "mailto:marconinegociosinmobiliarios@hotmail.com",
      color: "text-blue-500",
    },
  ];

  const whyChooseUsReasons = [
    {
      icon: Users,
      title: "Atención Personalizada",
      description: "Cada cliente recibe un servicio único y adaptado a sus necesidades específicas"
    },
    {
      icon: MapPin,
      title: "Conocimiento Local",
      description: "Años de experiencia en el mercado inmobiliario de Reconquista y zona"
    },
    {
      icon: Award,
      title: "Profesionalismo",
      description: "Agentes certificados y en constante capacitación para brindarte el mejor servicio"
    },
    {
      icon: Star,
      title: "Resultados Comprobados",
      description: "Miles de transacciones exitosas y clientes satisfechos nos respaldan"
    }
  ];

  const faqs = [
    {
      question: "¿Cuánto tiempo toma vender una propiedad?",
      answer: "El tiempo promedio de venta varía según el tipo de propiedad y su ubicación, pero generalmente oscila entre 60 y 120 días. Nuestro equipo trabaja activamente para acelerar este proceso."
    },
    {
      question: "¿Qué documentación necesito para vender mi propiedad?",
      answer: "Necesitarás escritura de propiedad, cédula catastral actualizada, certificado de libre deuda municipal y de expensas (si aplica), y DNI del propietario."
    },
    {
      question: "¿Cobran comisión por mostrar propiedades?",
      answer: "No, mostrar propiedades a potenciales compradores es parte de nuestro servicio gratuito. Solo cobramos comisión al concretar la venta."
    },
    {
      question: "¿Pueden ayudarme con el financiamiento?",
      answer: "Sí, tenemos convenios con bancos y financieras locales para ayudarte a encontrar la mejor opción de crédito hipotecario para tu situación."
    },
  ];

  return (
    <PageLayout
      title="CONTÁCTANOS"
      subtitle="Estamos aquí para ayudarte a encontrar la propiedad perfecta o responder cualquier consulta sobre nuestros servicios"
      showHero={true}
      className="bg-premium-gray-950"
    >

      {/* Contact Methods Section */}
      <section className="py-24 bg-premium-gray-925 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #f97316 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, #ea580c 0%, transparent 50%)`
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            {...contactMethodsAnimation.getMotionProps("fadeUp")}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Hablemos <span className="gradient-text font-museo">Hoy</span>
            </h2>
            <p className="text-xl text-premium-gray-300 max-w-2xl mx-auto">
              Elegí la forma más cómoda para comunicarte con nosotros
            </p>
          </motion.div>

          <motion.div 
            {...contactMethodsAnimation.getStaggerContainer(0.2)}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                {...contactMethodsAnimation.getStaggerChild()}
                className="group"
              >
                <Card className="property-card bg-premium-gray-900/60 backdrop-blur-xl border-premium-gray-700/30 border-2 h-full rounded-3xl shadow-2xl">
                  <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`inline-flex items-center justify-center w-20 h-20 bg-premium-orange-500/10 border border-premium-orange-500/30 rounded-2xl mb-6 mx-auto group-hover:bg-premium-orange-500/20 transition-colors duration-300`}
                    >
                      <method.icon className={`h-10 w-10 ${method.color === "text-green-500" ? "text-green-400" : method.color === "text-blue-500" ? "text-blue-400" : "text-premium-orange-400"}`} />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-white mb-4">{method.title}</h3>
                    <p className="text-premium-gray-300 text-lg mb-6">{method.content}</p>
                    
                    {method.action && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          asChild
                          className="bg-premium-orange-600 hover:bg-premium-orange-700 text-white w-full font-bold py-3 rounded-2xl shadow-2xl hover:shadow-premium transition-all duration-300 group"
                        >
                          <a href={method.action} target="_blank" rel="noopener noreferrer">
                            <method.icon className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                            {method.title}
                          </a>
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <SectionSeparator variant="wave" />

      {/* Contact Form Section */}
      <section className="py-24 bg-premium-gray-950 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, #f97316 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, #ea580c 0%, transparent 50%)`
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              {...formAnimation.getMotionProps("slideLeft")}
              className="order-2 lg:order-1"
            >
              <Card className="bg-premium-gray-900/60 backdrop-blur-xl border-premium-gray-700/30 border-2 rounded-3xl shadow-2xl">
                <CardContent className="p-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Envianos tu <span className="gradient-text font-museo">Consulta</span>
                  </h2>
                  <p className="text-premium-gray-300 mb-8 text-lg">
                    Completá el formulario y nos pondremos en contacto contigo a la brevedad
                  </p>

                  {submitSuccess ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-center py-12"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                      >
                        <Check className="w-10 h-10 text-white" />
                      </motion.div>
                      <h3 className="text-3xl font-bold text-white mb-4">¡Mensaje Enviado!</h3>
                      <p className="text-premium-gray-300 mb-8 text-lg">
                        Gracias por contactarnos. Nuestro equipo recibirá tu consulta 
                        y se pondrá en contacto contigo a la brevedad.
                      </p>
                      <Button
                        onClick={() => setSubmitSuccess(false)}
                        variant="outline"
                        className="border-2 border-premium-gray-600/50 text-premium-gray-300 hover:bg-premium-orange-500/20 hover:text-premium-orange-400 hover:border-premium-orange-500/50 glass rounded-2xl px-8 py-3"
                      >
                        Enviar otra consulta
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmitContact} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-premium-gray-300 mb-3">
                            Nombre completo *
                          </label>
                          <Input
                            type="text"
                            value={contactForm.name}
                            onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-premium-gray-800/60 border-premium-gray-600/50 text-white placeholder-premium-gray-400 focus:border-premium-orange-500 rounded-2xl backdrop-blur-md h-12"
                            placeholder="Tu nombre completo"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-premium-gray-300 mb-3">
                            Email *
                          </label>
                          <Input
                            type="email"
                            value={contactForm.email}
                            onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                            className="bg-premium-gray-800/60 border-premium-gray-600/50 text-white placeholder-premium-gray-400 focus:border-premium-orange-500 rounded-2xl backdrop-blur-md h-12"
                            placeholder="tu@email.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-premium-gray-300 mb-3">
                            Teléfono
                          </label>
                          <Input
                            type="tel"
                            value={contactForm.phone}
                            onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="bg-premium-gray-800/60 border-premium-gray-600/50 text-white placeholder-premium-gray-400 focus:border-premium-orange-500 rounded-2xl backdrop-blur-md h-12"
                            placeholder="+54 3482 308100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-premium-gray-300 mb-3">
                            Asunto *
                          </label>
                          <Select value={contactForm.subject} onValueChange={(value) => setContactForm(prev => ({ ...prev, subject: value }))}>
                            <SelectTrigger className="bg-premium-gray-800/60 border-premium-gray-600/50 text-white rounded-2xl backdrop-blur-md h-12">
                              <SelectValue placeholder="Selecciona un asunto" />
                            </SelectTrigger>
                            <SelectContent className="bg-premium-gray-800 border-premium-gray-600">
                              <SelectItem value="consulta-general">Consulta General</SelectItem>
                              <SelectItem value="quiero-vender">Quiero Vender</SelectItem>
                              <SelectItem value="quiero-comprar">Quiero Comprar</SelectItem>
                              <SelectItem value="quiero-alquilar">Quiero Alquilar</SelectItem>
                              <SelectItem value="informacion-propiedad">Información de Propiedad</SelectItem>
                              <SelectItem value="otros">Otros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-premium-gray-300 mb-3">
                          Mensaje *
                        </label>
                        <Textarea
                          value={contactForm.message}
                          onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                          className="bg-premium-gray-800/60 border-premium-gray-600/50 text-white placeholder-premium-gray-400 focus:border-premium-orange-500 min-h-32 rounded-2xl backdrop-blur-md"
                          placeholder="Contanos en detalle tu consulta o necesidad. Mientras más información nos proporciones, mejor podremos ayudarte..."
                          required
                        />
                      </div>

                      {submitError && (
                        <div className="p-4 bg-red-500/20 border border-red-500/20 rounded-2xl glass">
                          <p className="text-red-400">{submitError}</p>
                        </div>
                      )}

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          className="w-full bg-premium-orange-600 hover:bg-premium-orange-700 text-white font-bold py-4 rounded-2xl shadow-2xl hover:shadow-premium transition-all duration-300 group"
                          disabled={submitLoading || !contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message}
                        >
                          {submitLoading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                              />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <span className="mr-3">Enviar Consulta</span>
                              <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              {...formAnimation.getMotionProps("slideRight")}
              className="order-1 lg:order-2"
            >
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Información de <span className="gradient-text font-museo">Contacto</span>
                  </h2>
                  <p className="text-premium-gray-300 mb-8 text-lg">
                    Visitanos en nuestra oficina o contactanos por cualquiera de nuestros canales disponibles
                  </p>
                </div>

                {/* Contact Details */}
                <div className="space-y-6">
                  <Card className="bg-premium-gray-900/60 backdrop-blur-xl border-premium-gray-700/30 border-2 rounded-3xl shadow-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-premium-orange-500/20 border border-premium-orange-500/30 p-3 rounded-2xl">
                          <MapPin className="w-6 h-6 text-premium-orange-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white mb-3 text-lg">Dirección</h3>
                          <p className="text-premium-gray-300 text-lg">Jorge Newbery 1562</p>
                          <p className="text-premium-gray-300 text-lg">Reconquista, Santa Fe, Argentina</p>
                          <div className="mt-6 rounded-2xl overflow-hidden border border-premium-gray-700/50">
                            <div className="relative h-48 bg-premium-gray-800">
                              <MapThumbnail
                                query="Jorge Newbery 1562, Reconquista, Santa Fe, Argentina"
                                title="Ubicación Oficina Marconi Inmobiliaria"
                              />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-premium-gray-800/80 backdrop-blur-md">
                              <span className="text-sm text-premium-gray-400">Ver ubicación en mapa</span>
                              <Button
                                size="sm"
                                className="bg-premium-orange-600 hover:bg-premium-orange-700 rounded-xl font-bold"
                                asChild
                              >
                                <a
                                  href="https://www.google.com/maps/search/?api=1&query=Jorge%20Newbery%201562%2C%20Reconquista%2C%20Santa%20Fe%2C%20Argentina"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Abrir en Google Maps
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-premium-gray-900/60 backdrop-blur-xl border-premium-gray-700/30 border-2 rounded-3xl shadow-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-premium-orange-500/20 border border-premium-orange-500/30 p-3 rounded-2xl">
                          <Clock className="w-6 h-6 text-premium-orange-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white mb-3 text-lg">Horarios de Atención</h3>
                          <p className="text-premium-gray-300 text-lg">Lunes a Viernes: 9:00 - 18:00</p>
                          <p className="text-premium-gray-300 text-lg">Sábados: 9:00 - 13:00</p>
                          <p className="text-premium-gray-300 text-lg">Domingos: Cerrado</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-premium-gray-900/60 backdrop-blur-xl border-premium-gray-700/30 border-2 rounded-3xl shadow-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-premium-orange-500/20 border border-premium-orange-500/30 p-3 rounded-2xl">
                          <HeadphonesIcon className="w-6 h-6 text-premium-orange-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white mb-3 text-lg">Contacto Directo</h3>
                          <p className="text-premium-gray-300 mb-2 text-lg">Teléfono: +54 3482 308100</p>
                          <p className="text-premium-gray-300 mb-2 text-lg">WhatsApp: +54 9 3482 308100</p>
                          <p className="text-premium-gray-300 text-lg">Email: marconinegociosinmobiliarios@hotmail.com</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Social Media */}
                <Card className="bg-premium-gray-900/60 backdrop-blur-xl border-premium-gray-700/30 border-2 rounded-3xl shadow-2xl">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-white mb-6 text-lg">Seguinos en Redes Sociales</h3>
                    <div className="flex space-x-4">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-2 border-premium-gray-600/50 text-premium-gray-300 hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-500/50 glass rounded-2xl"
                          asChild
                        >
                          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                            <Facebook className="w-4 h-4 mr-2" />
                            Facebook
                          </a>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-2 border-premium-gray-600/50 text-premium-gray-300 hover:bg-pink-600/20 hover:text-pink-400 hover:border-pink-500/50 glass rounded-2xl"
                          asChild
                        >
                          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                            <Instagram className="w-4 h-4 mr-2" />
                            Instagram
                          </a>
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <SectionSeparator variant="dots" />

      {/* Map Section */}
      <section className="py-24 bg-premium-gray-925 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #f97316 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, #ea580c 0%, transparent 50%)`
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            {...mapAnimation.getMotionProps("fadeUp")}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Encontranos en <span className="gradient-text font-museo">Reconquista</span>
            </h2>
            <p className="text-xl text-premium-gray-300 max-w-2xl mx-auto">
              Ubicados en el corazón de la ciudad, con fácil acceso y estacionamiento disponible
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={mapAnimation.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-premium-gray-900/60 backdrop-blur-xl border-premium-gray-700/30 border-2 rounded-3xl p-8 shadow-2xl"
          >
            <div className="aspect-video bg-premium-gray-800 rounded-2xl overflow-hidden">
              <MapThumbnail
                query="Jorge Newbery 1562, Reconquista, Santa Fe, Argentina"
                title="Mapa de Google Maps - Marconi Inmobiliaria"
              />
            </div>
            <div className="mt-6 text-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="bg-premium-orange-600 hover:bg-premium-orange-700 text-white font-bold py-3 px-8 rounded-2xl shadow-2xl hover:shadow-premium transition-all duration-300"
                  asChild
                >
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Jorge%20Newbery%201562%2C%20Reconquista%2C%20Santa%20Fe%2C%20Argentina"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver en Google Maps
                  </a>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionSeparator variant="gradient" />

      {/* Why Choose Us Section */}
      <section className="py-24 bg-premium-gray-950 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-premium-orange-950/10 via-transparent to-premium-orange-950/10" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            {...featuresAnimation.getMotionProps("fadeUp")}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              ¿Por qué elegir <span className="gradient-text font-museo">Marconi Inmobiliaria</span>?
            </h2>
            <p className="text-xl text-premium-gray-300 max-w-3xl mx-auto">
              Nuestro compromiso va más allá de simplemente vender propiedades. 
              Te acompañamos en todo el proceso con profesionalismo y dedicación.
            </p>
          </motion.div>

          <motion.div
            {...featuresAnimation.getStaggerContainer(0.2)}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {whyChooseUsReasons.map((reason, index) => (
              <motion.div
                key={index}
                {...featuresAnimation.getStaggerChild()}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-premium-orange-500/10 border border-premium-orange-500/30 rounded-2xl mb-6 group-hover:bg-premium-orange-500/20 transition-colors duration-300"
                >
                  <reason.icon className="h-10 w-10 text-premium-orange-400" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-4">{reason.title}</h3>
                <p className="text-premium-gray-300 leading-relaxed">{reason.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <SectionSeparator variant="minimal" />

      {/* FAQ Section */}
      <section className="py-24 bg-premium-gray-925 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, #f97316 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, #ea580c 0%, transparent 50%)`
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Preguntas <span className="gradient-text font-museo">Frecuentes</span>
            </h2>
            <p className="text-xl text-premium-gray-300 max-w-2xl mx-auto">
              Resolvemos las dudas más comunes de nuestros clientes
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="bg-premium-gray-900/60 backdrop-blur-xl border-premium-gray-700/30 border-2 rounded-3xl shadow-2xl hover:shadow-premium transition-all duration-300 group-hover:scale-[1.02]">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold text-white mb-4 gradient-text">{faq.question}</h3>
                    <p className="text-premium-gray-300 text-lg leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <p className="text-premium-gray-300 mb-8 text-xl">
              ¿No encontrás la respuesta que buscás?
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-premium-orange-600 hover:bg-premium-orange-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-premium transition-all duration-300 group"
                onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Contactanos Directamente
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </PageLayout>
  );
}