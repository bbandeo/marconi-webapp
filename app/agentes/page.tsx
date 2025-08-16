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
import { PageLayout } from "@/components/layout/PageLayout";
import { SectionSeparator } from "@/components/SectionSeparator";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

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

  // Animation hooks
  const teamAnimation = useScrollAnimation({ threshold: 0.1 });
  const contactAnimation = useScrollAnimation({ threshold: 0.2 });
  const featuresAnimation = useScrollAnimation({ threshold: 0.1 });

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
    <PageLayout
      title="NUESTROS AGENTES"
      subtitle="Conocé al equipo de profesionales inmobiliarios que te acompañará en cada paso para encontrar tu próxima propiedad en Reconquista"
      showHero={true}
      className="bg-premium-gray-950"
    >

      {/* Team Section */}
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
            {...teamAnimation.getMotionProps("fadeUp")}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Nuestro Equipo de <span className="gradient-text font-museo">Expertos</span>
            </h2>
            <p className="text-xl text-premium-gray-300 max-w-3xl mx-auto">
              Cada uno de nuestros agentes cuenta con años de experiencia y conocimiento 
              profundo del mercado inmobiliario local de Reconquista
            </p>
          </motion.div>

          <motion.div 
            {...teamAnimation.getStaggerContainer(0.15)}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                {...teamAnimation.getStaggerChild()}
                className="group"
              >
                <Card className="property-card bg-premium-gray-900/60 backdrop-blur-xl border-premium-gray-700/30 border-2 overflow-hidden h-full flex flex-col rounded-3xl shadow-2xl">
                  <div className="relative overflow-hidden rounded-t-3xl">
                    <div className="aspect-[3/4] overflow-hidden group">
                      <Image
                        src={getOptimizedImageUrl(agent.image, { 
                          width: 400, 
                          height: 500, 
                          crop: "fill", 
                          gravity: "face",
                          quality: "auto:best",
                          format: "auto"
                        })}
                        alt={agent.name}
                        width={400}
                        height={500}
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-out"
                      />
                      
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    {/* Status badge */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="absolute top-6 right-6"
                    >
                      <div className="glass text-green-400 border border-green-500/30 px-3 py-2 rounded-2xl text-sm font-bold shadow-2xl backdrop-blur-lg flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                        Disponible
                      </div>
                    </motion.div>

                    {/* Specialization icon */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                      className="absolute top-6 left-6"
                    >
                      <div className="w-12 h-12 bg-premium-orange-500/20 border border-premium-orange-500/30 rounded-2xl flex items-center justify-center backdrop-blur-lg">
                        <agent.icon className="w-6 h-6 text-premium-orange-400" />
                      </div>
                    </motion.div>

                    {/* Contact overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="glass text-white px-6 py-3 rounded-2xl font-bold backdrop-blur-lg border border-white/20"
                      >
                        <MessageCircle className="w-5 h-5 inline mr-2" />
                        Contactar
                      </motion.div>
                    </div>
                  </div>

                  <CardContent className="p-6 flex flex-col flex-1 space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-white mb-2">{agent.name}</h3>
                      <p className="gradient-text font-bold text-lg">{agent.role}</p>
                      <div className="glass px-4 py-2 rounded-xl">
                        <p className="text-premium-gray-300 text-sm font-medium">{agent.specialization}</p>
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="text-premium-gray-400 text-sm leading-relaxed line-clamp-3">
                        {agent.description}
                      </p>
                    </div>

                    {/* Achievements */}
                    <div className="space-y-2">
                      <h4 className="text-premium-gray-300 font-semibold text-sm">Logros destacados:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {agent.achievements.slice(0, 2).map((achievement, i) => (
                          <div key={i} className="glass px-2 py-1 rounded-lg">
                            <p className="text-premium-orange-300 text-xs font-medium">{achievement}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-premium-gray-700/50">
                      <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          className="w-full bg-premium-orange-600 hover:bg-premium-orange-700 text-white font-bold py-3 rounded-2xl shadow-2xl hover:shadow-premium transition-all duration-300 group"
                          onClick={() => handleContactAgent(agent)}
                        >
                          <span className="mr-2">Contactar</span>
                          <MessageCircle className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        </Button>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-2 border-premium-gray-600/50 text-premium-gray-300 hover:bg-premium-orange-500/20 hover:text-premium-orange-400 hover:border-premium-orange-500/50 glass rounded-2xl p-3 transition-all duration-300"
                          asChild
                        >
                          <a href={`tel:${agent.phone}`}>
                            <Phone className="w-5 h-5" />
                          </a>
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <SectionSeparator variant="minimal" />


      {/* Contact Form Section */}
      <section id="contact-form" className="py-24 bg-premium-gray-950 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, #f97316 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, #ea580c 0%, transparent 50%)`
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            <motion.div
              {...contactAnimation.getMotionProps("fadeUp")}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {selectedAgent ? (
                  <>Contactá a <span className="gradient-text font-museo">{selectedAgent.name}</span></>
                ) : (
                  <>Contactá a Nuestro <span className="gradient-text font-museo">Equipo</span></>
                )}
              </h2>
              <p className="text-xl text-premium-gray-300">
                {selectedAgent ? 
                  `${selectedAgent.name} te responderá a la brevedad para ayudarte con ${selectedAgent.specialization.toLowerCase()}` :
                  "Completá el formulario y nuestros agentes se pondrán en contacto contigo"
                }
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={contactAnimation.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-premium-gray-900/60 backdrop-blur-xl border-premium-gray-700/30 border-2 rounded-3xl shadow-2xl">
                <CardContent className="p-8">
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
                        {selectedAgent ? `${selectedAgent.name} recibirá` : "Nuestro equipo recibirá"} tu consulta 
                        y se pondrá en contacto contigo a la brevedad.
                      </p>
                      <Button
                        onClick={() => {
                          setSubmitSuccess(false);
                          setSelectedAgent(null);
                        }}
                        variant="outline"
                        className="border-2 border-premium-gray-600/50 text-premium-gray-300 hover:bg-premium-orange-500/20 hover:text-premium-orange-400 hover:border-premium-orange-500/50 glass rounded-2xl px-8 py-3"
                      >
                        Enviar otra consulta
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmitContact} className="space-y-6">
                      {selectedAgent && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                          className="glass border border-premium-orange-500/30 rounded-2xl p-6"
                        >
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-premium-orange-500/20 border border-premium-orange-500/30 rounded-2xl flex items-center justify-center mr-4">
                              <selectedAgent.icon className="w-6 h-6 text-premium-orange-400" />
                            </div>
                            <div>
                              <div className="font-bold text-white text-lg">{selectedAgent.name}</div>
                              <div className="text-premium-orange-400 font-medium">{selectedAgent.specialization}</div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-premium-gray-300 mb-3">
                            Nombre completo
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
                            Email
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

                      <div>
                        <label className="block text-sm font-bold text-premium-gray-300 mb-3">
                          Teléfono
                        </label>
                        <Input
                          type="tel"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="bg-premium-gray-800/60 border-premium-gray-600/50 text-white placeholder-premium-gray-400 focus:border-premium-orange-500 rounded-2xl backdrop-blur-md h-12"
                          placeholder="+54 9 3482 308100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-premium-gray-300 mb-3">
                          Mensaje
                        </label>
                        <Textarea
                          value={contactForm.message}
                          onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                          className="bg-premium-gray-800/60 border-premium-gray-600/50 text-white placeholder-premium-gray-400 focus:border-premium-orange-500 min-h-32 rounded-2xl backdrop-blur-md"
                          placeholder="Contanos qué tipo de propiedad estás buscando, tu presupuesto y cualquier detalle importante..."
                          required
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            type="submit"
                            className="w-full bg-premium-orange-600 hover:bg-premium-orange-700 text-white font-bold py-4 rounded-2xl shadow-2xl hover:shadow-premium transition-all duration-300 group"
                            disabled={submitLoading}
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
                                <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                              </>
                            )}
                          </Button>
                        </motion.div>
                        {selectedAgent && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              type="button"
                              variant="outline"
                              className="border-2 border-premium-gray-600/50 text-premium-gray-300 hover:bg-premium-gray-700/60 hover:text-white glass rounded-2xl px-6 py-4"
                              onClick={() => {
                                setSelectedAgent(null);
                                setContactForm(prev => ({ ...prev, message: "", agentId: null }));
                              }}
                            >
                              Cancelar
                            </Button>
                          </motion.div>
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

      <SectionSeparator variant="dots" />

      {/* Why Choose Us Section */}
      <section className="py-24 bg-premium-gray-925 relative overflow-hidden">
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
            {[
              {
                icon: Users,
                title: "Atención Personalizada",
                description: "Cada cliente recibe un servicio único y adaptado a sus necesidades específicas",
                color: "text-premium-orange-400"
              },
              {
                icon: MapPin,
                title: "Conocimiento Local",
                description: "Años de experiencia en el mercado inmobiliario de Reconquista y zona",
                color: "text-premium-orange-500"
              },
              {
                icon: Award,
                title: "Profesionalismo",
                description: "Agentes certificados y en constante capacitación para brindarte el mejor servicio",
                color: "text-premium-orange-600"
              },
              {
                icon: Star,
                title: "Resultados Comprobados",
                description: "Miles de transacciones exitosas y clientes satisfechos nos respaldan",
                color: "text-premium-orange-400"
              }
            ].map((feature, index) => (
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
                  <feature.icon className={`h-10 w-10 ${feature.color}`} />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-premium-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
}