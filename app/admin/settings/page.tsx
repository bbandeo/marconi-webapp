'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  User,
  Building2,
  Globe,
  Palette,
  Search,
  Upload,
  Save,
  Loader2,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SiteSettings } from '@/types/settings'

// Esquema de validación
const settingsSchema = z.object({
  // Empresa
  company_name: z.string().min(1, 'Nombre requerido'),
  company_description: z.string().optional(),
  contact_email: z.string().email('Email inválido'),
  contact_phone: z.string().min(1, 'Teléfono requerido'),
  whatsapp_number: z.string().optional(),
  address: z.string().min(1, 'Dirección requerida'),
  website_url: z.string().url().optional().or(z.literal('')),

  // Redes Sociales
  social_facebook: z.string().url().optional().or(z.literal('')),
  social_instagram: z.string().url().optional().or(z.literal('')),
  social_linkedin: z.string().url().optional().or(z.literal('')),
  social_youtube: z.string().url().optional().or(z.literal('')),
  social_twitter: z.string().url().optional().or(z.literal('')),

  // SEO
  meta_title: z.string().min(1, 'Título requerido').max(60, 'Máximo 60 caracteres'),
  meta_description: z.string().min(1, 'Descripción requerida').max(160, 'Máximo 160 caracteres'),
  meta_keywords: z.string().optional(),
  google_analytics_id: z.string().optional(),
  google_tag_manager_id: z.string().optional(),

  // Métodos de Contacto
  whatsapp_enabled: z.boolean(),
  phone_enabled: z.boolean(),
  email_enabled: z.boolean(),
  contact_form_enabled: z.boolean(),

  // Colores
  brand_primary_color: z.string(),
  brand_secondary_color: z.string(),
})

type SettingsFormData = z.infer<typeof settingsSchema>

// Componente para upload de logos
interface LogoUploadProps {
  type: 'logo' | 'logo_dark' | 'favicon'
  title: string
  description: string
  currentUrl?: string
  onUploadSuccess: () => void
}

