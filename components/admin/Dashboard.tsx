"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Home,
  Users,
  TrendingUp,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Target,
  Clock,
  BarChart3,
  Activity,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { useContacts } from "@/hooks/useContacts"
import { useContactMetrics } from "@/hooks/useContactMetrics"

export default function Dashboard() {
  const { contacts, loading } = useContacts()
  const metrics = useContactMetrics(contacts)

  const [properties, setProperties] = useState<any[]>([])
  const [propertiesLoading, setPropertiesLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("/api/properties")
        if (response.ok) {
          const data = await response.json()
          setProperties(Array.isArray(data) ? data : [])
        } else {
          setProperties([])
        }
      } catch (error) {
        console.error("Error fetching properties:", error)
        setProperties([])
      } finally {
        setPropertiesLoading(false)
      }
    }

    fetchProperties()
  }, [])

  if (loading || propertiesLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Propiedades Activas</p>
                <p className="text-2xl font-bold text-white">{properties.length}</p>
                <p className="text-xs text-green-400">{properties.filter((p: any) => p.featured).length} destacadas</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Contactos</p>
                <p className="text-2xl font-bold text-white">{metrics.totalContacts}</p>
                <p className="text-xs text-blue-400">+{metrics.contactsThisWeek} esta semana</p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tasa de Conversión</p>
                <p className="text-2xl font-bold text-white">{metrics.conversionRate.toFixed(1)}%</p>
                <p className="text-xs text-purple-400">{metrics.convertedContacts} convertidos</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Puntuación Promedio</p>
                <p className="text-2xl font-bold text-white">{metrics.averageScore.toFixed(1)}/10</p>
                <p className="text-xs text-orange-400">{metrics.overdueActions} acciones vencidas</p>
              </div>
              <div className="bg-orange-500 p-3 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Nuevos</p>
                <p className="text-xl font-bold text-blue-400">{metrics.newContacts}</p>
              </div>
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Contactados</p>
                <p className="text-xl font-bold text-yellow-400">{metrics.contactedContacts}</p>
              </div>
              <Phone className="w-5 h-5 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Calificados</p>
                <p className="text-xl font-bold text-purple-400">{metrics.qualifiedContacts}</p>
              </div>
              <Mail className="w-5 h-5 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Convertidos</p>
                <p className="text-xl font-bold text-green-400">{metrics.convertedContacts}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access to Analytics */}
      <Card className="bg-gradient-to-r from-blue-900 to-purple-900 border-blue-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Analytics y Métricas Detalladas</h3>
              <p className="text-blue-200 mb-4">
                Ver análisis completo de tráfico, conversiones y rendimiento de propiedades
              </p>
              <Button asChild className="bg-white text-blue-900 hover:bg-blue-50">
                <Link href="/admin/analytics">
                  Ver Analytics Completo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="hidden md:block">
              <Activity className="w-16 h-16 text-blue-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <BarChart3 className="w-5 h-5 mr-2" />
              Actividad Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.weeklyData.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{day.date}</span>
                  <div className="flex space-x-4">
                    <span className="text-sm text-gray-300">Contactos: {day.contacts}</span>
                    <span className="text-sm text-green-400">Convertidos: {day.converted}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sources Distribution */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Users className="w-5 h-5 mr-2" />
              Fuentes de Contacto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.sourceStats).map(([source, count]) => (
                <div key={source} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{source}</span>
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <AlertCircle className="w-5 h-5 mr-2" />
              Distribución por Prioridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.priorityStats).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        priority === "high" ? "bg-red-500" : priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                      }`}
                    />
                    <span className="capitalize text-gray-300">{priority}</span>
                  </div>
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Clock className="w-5 h-5 mr-2" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contacts.slice(0, 5).map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{contact.name}</p>
                    <p className="text-sm text-gray-400">{contact.property}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={
                        contact.status === "new"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : contact.status === "contacted"
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            : contact.status === "qualified"
                              ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                              : "bg-green-500/20 text-green-400 border-green-500/30"
                      }
                    >
                      {contact.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(contact.createdAt).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-16 flex-col space-y-2 bg-brand-orange hover:bg-brand-orange/90">
              <Users className="w-6 h-6" />
              <span>Ver Todos los Contactos</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col space-y-2 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <Home className="w-6 h-6" />
              <span>Gestionar Propiedades</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col space-y-2 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <Calendar className="w-6 h-6" />
              <span>Programar Seguimientos</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
