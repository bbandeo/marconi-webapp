"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MessageCircle, User, Award } from "lucide-react"
import type { Agent } from "@/lib/supabase"
import { getOptimizedImageUrl } from "@/lib/cloudinary"

interface AgentCardProps {
  agent: Agent
}

export default function AgentCard({ agent }: AgentCardProps) {
  const handleEmail = () => {
    window.location.href = `mailto:${agent.email}`
  }

  const handlePhone = () => {
    window.location.href = `tel:${agent.phone}`
  }

  const handleWhatsApp = () => {
    if (!agent.whatsapp) return
    // Remove any non-digit characters from phone
    const cleanPhone = agent.whatsapp.replace(/\D/g, "")
    window.open(`https://wa.me/${cleanPhone}`, "_blank")
  }

  // Get optimized photo URL if using Cloudinary
  const photoUrl = agent.photo_url
    ? agent.photo_public_id
      ? getOptimizedImageUrl(agent.photo_public_id, {
          width: 300,
          height: 300,
          crop: "fill",
          gravity: "face",
        })
      : agent.photo_url
    : null

  return (
    <Card className="group overflow-hidden bg-premium-card backdrop-blur-md border border-vibrant-orange/10 shadow-lg hover:shadow-2xl hover:shadow-vibrant-orange/20 transition-all duration-700 rounded-2xl">
      <CardContent className="p-6">
        {/* Photo Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            {photoUrl ? (
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-vibrant-orange/20 group-hover:border-vibrant-orange/40 transition-all duration-500 shadow-xl">
                <img
                  src={photoUrl}
                  alt={agent.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-vibrant-orange/20 to-orange-600/20 border-4 border-vibrant-orange/20 group-hover:border-vibrant-orange/40 flex items-center justify-center transition-all duration-500 shadow-xl">
                <User className="w-16 h-16 text-vibrant-orange/60" />
              </div>
            )}
          </div>

          {/* Name and Specialty */}
          <div className="text-center">
            <h3 className="font-bold heading-primary text-2xl mb-2 group-hover:text-vibrant-orange transition-colors">
              {agent.name}
            </h3>
            {agent.specialty && (
              <p className="text-meta font-medium text-sm mb-2">{agent.specialty}</p>
            )}
            {agent.years_of_experience !== null && agent.years_of_experience > 0 && (
              <div className="flex items-center justify-center gap-1.5 text-secondary text-xs">
                <Award className="w-3.5 h-3.5 text-vibrant-orange" />
                <span>
                  {agent.years_of_experience}{" "}
                  {agent.years_of_experience === 1 ? "año" : "años"} de experiencia
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {agent.bio && (
          <div className="mb-6">
            <p className="secondary-text text-sm text-center line-clamp-4 leading-relaxed">
              {agent.bio}
            </p>
          </div>
        )}

        {/* Contact Buttons */}
        <div className="space-y-3">
          {/* Email Button */}
          <Button
            onClick={handleEmail}
            className="w-full bg-gradient-to-r from-vibrant-orange to-orange-600 hover:from-orange-600 hover:to-red-600 text-bone-white font-semibold py-2.5 px-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-vibrant-orange/30 transition-all duration-300 text-sm"
          >
            <Mail className="w-4 h-4 mr-2" />
            Enviar Email
          </Button>

          {/* Phone and WhatsApp Buttons Row */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handlePhone}
              variant="outline"
              className="border-vibrant-orange/30 text-premium-primary hover:bg-vibrant-orange/10 hover:border-vibrant-orange/50 font-medium py-2.5 px-4 rounded-xl transition-all duration-300 text-sm"
            >
              <Phone className="w-4 h-4 mr-2" />
              Llamar
            </Button>

            {agent.whatsapp && (
              <Button
                onClick={handleWhatsApp}
                variant="outline"
                className="border-green-500/30 text-premium-primary hover:bg-green-500/10 hover:border-green-500/50 font-medium py-2.5 px-4 rounded-xl transition-all duration-300 text-sm"
              >
                <MessageCircle className="w-4 h-4 mr-2 text-green-500" />
                WhatsApp
              </Button>
            )}
          </div>
        </div>

        {/* Contact Info (for display only) */}
        <div className="mt-6 pt-6 border-t border-support-gray/20 space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs secondary-text">
            <Mail className="w-3.5 h-3.5 text-meta" />
            <span className="truncate">{agent.email}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs secondary-text">
            <Phone className="w-3.5 h-3.5 text-meta" />
            <span>{agent.phone}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