function LogoUpload({ type, title, description, currentUrl, onUploadSuccess }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/settings/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`${title} subido exitosamente`)
        onUploadSuccess()
      } else {
        throw new Error(result.error || 'Error al subir archivo')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Error al subir el archivo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-orange-400 transition-colors">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="text-center">
        <h5 className="font-medium text-gray-900 mb-1">{title}</h5>
        <p className="text-sm text-gray-600 mb-3">{description}</p>

        {currentUrl ? (
          <div className="space-y-3">
            <img
              src={currentUrl}
              alt={title}
              className="max-h-20 mx-auto object-contain"
            />
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFileSelect}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Cambiar
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleFileSelect}
            disabled={uploading}
            className="mx-auto"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Seleccionar archivo
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema)
  })

  // Watchers para contadores
  const metaTitle = watch('meta_title')
  const metaDescription = watch('meta_description')

  // Cargar configuraciones al montar
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()

      if (data.success && data.data) {
        const settings = data.data
        setSettings(settings)

        // Mapear datos al formulario
        setValue('company_name', settings.company_name || '')
        setValue('company_description', settings.company_description || '')
        setValue('contact_email', settings.contact_email || '')
        setValue('contact_phone', settings.contact_phone || '')
        setValue('whatsapp_number', settings.whatsapp_number || '')
        setValue('address', settings.address || '')
        setValue('website_url', settings.website_url || '')

        // Redes sociales
        setValue('social_facebook', settings.social_media?.facebook || '')
        setValue('social_instagram', settings.social_media?.instagram || '')
        setValue('social_linkedin', settings.social_media?.linkedin || '')
        setValue('social_youtube', settings.social_media?.youtube || '')
        setValue('social_twitter', settings.social_media?.twitter || '')

        // SEO
        setValue('meta_title', settings.meta_title || '')
        setValue('meta_description', settings.meta_description || '')
        setValue('meta_keywords', settings.meta_keywords || '')
        setValue('google_analytics_id', settings.google_analytics_id || '')
        setValue('google_tag_manager_id', settings.google_tag_manager_id || '')

        // Métodos de contacto
        setValue('whatsapp_enabled', settings.contact_methods?.whatsapp_enabled ?? true)
        setValue('phone_enabled', settings.contact_methods?.phone_enabled ?? true)
        setValue('email_enabled', settings.contact_methods?.email_enabled ?? true)
        setValue('contact_form_enabled', settings.contact_methods?.contact_form_enabled ?? true)

        // Colores
        setValue('brand_primary_color', settings.brand_colors?.primary || '#f97316')
        setValue('brand_secondary_color', settings.brand_colors?.secondary || '#1f2937')
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Error al cargar configuraciones')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: SettingsFormData) => {
    setSaving(true)
    try {
      const payload = {
        company_name: data.company_name,
        company_description: data.company_description || null,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        whatsapp_number: data.whatsapp_number || null,
        address: data.address,
        website_url: data.website_url || null,

        social_media: {
          facebook: data.social_facebook || null,
          instagram: data.social_instagram || null,
          linkedin: data.social_linkedin || null,
          youtube: data.social_youtube || null,
          twitter: data.social_twitter || null,
        },

        meta_title: data.meta_title,
        meta_description: data.meta_description,
        meta_keywords: data.meta_keywords || null,
        google_analytics_id: data.google_analytics_id || null,
        google_tag_manager_id: data.google_tag_manager_id || null,

        contact_methods: {
          whatsapp_enabled: data.whatsapp_enabled,
          phone_enabled: data.phone_enabled,
          email_enabled: data.email_enabled,
          contact_form_enabled: data.contact_form_enabled,
        },

        brand_colors: {
          primary: data.brand_primary_color,
          secondary: data.brand_secondary_color,
        }
      }

      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Configuraciones guardadas exitosamente')
        setSettings(result.data)
      } else {
        throw new Error(result.error || 'Error al guardar')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Error al guardar configuraciones')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
          <p className="text-sm text-gray-500">Cargando configuraciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Configuración General
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Administra la información y configuraciones de tu inmobiliaria. 
            Los cambios se reflejarán automáticamente en el sitio web.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="company" className="w-full">
          {/* Enhanced Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-gray-50 rounded-lg p-1 h-auto">
              <TabsTrigger 
                value="company" 
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all"
              >
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">Empresa</span>
              </TabsTrigger>
              <TabsTrigger 
                value="contact" 
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Contacto</span>
              </TabsTrigger>
              <TabsTrigger 
                value="social" 
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">Redes</span>
              </TabsTrigger>
              <TabsTrigger 
                value="seo" 
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">SEO</span>
              </TabsTrigger>
              <TabsTrigger 
                value="branding" 
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all"
              >
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Marca</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Sección Empresa */}
          <TabsContent value="company" className="space-y-8">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Building2 className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      Información de la Empresa
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Datos básicos de tu inmobiliaria que se mostrarán en el sitio web
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company_name" className="text-sm font-medium text-gray-700">
                      Nombre de la Empresa *
                    </Label>
                    <Input
                      id="company_name"
                      {...register('company_name')}
                      className={`transition-colors ${errors.company_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'}`}
                      aria-describedby={errors.company_name ? "company_name_error" : undefined}
                    />
                    {errors.company_name && (
                      <p id="company_name_error" className="text-sm text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4">⚠</span>
                        {errors.company_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website_url" className="text-sm font-medium text-gray-700">
                      Sitio Web
                    </Label>
                    <Input
                      id="website_url"
                      type="url"
                      {...register('website_url')}
                      placeholder="https://tu-sitio.com"
                      className={`transition-colors ${errors.website_url ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'}`}
                      aria-describedby={errors.website_url ? "website_url_error" : undefined}
                    />
                    {errors.website_url && (
                      <p id="website_url_error" className="text-sm text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4">⚠</span>
                        {errors.website_url.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_description" className="text-sm font-medium text-gray-700">
                    Descripción de la Empresa
                  </Label>
                  <Textarea
                    id="company_description"
                    {...register('company_description')}
                    rows={4}
                    placeholder="Describe tu inmobiliaria, sus servicios y valores..."
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 transition-colors resize-none"
                  />
                  <p className="text-xs text-gray-500">Esta descripción aparecerá en el footer del sitio web.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                    Dirección *
                  </Label>
                  <Input
                    id="address"
                    {...register('address')}
                    placeholder="Calle, Número, Ciudad, Provincia"
                    className={`transition-colors ${errors.address ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'}`}
                    aria-describedby={errors.address ? "address_error" : undefined}
                  />
                  {errors.address && (
                    <p id="address_error" className="text-sm text-red-600 flex items-center gap-1">
                      <span className="w-4 h-4">⚠</span>
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sección Contacto */}
          <TabsContent value="contact" className="space-y-8">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <User className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      Información de Contacto
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Configura los métodos de contacto disponibles para los clientes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email" className="text-sm font-medium text-gray-700">
                      Email de Contacto *
                    </Label>
                    <Input
                      id="contact_email"
                      type="email"
                      {...register('contact_email')}
                      className={`transition-colors ${errors.contact_email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'}`}
                      aria-describedby={errors.contact_email ? "contact_email_error" : undefined}
                    />
                    {errors.contact_email && (
                      <p id="contact_email_error" className="text-sm text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4">⚠</span>
                        {errors.contact_email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone" className="text-sm font-medium text-gray-700">
                      Teléfono *
                    </Label>
                    <Input
                      id="contact_phone"
                      {...register('contact_phone')}
                      placeholder="+54 9 3482 308100"
                      className={`transition-colors ${errors.contact_phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'}`}
                      aria-describedby={errors.contact_phone ? "contact_phone_error" : undefined}
                    />
                    {errors.contact_phone && (
                      <p id="contact_phone_error" className="text-sm text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4">⚠</span>
                        {errors.contact_phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp_number" className="text-sm font-medium text-gray-700">
                    WhatsApp
                  </Label>
                  <Input
                    id="whatsapp_number"
                    {...register('whatsapp_number')}
                    placeholder="+54 9 3482 308100"
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500">Número para contacto directo por WhatsApp (opcional).</p>
                </div>

                <div className="space-y-4">
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Métodos de Contacto Habilitados</h4>
                    <p className="text-sm text-gray-600 mb-6">Selecciona qué métodos de contacto estarán disponibles para los visitantes del sitio web.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-sm">📱</span>
                          </div>
                          <Label htmlFor="whatsapp_enabled" className="text-sm font-medium text-gray-700 cursor-pointer">
                            WhatsApp
                          </Label>
                        </div>
                        <Switch
                          id="whatsapp_enabled"
                          {...register('whatsapp_enabled')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm">📞</span>
                          </div>
                          <Label htmlFor="phone_enabled" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Teléfono
                          </Label>
                        </div>
                        <Switch
                          id="phone_enabled"
                          {...register('phone_enabled')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 text-sm">✉️</span>
                          </div>
                          <Label htmlFor="email_enabled" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Email
                          </Label>
                        </div>
                        <Switch
                          id="email_enabled"
                          {...register('email_enabled')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 text-sm">📝</span>
                          </div>
                          <Label htmlFor="contact_form_enabled" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Formulario Web
                          </Label>
                        </div>
                        <Switch
                          id="contact_form_enabled"
                          {...register('contact_form_enabled')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sección Redes Sociales */}
          <TabsContent value="social" className="space-y-8">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Globe className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      Redes Sociales
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Configura los enlaces a tus redes sociales para mostrar en el sitio web
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="social_facebook" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Facebook className="w-4 h-4 text-blue-600" />
                      Facebook
                    </Label>
                    <Input
                      id="social_facebook"
                      type="url"
                      {...register('social_facebook')}
                      placeholder="https://facebook.com/tu-pagina"
                      className={`transition-colors ${errors.social_facebook ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'}`}
                      aria-describedby={errors.social_facebook ? "social_facebook_error" : undefined}
                    />
                    {errors.social_facebook && (
                      <p id="social_facebook_error" className="text-sm text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4">⚠</span>
                        {errors.social_facebook.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="social_instagram" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-600" />
                      Instagram
                    </Label>
                    <Input
                      id="social_instagram"
                      type="url"
                      {...register('social_instagram')}
                      placeholder="https://instagram.com/tu-perfil"
                      className={`transition-colors ${errors.social_instagram ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'}`}
                      aria-describedby={errors.social_instagram ? "social_instagram_error" : undefined}
                    />
                    {errors.social_instagram && (
                      <p id="social_instagram_error" className="text-sm text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4">⚠</span>
                        {errors.social_instagram.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="social_linkedin" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-blue-700" />
                      LinkedIn
                    </Label>
                    <Input
                      id="social_linkedin"
                      type="url"
                      {...register('social_linkedin')}
                      placeholder="https://linkedin.com/company/tu-empresa"
                      className={`transition-colors ${errors.social_linkedin ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'}`}
                      aria-describedby={errors.social_linkedin ? "social_linkedin_error" : undefined}
                    />
                    {errors.social_linkedin && (
                      <p id="social_linkedin_error" className="text-sm text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4">⚠</span>
                        {errors.social_linkedin.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="social_youtube" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-600" />
                      YouTube
                    </Label>
                    <Input
                      id="social_youtube"
                      type="url"
                      {...register('social_youtube')}
                      placeholder="https://youtube.com/@tu-canal"
                      className={`transition-colors ${errors.social_youtube ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'}`}
                      aria-describedby={errors.social_youtube ? "social_youtube_error" : undefined}
                    />
                    {errors.social_youtube && (
                      <p id="social_youtube_error" className="text-sm text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4">⚠</span>
                        {errors.social_youtube.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="social_twitter" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Twitter className="w-4 h-4 text-blue-500" />
                      Twitter/X
                    </Label>
                    <Input
                      id="social_twitter"
                      type="url"
                      {...register('social_twitter')}
                      placeholder="https://twitter.com/tu-perfil"
                      className={`transition-colors ${errors.social_twitter ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'}`}
                      aria-describedby={errors.social_twitter ? "social_twitter_error" : undefined}
                    />
                    {errors.social_twitter && (
                      <p id="social_twitter_error" className="text-sm text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4">⚠</span>
                        {errors.social_twitter.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 text-blue-600 mt-0.5">💡</div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-blue-900">Consejos para redes sociales</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Usa URLs completas (incluyendo https://)</li>
                        <li>• Los campos vacíos no se mostrarán en el sitio web</li>
                        <li>• Verifica que los enlaces funcionen correctamente</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sección SEO */}
          <TabsContent value="seo" className="space-y-8">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Search className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      Configuración SEO
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Optimiza tu sitio web para motores de búsqueda como Google
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="meta_title" className="text-sm font-medium text-gray-700">
                      Título SEO (Meta Title) *
                    </Label>
                    <Input
                      id="meta_title"
                      {...register('meta_title')}
                      placeholder="Inmobiliaria Marconi - Propiedades en venta y alquiler"
                      className={`transition-colors ${errors.meta_title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'}`}
                      maxLength={60}
                      aria-describedby={errors.meta_title ? "meta_title_error" : "meta_title_help"}
                    />
                    <div className="flex justify-between items-center">
                      {errors.meta_title && (
                        <p id="meta_title_error" className="text-sm text-red-600 flex items-center gap-1">
                          <span className="w-4 h-4">⚠</span>
                          {errors.meta_title.message}
                        </p>
                      )}
                      <p id="meta_title_help" className={`text-xs ml-auto ${(metaTitle?.length || 0) > 60 ? 'text-red-500' : (metaTitle?.length || 0) > 50 ? 'text-amber-500' : 'text-gray-500'}`}>
                        {metaTitle?.length || 0}/60 caracteres
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_description" className="text-sm font-medium text-gray-700">
                      Descripción SEO (Meta Description) *
                    </Label>
                    <Textarea
                      id="meta_description"
                      {...register('meta_description')}
                      placeholder="Encuentra tu propiedad ideal en Marconi Inmobiliaria. Casas, departamentos y terrenos en las mejores zonas. Asesoramiento profesional garantizado."
                      className={`transition-colors resize-none ${errors.meta_description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'}`}
                      rows={3}
                      maxLength={160}
                      aria-describedby={errors.meta_description ? "meta_description_error" : "meta_description_help"}
                    />
                    <div className="flex justify-between items-center">
                      {errors.meta_description && (
                        <p id="meta_description_error" className="text-sm text-red-600 flex items-center gap-1">
                          <span className="w-4 h-4">⚠</span>
                          {errors.meta_description.message}
                        </p>
                      )}
                      <p id="meta_description_help" className={`text-xs ml-auto ${(metaDescription?.length || 0) > 160 ? 'text-red-500' : (metaDescription?.length || 0) > 140 ? 'text-amber-500' : 'text-gray-500'}`}>
                        {metaDescription?.length || 0}/160 caracteres
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_keywords" className="text-sm font-medium text-gray-700">
                      Palabras Clave (opcional)
                    </Label>
                    <Input
                      id="meta_keywords"
                      {...register('meta_keywords')}
                      placeholder="inmobiliaria, propiedades, casas, departamentos, alquiler, venta"
                      className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500">Separa las palabras clave con comas.</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 space-y-6">
                  <h4 className="text-lg font-medium text-gray-900">Herramientas de Análisis</h4>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="google_analytics_id" className="text-sm font-medium text-gray-700">
                        Google Analytics ID
                      </Label>
                      <Input
                        id="google_analytics_id"
                        {...register('google_analytics_id')}
                        placeholder="G-XXXXXXXXXX"
                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 transition-colors"
                      />
                      <p className="text-xs text-gray-500">Formato: G-XXXXXXXXXX (Google Analytics 4)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="google_tag_manager_id" className="text-sm font-medium text-gray-700">
                        Google Tag Manager ID
                      </Label>
                      <Input
                        id="google_tag_manager_id"
                        {...register('google_tag_manager_id')}
                        placeholder="GTM-XXXXXXX"
                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 transition-colors"
                      />
                      <p className="text-xs text-gray-500">Formato: GTM-XXXXXXX</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-green-900 flex items-center gap-2">
                      🚀 Vista previa en Google
                    </h4>
                    <div className="bg-white border border-green-200 rounded-md p-4 space-y-1">
                      <h3 className="text-blue-600 text-lg font-medium hover:underline cursor-pointer line-clamp-2">
                        {metaTitle || 'Inmobiliaria Marconi - Propiedades en venta y alquiler'}
                      </h3>
                      <p className="text-green-700 text-sm">marconi-inmobiliaria.com</p>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {metaDescription || 'Encuentra tu propiedad ideal en Marconi Inmobiliaria. Casas, departamentos y terrenos en las mejores zonas. Asesoramiento profesional garantizado.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 text-blue-600 mt-0.5">💡</div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-blue-900">Consejos para SEO</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• El título debe ser único y descriptivo (50-60 caracteres)</li>
                        <li>• La descripción debe resumir tu negocio (140-160 caracteres)</li>
                        <li>• Incluye palabras clave relevantes naturalmente</li>
                        <li>• Los IDs de Analytics son opcionales pero recomendados</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sección Branding */}
          <TabsContent value="branding" className="space-y-8">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Palette className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      Identidad de Marca
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Configura los logos, colores y elementos visuales de tu inmobiliaria
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* Upload de Logos */}
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-gray-900">Logos</h4>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <LogoUpload
                      type="logo"
                      title="Logo Principal"
                      description="Logo para fondo claro (formato PNG recomendado)"
                      currentUrl={settings?.logo_url}
                      onUploadSuccess={loadSettings}
                    />

                    <LogoUpload
                      type="logo_dark"
                      title="Logo para Fondo Oscuro"
                      description="Logo para fondo oscuro (opcional)"
                      currentUrl={settings?.logo_dark_url}
                      onUploadSuccess={loadSettings}
                    />

                    <LogoUpload
                      type="favicon"
                      title="Favicon"
                      description="Ícono que aparece en la pestaña del navegador (32x32px)"
                      currentUrl={settings?.favicon_url}
                      onUploadSuccess={loadSettings}
                    />
                  </div>
                </div>

                {/* Colores de Marca */}
                <div className="border-t border-gray-200 pt-6 space-y-6">
                  <h4 className="text-lg font-medium text-gray-900">Colores de Marca</h4>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="brand_primary_color" className="text-sm font-medium text-gray-700">
                        Color Primario
                      </Label>
                      <div className="flex gap-3">
                        <Input
                          id="brand_primary_color"
                          type="color"
                          {...register('brand_primary_color')}
                          className="w-16 h-12 p-1 border-2 border-gray-300 rounded-lg cursor-pointer"
                        />
                        <Input
                          type="text"
                          {...register('brand_primary_color')}
                          placeholder="#f97316"
                          className="flex-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500 transition-colors"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Color principal usado en botones y elementos destacados.</p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="brand_secondary_color" className="text-sm font-medium text-gray-700">
                        Color Secundario
                      </Label>
                      <div className="flex gap-3">
                        <Input
                          id="brand_secondary_color"
                          type="color"
                          {...register('brand_secondary_color')}
                          className="w-16 h-12 p-1 border-2 border-gray-300 rounded-lg cursor-pointer"
                        />
                        <Input
                          type="text"
                          {...register('brand_secondary_color')}
                          placeholder="#1f2937"
                          className="flex-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500 transition-colors"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Color secundario para textos y elementos de apoyo.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 text-purple-600 mt-0.5">🎨</div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-purple-900">Consejos de branding</h4>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>• Logo: preferiblemente PNG transparente, máximo 5MB</li>
                        <li>• Favicon: 32x32 píxeles, formato ICO o PNG</li>
                        <li>• Los colores se aplicarán en elementos del sitio web</li>
                        <li>• Mantén consistencia visual en todos los elementos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sticky Save Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2.5 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Configuraciones
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
