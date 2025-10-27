"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Search,
  FileText,
  Hash,
  Settings,
  Database,
  Shield,
  BarChart3,
  Code,
  Terminal,
  ArrowRight,
  ChevronRight,
  Home
} from "lucide-react"
import Link from "next/link"

interface Section {
  title: string
  id: string
  icon: JSX.Element
  level: number
}

interface ApiEndpoint {
  method: string
  path: string
  description: string
}

export default function ReadmeDocumentation() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeSection, setActiveSection] = useState("")
  const [readmeContent, setReadmeContent] = useState("")
  const [sections, setSections] = useState<Section[]>([])
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadReadmeContent = async () => {
      try {
        const response = await fetch('/api/admin/readme')
        if (response.ok) {
          const data = await response.json()
          setReadmeContent(data.content)
          setSections(data.sections)
          setApiEndpoints(data.endpoints)
        }
      } catch (error) {
        console.error('Error loading README:', error)
        // Fallback: load content directly from the file
        loadFallbackContent()
      } finally {
        setLoading(false)
      }
    }

    const loadFallbackContent = () => {
      // Simulate loading the README content for demo purposes
      const mockSections: Section[] = [
        { title: "Overview", id: "overview", icon: <BookOpen className="h-4 w-4" />, level: 1 },
        { title: "Quick Start", id: "quick-start", icon: <ArrowRight className="h-4 w-4" />, level: 1 },
        { title: "Database Setup", id: "database-setup", icon: <Database className="h-4 w-4" />, level: 2 },
        { title: "Frontend Integration", id: "frontend-integration", icon: <Code className="h-4 w-4" />, level: 2 },
        { title: "Lead Attribution", id: "lead-attribution", icon: <BarChart3 className="h-4 w-4" />, level: 2 },
        { title: "Analytics Features", id: "analytics-features", icon: <BarChart3 className="h-4 w-4" />, level: 1 },
        { title: "Privacy & GDPR Compliance", id: "privacy-gdpr", icon: <Shield className="h-4 w-4" />, level: 2 },
        { title: "Property Tracking", id: "property-tracking", icon: <Home className="h-4 w-4" />, level: 2 },
        { title: "API Endpoints", id: "api-endpoints", icon: <Terminal className="h-4 w-4" />, level: 1 },
        { title: "Session Management", id: "session-management", icon: <Settings className="h-4 w-4" />, level: 2 },
        { title: "Property Views", id: "property-views", icon: <Home className="h-4 w-4" />, level: 2 },
        { title: "Lead Generation", id: "lead-generation", icon: <BarChart3 className="h-4 w-4" />, level: 2 },
        { title: "Dashboard Integration", id: "dashboard-integration", icon: <BarChart3 className="h-4 w-4" />, level: 1 },
        { title: "Configuration Options", id: "configuration", icon: <Settings className="h-4 w-4" />, level: 1 },
        { title: "Privacy & Security", id: "privacy-security", icon: <Shield className="h-4 w-4" />, level: 1 },
        { title: "Performance Optimization", id: "performance", icon: <BarChart3 className="h-4 w-4" />, level: 1 },
        { title: "Advanced Usage", id: "advanced-usage", icon: <Code className="h-4 w-4" />, level: 1 }
      ]

      const mockEndpoints: ApiEndpoint[] = [
        { method: "POST", path: "/api/analytics/session", description: "Create or get session" },
        { method: "PUT", path: "/api/analytics/session", description: "Update session activity" },
        { method: "POST", path: "/api/analytics/property-view", description: "Track property view" },
        { method: "PUT", path: "/api/analytics/property-view", description: "Track view with auto-session" },
        { method: "PUT", path: "/api/analytics/lead-generation", description: "Track lead with source attribution" },
        { method: "GET", path: "/api/analytics/dashboard", description: "Get comprehensive dashboard data" },
        { method: "POST", path: "/api/analytics/dashboard", description: "Advanced analytics with filters" },
        { method: "GET", path: "/api/analytics/property-metrics/[id]", description: "Get detailed property analytics" },
        { method: "POST", path: "/api/analytics/gdpr/opt-out", description: "User opt-out" },
        { method: "GET", path: "/api/analytics/gdpr/opt-out", description: "Check opt-out status" }
      ]

      setSections(mockSections)
      setApiEndpoints(mockEndpoints)
    }

    loadReadmeContent()
  }, [])

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredEndpoints = apiEndpoints.filter(endpoint =>
    endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-500/20 text-green-400 border-green-400/20'
      case 'POST': return 'bg-blue-500/20 text-blue-400 border-blue-400/20'
      case 'PUT': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/20'
      case 'DELETE': return 'bg-red-500/20 text-red-400 border-red-400/20'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/20'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-10 bg-gray-700 rounded"></div>
                ))}
              </div>
              <div className="lg:col-span-3 space-y-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-32 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/admin" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Home className="h-5 w-5" />
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-500" />
            <span className="text-gray-300">Documentación</span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            📊 Sistema de Analytics - Documentación
          </h1>
          <p className="text-gray-400 mb-6">
            Documentación completa del sistema de analytics GDPR-compliant para Marconi Inmobiliaria
          </p>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Buscar en la documentación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700 sticky top-8">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Índice de Contenido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredSections.map((section, index) => (
                  <div key={index}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start text-left h-auto p-2 ${
                        section.level === 2 ? 'ml-4 text-sm' : ''
                      } ${
                        activeSection === section.id
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                      onClick={() => setActiveSection(section.id)}
                    >
                      <div className="flex items-center gap-2">
                        {section.icon}
                        <span className="truncate">{section.title}</span>
                      </div>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
                <TabsTrigger 
                  value="overview" 
                  className="text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gray-700"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Resumen
                </TabsTrigger>
                <TabsTrigger 
                  value="quickstart"
                  className="text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gray-700"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Inicio Rápido
                </TabsTrigger>
                <TabsTrigger 
                  value="api"
                  className="text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gray-700"
                >
                  <Terminal className="h-4 w-4 mr-2" />
                  API
                </TabsTrigger>
                <TabsTrigger 
                  value="security"
                  className="text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gray-700"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Seguridad
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Descripción General
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-300 space-y-4">
                    <p>
                      Sistema de analytics completo y compatible con GDPR para la plataforma inmobiliaria Marconi. 
                      Permite seguimiento de vistas de propiedades, interacciones de usuario, generación de leads 
                      y rendimiento de campañas mientras mantiene la privacidad del usuario.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="p-4 bg-gray-700 rounded-lg">
                        <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-400" />
                          Privacidad y GDPR
                        </h3>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• Hash SHA-256 de IPs</li>
                          <li>• Opt-out de usuarios</li>
                          <li>• Retención de datos (24 meses)</li>
                          <li>• Políticas RLS</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-gray-700 rounded-lg">
                        <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-blue-400" />
                          Funcionalidades
                        </h3>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• Seguimiento de propiedades</li>
                          <li>• Atribución de leads</li>
                          <li>• Analytics de dispositivos</li>
                          <li>• Dashboard en tiempo real</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Hash className="h-5 w-5" />
                      Características Técnicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-700 rounded-lg">
                        <Database className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                        <h4 className="text-white font-semibold">11 Tablas</h4>
                        <p className="text-gray-400 text-sm">Base de datos optimizada</p>
                      </div>
                      <div className="text-center p-4 bg-gray-700 rounded-lg">
                        <Code className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        <h4 className="text-white font-semibold">12 Fuentes</h4>
                        <p className="text-gray-400 text-sm">Tipos de leads</p>
                      </div>
                      <div className="text-center p-4 bg-gray-700 rounded-lg">
                        <Terminal className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                        <h4 className="text-white font-semibold">10 APIs</h4>
                        <p className="text-gray-400 text-sm">Endpoints RESTful</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quickstart" className="mt-6 space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <ArrowRight className="h-5 w-5" />
                      Guía de Inicio Rápido
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        1. Configuración de Base de Datos
                      </h3>
                      <div className="bg-gray-900 p-4 rounded-lg">
                        <code className="text-green-400 text-sm">
                          psql -f scripts/analytics-schema-migration.sql
                        </code>
                      </div>
                      <p className="text-gray-400 text-sm">
                        Ejecuta el script de migración para crear todas las tablas de analytics.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        2. Integración Frontend
                      </h3>
                      <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                        <pre className="text-sm text-gray-300">
{`import { trackPropertyView } from '@/lib/analytics-client'

useEffect(() => {
  trackPropertyView(property.id, {
    pageUrl: window.location.href,
    referrerUrl: document.referrer
  })
}, [property.id])`}
                        </pre>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        3. Seguimiento de Leads
                      </h3>
                      <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                        <pre className="text-sm text-gray-300">
{`import { trackLead } from '@/lib/analytics-client'

const leadId = await LeadsService.createLead(leadData)
await trackLead(leadId, 'formulario_web', property.id)`}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api" className="mt-6 space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Terminal className="h-5 w-5" />
                      Endpoints de la API
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredEndpoints.map((endpoint, index) => (
                        <div key={index} className="p-4 bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={`text-xs font-mono ${getMethodColor(endpoint.method)}`}>
                              {endpoint.method}
                            </Badge>
                            <code className="text-blue-400 font-mono text-sm">
                              {endpoint.path}
                            </code>
                          </div>
                          <p className="text-gray-400 text-sm">{endpoint.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-6 space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Privacidad y Seguridad
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-white font-semibold">Protección de Datos</h3>
                        <ul className="space-y-2 text-gray-400">
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            Sin datos personales almacenados
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            Hash SHA-256 de direcciones IP
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            Sesiones identificadas por UUID
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            Limpieza automática (24 meses)
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-white font-semibold">Cumplimiento GDPR</h3>
                        <ul className="space-y-2 text-gray-400">
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            Capacidad de opt-out
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            Portabilidad de datos
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            Derecho al olvido
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            Base legal legítima
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-700 rounded-lg">
                      <h4 className="text-white font-semibold mb-2">Opt-out de Usuario</h4>
                      <div className="bg-gray-900 p-3 rounded">
                        <code className="text-green-400 text-sm">
                          POST /api/analytics/gdpr/opt-out
                        </code>
                      </div>
                      <p className="text-gray-400 text-sm mt-2">
                        Los usuarios pueden optar por no participar en el seguimiento en cualquier momento.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}