"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Award,
  Users,
  Home,
  Star,
  MessageCircle,
  Building2,
  Landmark,
  Crown,
  Check,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import Image from "next/image";
import Link from "next/link";
import { SectionDivider } from "@/components/ui/section-divider";

interface Agent {
  id: number;
  name: string;
  role: string;
  specialization: string;
  phone: string;
  email: string;
  image: string;
  description: string;
  achievements: string[];
  icon: typeof Home;
}

const agents: Agent[] = [
  {
    id: 1,
    name: "Gustavo Marconi",
    role: "Gestor Comercial y CEO",
    specialization: "Propiedades Residenciales y Comerciales",
    phone: "+54 9 3482 704694",
    email: "marconinegociosinmobiliarios@hotmail.com",
    image: "gustavo_vdczse",
    description: "CEO y fundador de Marconi Inmobiliaria, con más de 15 años de experiencia en el mercado inmobiliario de Reconquista. Especialista en propiedades residenciales y comerciales, liderando el equipo con visión estratégica y compromiso total con la satisfacción del cliente.",
    achievements: [
      "Fundador de Marconi Inmobiliaria",
      "Más de 500 transacciones exitosas",
      "Líder del mercado inmobiliario local",
      "Especialista en inversiones inmobiliarias"
    ],
    icon: Crown
  },
  {
    id: 2,
    name: "Ramón Suligoy",
    role: "Gestor comercial",
    specialization: "Propiedades Comerciales",
    phone: "+54 9 3482 219676",
    email: "marconinegociosinmobiliarios@hotmail.com",
    image: "ramon_iyryyc",
    description: "Gestor comercial especializado en propiedades comerciales e inversiones. Con amplia experiencia en el mercado local, ayuda a empresarios y emprendedores a encontrar la ubicación perfecta para sus negocios en Reconquista y zona.",
    achievements: [
      "Especialista en locales comerciales",
      "Asesor de más de 100 empresas",
      "Experto en inversiones comerciales",
      "Conocimiento profundo del mercado local"
    ],
    icon: Building2
  },
  {
    id: 3,
    name: "Priscila Maydana",
    role: "Gestora comercial",
    specialization: "Propiedades Residenciales",
    phone: "+54 9 3482 653547",
    email: "marconinegociosinmobiliarios@hotmail.com",
    image: "priscila_gbc46h",
    description: "Gestora comercial especializada en propiedades residenciales. Su enfoque personalizado y atención al detalle la convierten en la elección ideal para familias que buscan su hogar perfecto en Reconquista.",
    achievements: [
      "Especialista en propiedades familiares",
      "Más de 200 familias satisfechas",
      "Experta en barrios residenciales",
      "Certificación en atención al cliente"
    ],
    icon: Home
  },
  {
    id: 4,
    name: "Facundo Altamirano",
    role: "Community manager inmobiliario",
    specialization: "Marketing Digital Inmobiliario",
    phone: "+54 9 3482 755308",
    email: "marconinegociosinmobiliarios@hotmail.com",
    image: "facundo_axinkj",
    description: "Community Manager especializado en marketing digital inmobiliario. Se encarga de la presencia online de la empresa y de conectar propiedades con potenciales compradores a través de estrategias digitales innovadoras.",
    achievements: [
      "Especialista en marketing digital",
      "Gestión de redes sociales inmobiliarias",
      "Estrategias de contenido efectivas",
      "Amplio alcance en redes sociales"
    ],
    icon: Users
  },
  {
    id: 5,
    name: "Micaela Domínguez",
    role: "Community manager inmobiliario",
    specialization: "Marketing Digital y Comunicaciones",
    phone: "+54 9 3487 229722",
    email: "marconinegociosinmobiliarios@hotmail.com",
    image: "micaela_rl56r5",
    description: "Community Manager especializada en comunicaciones digitales y marketing inmobiliario. Trabaja en conjunto con el equipo para crear contenido atractivo y mantener una comunicación fluida con clientes actuales y potenciales.",
    achievements: [
      "Experta en comunicación digital",
      "Gestión integral de redes sociales",
      "Creación de contenido visual",
      "Atención al cliente online"
    ],
    icon: MessageCircle
  },
  {
    id: 6,
    name: "Bruno Bordón",
    role: "Corredor Inmobiliario",
    specialization: "Transacciones Inmobiliarias",
    phone: "+54 9 3482 261937",
    email: "marconinegociosinmobiliarios@hotmail.com",
    image: "bruno_aqcgnn",
    description: "Corredor inmobiliario matriculado con amplia experiencia en transacciones inmobiliarias. Se especializa en asesorar legalmente las operaciones y garantizar que todos los procesos se realicen de manera correcta y segura.",
    achievements: [
      "Corredor matriculado",
      "Especialista en aspectos legales",
      "Más de 300 transacciones completadas",
      "Asesoramiento integral en operaciones"
    ],
    icon: Award
  }
];

