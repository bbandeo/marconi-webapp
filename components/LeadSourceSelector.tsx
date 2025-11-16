'use client'

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, MessageCircle, Mail, Globe, Users, Building2, Star, Zap } from "lucide-react"
import { type LeadSourceCode } from "@/types/analytics"

interface LeadSource {
  id: number
  name: LeadSourceCode
  display_name: string
  description: string | null
  icon_name: string | null
  is_active: boolean
  created_at: string
}

interface LeadSourceSelectorProps {
  value?: LeadSourceCode
  onChange: (sourceCode: LeadSourceCode) => void
  showDescription?: boolean
  variant?: 'select' | 'cards' | 'badges'
  disabled?: boolean
  className?: string
}

const defaultLeadSources: LeadSource[] = [
  {
    id: 1,
    name: 'web_form',
    display_name: 'Formulario Web',
    description: 'Consulta enviada desde el formulario de contacto del sitio web',
    icon_name: 'globe',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'whatsapp',
    display_name: 'WhatsApp',
    description: 'Contacto inicial por WhatsApp',
    icon_name: 'message-circle',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'phone_call',
    display_name: 'Llamada Telefónica',
    description: 'Contacto por llamada telefónica directa',
    icon_name: 'phone',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'email',
    display_name: 'Email Directo',
    description: 'Consulta enviada por email directo',
    icon_name: 'mail',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    name: 'referral',
    display_name: 'Referido',
    description: 'Cliente referido por otro cliente o contacto',
    icon_name: 'users',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    name: 'walk_in',
    display_name: 'Visita en Oficina',
    description: 'Cliente que se acercó directamente a la oficina',
    icon_name: 'building-2',
    is_active: true,
    created_at: new Date().toISOString()
  }
]

const getSourceIcon = (iconName: string | null) => {
  switch (iconName) {
    case 'phone':
      return <Phone className="w-4 h-4" />
    case 'message-circle':
      return <MessageCircle className="w-4 h-4" />
    case 'mail':
      return <Mail className="w-4 h-4" />
    case 'globe':
      return <Globe className="w-4 h-4" />
    case 'users':
      return <Users className="w-4 h-4" />
    case 'building-2':
      return <Building2 className="w-4 h-4" />
    default:
      return <Star className="w-4 h-4" />
  }
}

const getSourceColor = (sourceCode: LeadSourceCode) => {
  switch (sourceCode) {
    case 'whatsapp':
      return 'bg-green-500 hover:bg-green-600'
    case 'phone_call':
      return 'bg-blue-500 hover:bg-blue-600'
    case 'email':
      return 'bg-red-500 hover:bg-red-600'
    case 'web_form':
      return 'bg-purple-500 hover:bg-purple-600'
    case 'referral':
      return 'bg-yellow-500 hover:bg-yellow-600'
    case 'walk_in':
      return 'bg-gray-500 hover:bg-gray-600'
    default:
      return 'bg-indigo-500 hover:bg-indigo-600'
  }
}

