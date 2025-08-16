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
import Header from "@/components/Header";

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
              NUESTROS <span className="accent-premium">AGENTES</span>
            </h1>
            <p className="body-xl text-premium-secondary max-w-4xl mx-auto mb-premium-xl">
              Conocé al equipo de profesionales inmobiliarios que te acompañará 
              en cada paso para encontrar tu próxima propiedad en Reconquista
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Section - PREMIUM DESIGN */}
      <section className="section-premium bg-premium-main">
        <div className="container-premium">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-premium-xl"
          >
            <h2 className="display-md text-premium-primary mb-premium-lg">
              Nuestro Equipo de Expertos
            </h2>
            <p className="body-xl text-premium-secondary max-w-3xl mx-auto">
              Cada uno de nuestros agentes cuenta con años de experiencia y conocimiento 
              profundo del mercado inmobiliario local
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-premium-lg">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-3xl transition-all duration-500 group">
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
                    <div className="absolute top-premium-sm right-premium-sm">
                      <Badge className="bg-vibrant-orange text-bone-white">
                        <div className="w-2 h-2 bg-bone-white rounded-full mr-1"></div>
                        Disponible
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="card-premium">
                    <div className="mb-premium-md">
                      <h3 className="heading-lg text-premium-primary mb-premium-sm">{agent.name}</h3>
                      <p className="body-md text-vibrant-orange font-semibold mb-premium-sm">{agent.role}</p>
                    </div>

                    <div className="mb-premium-md">
                      <Badge variant="secondary" className="bg-support-gray/10 text-premium-secondary mb-premium-sm">
                        {agent.specialization}
                      </Badge>
                    </div>


                    <div className="flex gap-premium-sm">
                      <Button 
                        className="flex-1"
                        onClick={() => handleContactAgent(agent)}
                      >
                        Contactar
                        <MessageCircle className="w-4 h-4 ml-1" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
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


      {/* Contact Form Section - PREMIUM DESIGN */}
      <section id="contact-form" className="section-premium bg-premium-main">
        <div className="container-premium">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-premium-xl"
            >
              <h2 className="display-md text-premium-primary mb-premium-lg">
                {selectedAgent ? (
                  <>Contactá a <span className="accent-premium">{selectedAgent.name}</span></>
                ) : (
                  <>Contactá a Nuestro <span className="accent-premium">Equipo</span></>
                )}
              </h2>
              <p className="body-xl text-premium-secondary">
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
              <Card>
                <CardContent className="card-premium">
                  {submitSuccess ? (
                    <div className="text-center py-premium-lg">
                      <div className="w-20 h-20 bg-vibrant-orange rounded-full flex items-center justify-center mx-auto mb-premium-md">
                        <Check className="w-10 h-10 text-bone-white" />
                      </div>
                      <h3 className="heading-lg text-premium-primary mb-premium-sm">¡Mensaje Enviado!</h3>
                      <p className="body-lg text-premium-secondary mb-premium-lg">
                        {selectedAgent ? `${selectedAgent.name} recibirá` : "Nuestro equipo recibirá"} tu consulta 
                        y se pondrá en contacto contigo a la brevedad.
                      </p>
                      <Button
                        onClick={() => {
                          setSubmitSuccess(false);
                          setSelectedAgent(null);
                        }}
                        variant="outline"
                        size="lg"
                      >
                        Enviar otra consulta
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitContact} className="space-y-premium-lg">
                      {selectedAgent && (
                        <div className="bg-vibrant-orange/10 border border-vibrant-orange/20 rounded-2xl p-premium-md">
                          <div className="flex items-center">
                            <selectedAgent.icon className="w-8 h-8 text-vibrant-orange mr-3" />
                            <div>
                              <div className="heading-sm text-premium-primary">{selectedAgent.name}</div>
                              <div className="caption-lg text-vibrant-orange">{selectedAgent.specialization}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-premium-md">
                        <div>
                          <label className="block caption-lg font-medium text-premium-primary mb-premium-sm">
                            Nombre completo
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
                            Email
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

                      <div>
                        <label className="block caption-lg font-medium text-premium-primary mb-premium-sm">
                          Teléfono
                        </label>
                        <Input
                          type="tel"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="bg-premium-card border-support-gray/30 text-premium-primary placeholder:text-premium-secondary focus:border-vibrant-orange"
                          placeholder="+54 9 3482 308100"
                        />
                      </div>

                      <div>
                        <label className="block caption-lg font-medium text-premium-primary mb-premium-sm">
                          Mensaje
                        </label>
                        <Textarea
                          value={contactForm.message}
                          onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                          className="bg-premium-card border-support-gray/30 text-premium-primary placeholder:text-premium-secondary focus:border-vibrant-orange min-h-32"
                          placeholder="Contanos qué tipo de propiedad estás buscando, tu presupuesto y cualquier detalle importante..."
                          required
                        />
                      </div>

                      <div className="flex gap-premium-sm">
                        <Button
                          type="submit"
                          size="lg"
                          className="flex-1"
                          disabled={submitLoading}
                        >
                          {submitLoading ? "Enviando..." : "Enviar Consulta"}
                          <MessageCircle className="w-5 h-5 ml-2" />
                        </Button>
                        {selectedAgent && (
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
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
                <div className="inline-flex items-center justify-center w-20 h-20 bg-vibrant-orange/10 rounded-2xl mb-premium-lg">
                  <feature.icon className="h-10 w-10 text-vibrant-orange" />
                </div>
                <h3 className="heading-md text-premium-primary mb-premium-md">{feature.title}</h3>
                <p className="body-md text-premium-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </div>
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
                    className="body-md hover:text-vibrant-orange transition-colors accent-premium"
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