export default function AgentesPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    agentId: null as number | null,
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleContactAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setContactForm(prev => ({
      ...prev,
      message: `Hola ${agent.name}, me gustaría recibir más información sobre sus servicios en ${agent.specialization}. Espero su contacto.`,
      agentId: agent.id
    }));
    
    // Scroll to contact form
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      // Here would be the API call to create a lead
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          message: contactForm.message,
          source: `agent_contact_${selectedAgent?.id}`,
          property_id: null,
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setContactForm({
          name: "",
          email: "",
          phone: "",
          message: "",
          agentId: null,
        });
        setSelectedAgent(null);
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
    } finally {
      setSubmitLoading(false);
    }
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
                className="text-brand-orange font-semibold"
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
              NUESTROS <span className="text-brand-orange">AGENTES</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Conocé al equipo de profesionales inmobiliarios que te acompañará 
              en cada paso para encontrar tu próxima propiedad en Reconquista
            </p>
          </motion.div>
        </div>
      </section>
      <SectionDivider variant="wave" />

      {/* Team Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Nuestro Equipo de Expertos
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Cada uno de nuestros agentes cuenta con años de experiencia y conocimiento 
              profundo del mercado inmobiliario local
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gray-800 border-gray-700 overflow-hidden hover:border-brand-orange transition-all duration-300 group">
                  <div className="relative">
                    <div className="aspect-[3/4] overflow-hidden">
                      <Image
                        src={getOptimizedImageUrl(agent.image, { 
                          width: 300, 
                          height: 400, 
                          crop: "fill", 
                          gravity: "face",
                          quality: "auto",
                          format: "auto"
                        })}
                        alt={agent.name}
                        width={300}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Status badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-green-500 text-white">
                        <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                        Disponible
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-1">{agent.name}</h3>
                      <p className="text-brand-orange font-semibold mb-1">{agent.role}</p>
                    </div>

                    <div className="mb-4">
                      <Badge variant="secondary" className="bg-gray-700 text-gray-300 mb-2">
                        {agent.specialization}
                      </Badge>
                    </div>


                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white"
                        onClick={() => handleContactAgent(agent)}
                      >
                        Contactar
                        <MessageCircle className="w-4 h-4 ml-1" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white bg-transparent"
                        asChild
                      >
                        <a href={`tel:${agent.phone}`}>
                          <Phone className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <SectionDivider variant="curve" />

      {/* Contact Form Section */}
      <section id="contact-form" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {selectedAgent ? (
                  <>Contactá a <span className="text-brand-orange">{selectedAgent.name}</span></>
                ) : (
                  <>Contactá a Nuestro <span className="text-brand-orange">Equipo</span></>
                )}
              </h2>
              <p className="text-lg text-gray-300">
                {selectedAgent ? 
                  `${selectedAgent.name} te responderá a la brevedad para ayudarte con ${selectedAgent.specialization.toLowerCase()}` :
                  "Completá el formulario y nuestros agentes se pondrán en contacto contigo"
                }
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8">
                  {submitSuccess ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">¡Mensaje Enviado!</h3>
                      <p className="text-gray-300 mb-6">
                        {selectedAgent ? `${selectedAgent.name} recibirá` : "Nuestro equipo recibirá"} tu consulta 
                        y se pondrá en contacto contigo a la brevedad.
                      </p>
                      <Button
                        onClick={() => {
                          setSubmitSuccess(false);
                          setSelectedAgent(null);
                        }}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white bg-transparent"
                      >
                        Enviar otra consulta
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitContact} className="space-y-6">
                      {selectedAgent && (
                        <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-lg p-4">
                          <div className="flex items-center">
                            <selectedAgent.icon className="w-8 h-8 text-brand-orange mr-3" />
                            <div>
                              <div className="font-semibold text-white">{selectedAgent.name}</div>
                              <div className="text-sm text-brand-orange">{selectedAgent.specialization}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Nombre completo
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
                            Email
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

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Teléfono
                        </label>
                        <Input
                          type="tel"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-brand-orange"
                          placeholder="+54 9 3482 308100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Mensaje
                        </label>
                        <Textarea
                          value={contactForm.message}
                          onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-brand-orange min-h-32"
                          placeholder="Contanos qué tipo de propiedad estás buscando, tu presupuesto y cualquier detalle importante..."
                          required
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="submit"
                          className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white"
                          disabled={submitLoading}
                        >
                          {submitLoading ? "Enviando..." : "Enviar Consulta"}
                          <MessageCircle className="w-4 h-4 ml-2" />
                        </Button>
                        {selectedAgent && (
                          <Button
                            type="button"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white bg-transparent"
                            onClick={() => {
                              setSelectedAgent(null);
                              setContactForm(prev => ({ ...prev, message: "", agentId: null }));
                            }}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      <SectionDivider variant="wave" />

      {/* Why Choose Us Section */}
      <section className="py-20 bg-black">
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
            {[
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
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-orange/20 rounded-full mb-6">
                  <feature.icon className="h-8 w-8 text-brand-orange" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
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