export function LeadSourceSelector({
  value,
  onChange,
  showDescription = false,
  variant = 'select',
  disabled = false,
  className = ''
}: LeadSourceSelectorProps) {
  const [leadSources, setLeadSources] = useState<LeadSource[]>(defaultLeadSources)
  const [loading, setLoading] = useState(false)

  // Fetch lead sources from API if available
  useEffect(() => {
    const fetchLeadSources = async () => {
      try {
        setLoading(true)
        // This would normally fetch from /api/analytics/lead-sources
        // For now, we use the default sources
        setLeadSources(defaultLeadSources)
      } catch (error) {
        console.warn('Failed to fetch lead sources, using defaults:', error)
        setLeadSources(defaultLeadSources)
      } finally {
        setLoading(false)
      }
    }

    fetchLeadSources()
  }, [])

  const activeSources = leadSources.filter(source => source.is_active)
  const selectedSource = activeSources.find(source => source.name === value)

  if (variant === 'select') {
    return (
      <div className={className}>
        <Select
          value={value}
          onValueChange={onChange}
          disabled={disabled || loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar fuente del lead">
              {selectedSource && (
                <div className="flex items-center gap-2">
                  {getSourceIcon(selectedSource.icon_name)}
                  <span>{selectedSource.display_name}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {activeSources.map((source) => (
              <SelectItem key={source.id} value={source.name}>
                <div className="flex items-center gap-2">
                  {getSourceIcon(source.icon_name)}
                  <span>{source.display_name}</span>
                  {showDescription && source.description && (
                    <span className="text-xs text-gray-500 ml-2">
                      {source.description}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  if (variant === 'badges') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {activeSources.map((source) => (
          <Badge
            key={source.id}
            variant={value === source.name ? "default" : "outline"}
            className={`cursor-pointer transition-colors ${
              value === source.name ? getSourceColor(source.name) : 'hover:bg-gray-100'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onChange(source.name)}
          >
            <div className="flex items-center gap-2">
              {getSourceIcon(source.icon_name)}
              <span>{source.display_name}</span>
            </div>
          </Badge>
        ))}
      </div>
    )
  }

  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
        {activeSources.map((source) => (
          <Card
            key={source.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              value === source.name ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onChange(source.name)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getSourceColor(source.name)}`}>
                  {getSourceIcon(source.icon_name)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{source.display_name}</h4>
                  {showDescription && source.description && (
                    <p className="text-sm text-gray-600 mt-1">{source.description}</p>
                  )}
                </div>
                {value === source.name && (
                  <div className="text-blue-500">
                    <Zap className="w-4 h-4" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return null
}

// Hook for managing lead source in forms
export function useLeadSourceSelector(initialSource?: LeadSourceCode) {
  const [selectedSource, setSelectedSource] = useState<LeadSourceCode | undefined>(initialSource)
  const [isValid, setIsValid] = useState(Boolean(initialSource))

  const handleSourceChange = (sourceCode: LeadSourceCode) => {
    setSelectedSource(sourceCode)
    setIsValid(true)
  }

  const reset = () => {
    setSelectedSource(undefined)
    setIsValid(false)
  }

  return {
    selectedSource,
    isValid,
    handleSourceChange,
    reset,
    // Pre-configured component props
    selectorProps: {
      value: selectedSource,
      onChange: handleSourceChange
    }
  }
}

// Automatic source detection helper
export function useLeadSourceDetection() {
  const [detectedSource, setDetectedSource] = useState<LeadSourceCode | null>(null)

  useEffect(() => {
    // Auto-detect source based on URL parameters or referrer
    const urlParams = new URLSearchParams(window.location.search)
    const referrer = document.referrer

    if (urlParams.get('source') === 'whatsapp' || urlParams.get('utm_source') === 'whatsapp') {
      setDetectedSource('whatsapp')
    } else if (urlParams.get('source') === 'email' || urlParams.get('utm_medium') === 'email') {
      setDetectedSource('email')
    } else if (referrer.includes('google.com') || referrer.includes('bing.com')) {
      setDetectedSource('web_form')
    } else if (referrer && !referrer.includes(window.location.hostname)) {
      setDetectedSource('web_form')
    } else if (urlParams.get('source') === 'referral') {
      setDetectedSource('referral')
    } else {
      setDetectedSource('web_form') // Default fallback
    }
  }, [])

  return detectedSource
}

// Lead source statistics component
interface LeadSourceStatsProps {
  className?: string
}

export function LeadSourceStats({ className = '' }: LeadSourceStatsProps) {
  const [stats, setStats] = useState<Record<LeadSourceCode, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        // This would fetch from /api/analytics/lead-sources/stats
        // For now, we'll use mock data
        setStats({
          web_form: 45,
          whatsapp: 32,
          phone_call: 18,
          email: 12,
          referral: 8,
          walk_in: 5
        })
      } catch (error) {
        console.error('Failed to fetch lead source stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div className={`animate-pulse bg-gray-200 h-32 rounded ${className}`} />
  }

  const sortedStats = Object.entries(stats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Fuentes de Leads
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedStats.map(([sourceCode, count]) => {
            const source = defaultLeadSources.find(s => s.name === sourceCode)
            if (!source) return null
            
            const total = Object.values(stats).reduce((sum, val) => sum + val, 0)
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0

            return (
              <div key={sourceCode} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getSourceIcon(source.icon_name)}
                  <span className="text-sm font-medium">{source.display_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{count}</span>
                  <Badge variant="outline" className="text-xs">
                    {percentage}%
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}