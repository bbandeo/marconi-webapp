'use client'

import { useState, useEffect } from 'react'
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración General</h1>
        <p className="text-gray-600">Administra la información y configuraciones de tu inmobiliaria</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Empresa
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Contacto
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Redes
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Marca
            </TabsTrigger>
          </TabsList>

          {/* Sección Empresa */}
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-500" />
                  Información de la Empresa
                </CardTitle>
                <CardDescription>
                  Datos básicos de tu inmobiliaria que se mostrarán en el sitio web
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Nombre de la Empresa *</Label>
                    <Input
                      id="company_name"
                      {...register('company_name')}
                      className={errors.company_name ? 'border-red-500' : ''}
                    />
                    {errors.company_name && (
                      <p className="text-sm text-red-500 mt-1">{errors.company_name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="website_url">Sitio Web</Label>
                    <Input
                      id="website_url"
                      type="url"
                      {...register('website_url')}
                      placeholder="https://tu-sitio.com"
                      className={errors.website_url ? 'border-red-500' : ''}
                    />
                    {errors.website_url && (
                      <p className="text-sm text-red-500 mt-1">{errors.website_url.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="company_description">Descripción de la Empresa</Label>
                  <Textarea
                    id="company_description"
                    {...register('company_description')}
                    rows={3}
                    placeholder="Describe tu inmobiliaria..."
                  />
                </div>

                <div>
                  <Label htmlFor="address">Dirección *</Label>
                  <Input
                    id="address"
                    {...register('address')}
                    placeholder="Calle, Número, Ciudad, Provincia"
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sección Contacto */}
          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-500" />
                  Información de Contacto
                </CardTitle>
                <CardDescription>
                  Configura los métodos de contacto disponibles para los clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_email">Email de Contacto *</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      {...register('contact_email')}
                      className={errors.contact_email ? 'border-red-500' : ''}
                    />
                    {errors.contact_email && (
                      <p className="text-sm text-red-500 mt-1">{errors.contact_email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contact_phone">Teléfono *</Label>
                    <Input
                      id="contact_phone"
                      {...register('contact_phone')}
                      placeholder="+54 9 3482 308100"
                      className={errors.contact_phone ? 'border-red-500' : ''}
                    />
                    {errors.contact_phone && (
                      <p className="text-sm text-red-500 mt-1">{errors.contact_phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="whatsapp_number">WhatsApp</Label>
                  <Input
                    id="whatsapp_number"
                    {...register('whatsapp_number')}
                    placeholder="+54 9 3482 308100"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Métodos de Contacto Habilitados</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="whatsapp_enabled">WhatsApp</Label>
                      <Switch
                        id="whatsapp_enabled"
                        {...register('whatsapp_enabled')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="phone_enabled">Teléfono</Label>
                      <Switch
                        id="phone_enabled"
                        {...register('phone_enabled')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email_enabled">Email</Label>
                      <Switch
                        id="email_enabled"
                        {...register('email_enabled')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="contact_form_enabled">Formulario Web</Label>
                      <Switch
                        id="contact_form_enabled"
                        {...register('contact_form_enabled')}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Placeholder para otras secciones */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Redes Sociales</CardTitle>
                <CardDescription>Configuración en desarrollo...</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
                <CardDescription>Configuración en desarrollo...</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Marca</CardTitle>
                <CardDescription>Configuración en desarrollo...</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600"
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
      </form>
    </div>
  )
}