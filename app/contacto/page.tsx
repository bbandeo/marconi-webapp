
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Phone, Mail, MapPin, MessageSquare, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create WhatsApp message
    const message = `Hola, soy ${formData.name}.\n\nEmail: ${formData.email}\nTeléfono: ${formData.phone}\n\nMensaje: ${formData.message}`
    const whatsappUrl = `https://wa.me/5493482123456?text=${encodeURIComponent(message)}`
    
    window.open(whatsappUrl, '_blank')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/assets/logos/logocasa.svg"
                alt="Logo Casa"
                width={32}
                height={32}
                className="h-8 w-8 md:h-10 md:w-10"
                priority
              />
              <Image
                src="/assets/logos/marconi_title.svg"
                alt="Marconi Inmobiliaria"
                width={140}
                height={45}
                className="h-8 md:h-10 w-auto"
                priority
              />
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/propiedades" className="text-gray-300 hover:text-white transition-colors">
                PROPIEDADES
              </Link>
              <Link href="/contacto" className="text-white font-semibold">
                CONTACTO
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-museo font-medium text-white mb-6">
              Contactanos
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Estamos aquí para ayudarte a encontrar la propiedad perfecta
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Envíanos un mensaje</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Input
                      type="text"
                      name="name"
                      placeholder="Tu nombre"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Tu email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="Tu teléfono"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <Textarea
                      name="message"
                      placeholder="¿En qué podemos ayudarte?"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-brand-orange hover:bg-orange-600 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-8">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-brand-orange p-3 rounded-lg">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-2">Teléfono</h3>
                      <p className="text-gray-300">+54 9 3482 123456</p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-brand-orange"
                        onClick={() => window.open('tel:+5493482123456')}
                      >
                        Llamar ahora
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-brand-orange p-3 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-2">WhatsApp</h3>
                      <p className="text-gray-300">Chatea con nosotros</p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-brand-orange"
                        onClick={() => window.open('https://wa.me/5493482123456?text=Hola,%20quiero%20más%20información', '_blank')}
                      >
                        Abrir WhatsApp
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-brand-orange p-3 rounded-lg">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-2">Email</h3>
                      <p className="text-gray-300">info@marconiinmobiliaria.com</p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-brand-orange"
                        onClick={() => window.open('mailto:info@marconiinmobiliaria.com')}
                      >
                        Enviar email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-brand-orange p-3 rounded-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-2">Ubicación</h3>
                      <p className="text-gray-300">
                        Reconquista, Santa Fe<br />
                        Argentina
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
