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
import Header from "@/components/Header"
import Footer from "@/components/Footer";

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
      action: "tel:+543482308100",
      color: "text-vibrant-orange",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      content: "+54 9 3482 308100",
      action: "https://api.whatsapp.com/send?phone=543482308100&text=Hola!%20%F0%9F%91%8B%20Me%20gustar%C3%ADa%20obtener%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20servicios%2C%20gracias.",
      color: "text-vibrant-orange",
    },
    {
      icon: Mail,
      title: "Email",
      content: "marconinegociosinmobiliarios@hotmail.com",
      action: "mailto:marconinegociosinmobiliarios@hotmail.com",
      color: "text-vibrant-orange",
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
    <div className="min-h-screen bg-premium-main">
      {/* Header Premium */}
      <Header />

      {/* Hero Section - PREMIUM DESIGN */}
      <section className="section-premium bg-premium-main">
        <div className="container-premium text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="display-lg text-premium-primary mb-premium-lg">
              <span className="accent-premium">CONTACTANOS</span>
            </h1>
            <p className="body-xl text-premium-secondary max-w-4xl mx-auto mb-premium-xl">
              Estamos aquí para ayudarte a encontrar la propiedad perfecta 
              o responder cualquier consulta sobre nuestros servicios
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-premium-lg max-w-3xl mx-auto">
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
                    size="lg"
                    className="w-full"
                  >
                    <a href={method.action} target="_blank" rel="noopener noreferrer">
                      <method.icon className="w-5 h-5 mr-2" />
                      {method.title}
                    </a>
                  </Button>
                  <p className="caption-lg text-premium-secondary mt-premium-sm">{method.content}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section - PREMIUM DESIGN */}
      <section className="section-premium bg-premium-main">
        <div className="container-premium">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-premium-xl">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <Card>
                <CardContent className="card-premium">
                  <h2 className="heading-xl text-premium-primary mb-premium-md">
                    Envianos tu <span className="accent-premium">Consulta</span>
                  </h2>
                  <p className="body-lg text-premium-secondary mb-premium-lg">
                    Completá el formulario y nos pondremos en contacto contigo a la brevedad
                  </p>

                  {submitSuccess ? (
                    <div className="text-center py-8">
                      <div className="w-20 h-20 bg-vibrant-orange rounded-full flex items-center justify-center mx-auto mb-premium-md shadow-xl hover-lift">
                        <Check className="w-10 h-10 text-bone-white" />
                      </div>
                      <h3 className="heading-lg text-premium-primary mb-premium-sm">¡Mensaje Enviado!</h3>
                      <p className="body-lg text-premium-secondary mb-premium-lg">
                        Gracias por contactarnos. Nuestro equipo recibirá tu consulta 
                        y se pondrá en contacto contigo a la brevedad.
                      </p>
                      <Button
                        onClick={() => setSubmitSuccess(false)}
                        variant="outline"
                        size="lg"
                      >
                        Enviar otra consulta
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitContact} className="space-y-premium-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-premium-md">
                        <div>
                          <label className="block caption-lg font-medium text-premium-primary mb-premium-sm">
                            Nombre completo *
                          </label>
                          <Input
                            type="text"
                            value={contactForm.name}
                            onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-premium-card border-support-gray/30 text-premium-primary placeholder:text-premium-secondary focus:border-vibrant-orange"
                            placeholder="Tu nombre completo"
                            required
                          />
                        </div>
                        <div>
                          <label className="block caption-lg font-medium text-premium-primary mb-premium-sm">
                            Email *
                          </label>
                          <Input
                            type="email"
                            value={contactForm.email}
                            onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                            className="bg-premium-card border-support-gray/30 text-premium-primary placeholder:text-premium-secondary focus:border-vibrant-orange"
                            placeholder="tu@email.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-premium-md">
                        <div>
                          <label className="block caption-lg font-medium text-premium-primary mb-premium-sm">
                            Teléfono
                          </label>
                          <Input
                            type="tel"
                            value={contactForm.phone}
                            onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="bg-premium-card border-support-gray/30 text-premium-primary placeholder:text-premium-secondary focus:border-vibrant-orange"
                            placeholder="+54 3482 308100"
                          />
                        </div>
                        <div>
                          <label className="block caption-lg font-medium text-premium-primary mb-premium-sm">
                            Asunto *
                          </label>
                          <Select value={contactForm.subject} onValueChange={(value) => setContactForm(prev => ({ ...prev, subject: value }))}>
                            <SelectTrigger className="bg-premium-card border-support-gray/30 text-premium-primary">
                              <SelectValue placeholder="Selecciona un asunto" />
                            </SelectTrigger>
                            <SelectContent className="bg-premium-card border-support-gray/30">
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
                        <label className="block caption-lg font-medium text-premium-primary mb-premium-sm">
                          Mensaje *
                        </label>
                        <Textarea
                          value={contactForm.message}
                          onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                          className="bg-premium-card border-support-gray/30 text-premium-primary placeholder:text-premium-secondary focus:border-vibrant-orange min-h-32"
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
                        size="lg"
                        className="w-full"
                        disabled={submitLoading || !contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message}
                      >
                        {submitLoading ? "Enviando..." : "Enviar Consulta"}
                        <Send className="w-5 h-5 ml-2" />
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
              <div className="space-y-premium-lg">
                <div>
                  <h2 className="heading-xl text-premium-primary mb-premium-md">
                    Información de <span className="accent-premium">Contacto</span>
                  </h2>
                  <p className="body-lg text-premium-secondary mb-premium-lg">
                    Visitanos en nuestra oficina o contactanos por cualquiera de nuestros canales disponibles
                  </p>
                </div>

                {/* Contact Details */}
                <div className="space-y-premium-md">
                  <Card>
                    <CardContent className="card-premium">
                      <div className="flex items-start space-x-premium-md">
                        <div className="bg-vibrant-orange/20 p-3 rounded-2xl">
                          <MapPin className="w-6 h-6 text-vibrant-orange" />
                        </div>
                        <div>
                          <h3 className="heading-sm text-premium-primary mb-premium-sm">Dirección</h3>
                          <p className="body-md text-premium-secondary">Jorge Newbery 1562</p>
                          <p className="body-md text-premium-secondary">Reconquista, Santa Fe, Argentina</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="card-premium">
                      <div className="flex items-start space-x-premium-md">
                        <div className="bg-vibrant-orange/20 p-3 rounded-2xl">
                          <Clock className="w-6 h-6 text-vibrant-orange" />
                        </div>
                        <div>
                          <h3 className="heading-sm text-premium-primary mb-premium-sm">Horarios de Atención</h3>
                          <p className="body-md text-premium-secondary">Lunes a Viernes: 9:00 - 18:00</p>
                          <p className="body-md text-premium-secondary">Sábados: 9:00 - 13:00</p>
                          <p className="body-md text-premium-secondary">Domingos: Cerrado</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="card-premium">
                      <div className="flex items-start space-x-premium-md">
                        <div className="bg-vibrant-orange/20 p-3 rounded-2xl">
                          <HeadphonesIcon className="w-6 h-6 text-vibrant-orange" />
                        </div>
                        <div>
                          <h3 className="heading-sm text-premium-primary mb-premium-sm">Contacto Directo</h3>
                          <p className="body-md text-premium-secondary mb-premium-sm">Teléfono: +54 3482 308100</p>
                          <p className="body-md text-premium-secondary mb-premium-sm">WhatsApp: +54 9 3482 308100</p>
                          <p className="body-md text-premium-secondary">Email: marconinegociosinmobiliarios@hotmail.com</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Social Media */}
                <Card>
                  <CardContent className="card-premium">
                    <h3 className="heading-sm text-premium-primary mb-premium-md">Seguinos en Redes Sociales</h3>
                    <div className="flex space-x-premium-sm">
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-blue-600 hover:text-bone-white hover:border-blue-600"
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
                        className="hover:bg-pink-600 hover:text-bone-white hover:border-pink-600"
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

      {/* Map Section - PREMIUM DESIGN */}
      <section className="section-premium bg-premium-main">
        <div className="container-premium">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-premium-xl"
          >
            <h2 className="display-md text-premium-primary mb-premium-lg">
              Encontranos en <span className="accent-premium">Reconquista</span>
            </h2>
            <p className="body-xl text-premium-secondary max-w-3xl mx-auto">
              Ubicados en el corazón de la ciudad, con fácil acceso y estacionamiento disponible
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="card-premium">
                <div className="aspect-video bg-support-gray/10 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-vibrant-orange mx-auto mb-premium-md" />
                    <p className="heading-md text-premium-primary mb-premium-sm">Mapa de Google Maps</p>
                    <p className="body-md text-premium-secondary mb-premium-md">Jorge Newbery 1562, Reconquista, Santa Fe</p>
                    <Button
                      size="lg"
                      asChild
                    >
                      <a
                        href="https://maps.google.com/?q=Reconquista,+Santa+Fe,+Argentina"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="w-5 h-5 mr-2" />
                        Ver en Google Maps
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section - PREMIUM DESIGN */}
      <section className="section-premium bg-premium-main">
        <div className="container-premium">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-premium-xl"
          >
            <h2 className="display-md text-premium-primary mb-premium-lg">
              ¿Por qué elegir <span className="accent-premium">Marconi Inmobiliaria</span>?
            </h2>
            <p className="body-xl text-premium-secondary max-w-4xl mx-auto">
              Nuestro compromiso va más allá de simplemente vender propiedades. 
              Te acompañamos en todo el proceso con profesionalismo y dedicación.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-premium-lg">
            {whyChooseUsReasons.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-vibrant-orange/10 rounded-2xl mb-premium-lg">
                  <reason.icon className="h-10 w-10 text-vibrant-orange" />
                </div>
                <h3 className="heading-md text-premium-primary mb-premium-md">{reason.title}</h3>
                <p className="body-md text-premium-secondary">{reason.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - PREMIUM DESIGN */}
      <section className="section-premium bg-premium-main">
        <div className="container-premium">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-premium-xl"
          >
            <h2 className="display-md text-premium-primary mb-premium-lg">
              Preguntas <span className="accent-premium">Frecuentes</span>
            </h2>
            <p className="body-xl text-premium-secondary max-w-3xl mx-auto">
              Resolvemos las dudas más comunes de nuestros clientes
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-premium-md">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="card-premium">
                    <h3 className="heading-md text-premium-primary mb-premium-sm">{faq.question}</h3>
                    <p className="body-md text-premium-secondary">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-premium-xl"
          >
            <p className="body-lg text-premium-secondary mb-premium-lg">
              ¿No encontrás la respuesta que buscás?
            </p>
            <Button
              size="lg"
              onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Contactanos Directamente
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}