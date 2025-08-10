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
                className="text-brand-orange font-semibold"
              >
                CONTACTO
              </Link>
            </nav>
          </div>
        </div>
        
        {/* Decorative divider line */}
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-lg"></div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900 to-black">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              <span className="text-brand-orange">CONTACTANOS</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Estamos aquí para ayudarte a encontrar la propiedad perfecta 
              o responder cualquier consulta sobre nuestros servicios
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="text-center"
                >
                  <Button
                    asChild
                    className="bg-brand-orange hover:bg-brand-orange/90 text-white w-full"
                  >
                    <a href={method.action} target="_blank" rel="noopener noreferrer">
                      <method.icon className="w-4 h-4 mr-2" />
                      {method.title}
                    </a>
                  </Button>
                  <p className="text-gray-400 text-sm mt-2">{method.content}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold text-white mb-6">
                    Envianos tu <span className="text-brand-orange">Consulta</span>
                  </h2>
                  <p className="text-gray-300 mb-8">
                    Completá el formulario y nos pondremos en contacto contigo a la brevedad
                  </p>

                  {submitSuccess ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">¡Mensaje Enviado!</h3>
                      <p className="text-gray-300 mb-6">
                        Gracias por contactarnos. Nuestro equipo recibirá tu consulta 
                        y se pondrá en contacto contigo a la brevedad.
                      </p>
                      <Button
                        onClick={() => setSubmitSuccess(false)}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white bg-transparent"
                      >
                        Enviar otra consulta
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitContact} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Nombre completo *
                          </label>
                          <Input
                            type="text"
                            value={contactForm.name}
                            onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-brand-orange"
                            placeholder="Tu nombre completo"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email *
                          </label>
                          <Input
                            type="email"
                            value={contactForm.email}
                            onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-brand-orange"
                            placeholder="tu@email.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Teléfono
                          </label>
                          <Input
                            type="tel"
                            value={contactForm.phone}
                            onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-brand-orange"
                            placeholder="+54 3482 308100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Asunto *
                          </label>
                          <Select value={contactForm.subject} onValueChange={(value) => setContactForm(prev => ({ ...prev, subject: value }))}>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Selecciona un asunto" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Mensaje *
                        </label>
                        <Textarea
                          value={contactForm.message}
                          onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-brand-orange min-h-32"
                          placeholder="Contanos en detalle tu consulta o necesidad. Mientras más información nos proporciones, mejor podremos ayudarte..."
                          required
                        />
                      </div>

                      {submitError && (
                        <div className="p-4 bg-red-500/20 border border-red-500/20 rounded-lg">
                          <p className="text-red-400">{submitError}</p>
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white"
                        disabled={submitLoading || !contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message}
                      >
                        {submitLoading ? "Enviando..." : "Enviar Consulta"}
                        <Send className="w-4 h-4 ml-2" />
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-6">
                    Información de <span className="text-brand-orange">Contacto</span>
                  </h2>
                  <p className="text-gray-300 mb-8">
                    Visitanos en nuestra oficina o contactanos por cualquiera de nuestros canales disponibles
                  </p>
                </div>

                {/* Contact Details */}
                <div className="space-y-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-brand-orange/20 p-3 rounded-full">
                          <MapPin className="w-6 h-6 text-brand-orange" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white mb-1">Dirección</h3>
                          <p className="text-gray-300">Jorge Newbery 1562</p>
                          <p className="text-gray-300">Reconquista, Santa Fe, Argentina</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-brand-orange/20 p-3 rounded-full">
                          <Clock className="w-6 h-6 text-brand-orange" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white mb-1">Horarios de Atención</h3>
                          <p className="text-gray-300">Lunes a Viernes: 9:00 - 18:00</p>
                          <p className="text-gray-300">Sábados: 9:00 - 13:00</p>
                          <p className="text-gray-300">Domingos: Cerrado</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-brand-orange/20 p-3 rounded-full">
                          <HeadphonesIcon className="w-6 h-6 text-brand-orange" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white mb-1">Contacto Directo</h3>
                          <p className="text-gray-300 mb-1">Teléfono: +54 3482 308100</p>
                          <p className="text-gray-300 mb-1">WhatsApp: +54 9 3482 308100</p>
                          <p className="text-gray-300">Email: marconinegociosinmobiliarios@hotmail.com</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Social Media */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-white mb-4">Seguinos en Redes Sociales</h3>
                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 bg-transparent"
                        asChild
                      >
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                          <Facebook className="w-4 h-4 mr-2" />
                          Facebook
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-pink-600 hover:text-white hover:border-pink-600 bg-transparent"
                        asChild
                      >
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                          <Instagram className="w-4 h-4 mr-2" />
                          Instagram
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Encontranos en <span className="text-brand-orange">Reconquista</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Ubicados en el corazón de la ciudad, con fácil acceso y estacionamiento disponible
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="relative rounded-lg overflow-hidden bg-gray-700">
              <MapThumbnail 
                query="Jorge Newbery 1562, Reconquista, Santa Fe, Argentina"
                className="w-full aspect-video"
                title="Mapa de la inmobiliaria"
              />
            </div>
            <Button
              className="mt-4 bg-brand-orange hover:bg-brand-orange/90 text-white"
              asChild
            >
              <a
                href="https://www.google.com/maps/search/?api=1&query=Jorge%20Newbery%201562%2C%20Reconquista%2C%20Santa%20Fe%2C%20Argentina"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe className="w-4 h-4 mr-2" />
                Ver en Google Maps
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Por qué elegir <span className="text-brand-orange">Marconi Inmobiliaria</span>?
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Nuestro compromiso va más allá de simplemente vender propiedades. 
              Te acompañamos en todo el proceso con profesionalismo y dedicación.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUsReasons.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-orange/20 rounded-full mb-6">
                  <reason.icon className="h-8 w-8 text-brand-orange" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{reason.title}</h3>
                <p className="text-gray-300">{reason.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Preguntas <span className="text-brand-orange">Frecuentes</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Resolvemos las dudas más comunes de nuestros clientes
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                    <p className="text-gray-300">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-gray-300 mb-6">
              ¿No encontrás la respuesta que buscás?
            </p>
            <Button
              className="bg-brand-orange hover:bg-brand-orange/90 text-white"
              onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Contactanos Directamente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
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
                <li>Jorge Newbery 1562</li>
                <li>Reconquista, Santa Fe</li>
                <li>+54 3482 308100</li>
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