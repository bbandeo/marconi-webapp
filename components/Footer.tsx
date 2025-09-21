import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Facebook, Instagram, Linkedin, Youtube, Twitter, MapPin, Phone, Mail } from 'lucide-react'
import { SettingsService } from '@/services/settings'

export default async function Footer() {
  const settings = await SettingsService.getSettingsWithDefaults()
  return (
    <footer className="bg-gray-900 pt-8 pb-16 relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              {settings.logo_url ? (
                <Image
                  src={settings.logo_url}
                  alt={settings.company_name || "Logo"}
                  width={140}
                  height={45}
                  className="h-10 w-auto"
                />
              ) : (
                <div className="text-2xl font-bold text-white">
                  {settings.company_name || "Inmobiliaria"}
                </div>
              )}
            </div>
            <p className="text-lg text-gray-300 mb-6 max-w-md leading-relaxed">
              {settings.company_description ||
                "Experiencia premium en bienes raíces. Comprometidos con encontrar la propiedad perfecta para cada familia."
              }
            </p>

            {/* Redes sociales dinámicas */}
            <div className="flex space-x-4">
              {settings.social_media?.facebook && (
                <Link
                  href={settings.social_media.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:border-blue-600 hover:bg-blue-600/10 transition-all duration-300"
                >
                  <Facebook className="w-4 h-4 text-gray-400 hover:text-blue-600 transition-colors duration-300" />
                </Link>
              )}
              {settings.social_media?.instagram && (
                <Link
                  href={settings.social_media.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:border-pink-600 hover:bg-pink-600/10 transition-all duration-300"
                >
                  <Instagram className="w-4 h-4 text-gray-400 hover:text-pink-600 transition-colors duration-300" />
                </Link>
              )}
              {settings.social_media?.linkedin && (
                <Link
                  href={settings.social_media.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:border-blue-700 hover:bg-blue-700/10 transition-all duration-300"
                >
                  <Linkedin className="w-4 h-4 text-gray-400 hover:text-blue-700 transition-colors duration-300" />
                </Link>
              )}
              {settings.social_media?.youtube && (
                <Link
                  href={settings.social_media.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:border-red-600 hover:bg-red-600/10 transition-all duration-300"
                >
                  <Youtube className="w-4 h-4 text-gray-400 hover:text-red-600 transition-colors duration-300" />
                </Link>
              )}
              {settings.social_media?.twitter && (
                <Link
                  href={settings.social_media.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:border-blue-500 hover:bg-blue-500/10 transition-all duration-300"
                >
                  <Twitter className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors duration-300" />
                </Link>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-6">Enlaces</h3>
            <ul className="space-y-4 text-gray-300">
              <li>
                <Link
                  href="/propiedades"
                  className="text-base hover:text-orange-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                >
                  Propiedades
                </Link>
              </li>
              <li>
                <Link
                  href="/agentes"
                  className="text-base hover:text-orange-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                >
                  Agentes
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-base hover:text-orange-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-6">Contacto</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                {settings.address || "Reconquista, Santa Fe"}
              </li>
              {settings.contact_phone && (
                <li className="text-base flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  {settings.contact_phone}
                </li>
              )}
              {settings.contact_email && (
                <li className="text-base flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  {settings.contact_email}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700/50 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-base">
            &copy; 2025 {settings.company_name || "Inmobiliaria"}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}