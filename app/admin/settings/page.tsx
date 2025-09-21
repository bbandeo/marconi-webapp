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

          {/* Sección Redes Sociales */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-orange-500" />
                  Redes Sociales
                </CardTitle>
                <CardDescription>
                  Configura los enlaces a tus redes sociales para mostrar en el sitio web
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="social_facebook" className="flex items-center gap-2">
                      <Facebook className="w-4 h-4 text-blue-600" />
                      Facebook
                    </Label>
                    <Input
                      id="social_facebook"
                      type="url"
                      {...register('social_facebook')}
                      placeholder="https://facebook.com/tu-pagina"
                      className={errors.social_facebook ? 'border-red-500' : ''}
                    />
                    {errors.social_facebook && (
                      <p className="text-sm text-red-500 mt-1">{errors.social_facebook.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="social_instagram" className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-600" />
                      Instagram
                    </Label>
                    <Input
                      id="social_instagram"
                      type="url"
                      {...register('social_instagram')}
                      placeholder="https://instagram.com/tu-perfil"
                      className={errors.social_instagram ? 'border-red-500' : ''}
                    />
                    {errors.social_instagram && (
                      <p className="text-sm text-red-500 mt-1">{errors.social_instagram.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="social_linkedin" className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-blue-700" />
                      LinkedIn
                    </Label>
                    <Input
                      id="social_linkedin"
                      type="url"
                      {...register('social_linkedin')}
                      placeholder="https://linkedin.com/company/tu-empresa"
                      className={errors.social_linkedin ? 'border-red-500' : ''}
                    />
                    {errors.social_linkedin && (
                      <p className="text-sm text-red-500 mt-1">{errors.social_linkedin.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="social_youtube" className="flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-600" />
                      YouTube
                    </Label>
                    <Input
                      id="social_youtube"
                      type="url"
                      {...register('social_youtube')}
                      placeholder="https://youtube.com/@tu-canal"
                      className={errors.social_youtube ? 'border-red-500' : ''}
                    />
                    {errors.social_youtube && (
                      <p className="text-sm text-red-500 mt-1">{errors.social_youtube.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="social_twitter" className="flex items-center gap-2">
                      <Twitter className="w-4 h-4 text-blue-500" />
                      Twitter/X
                    </Label>
                    <Input
                      id="social_twitter"
                      type="url"
                      {...register('social_twitter')}
                      placeholder="https://twitter.com/tu-perfil"
                      className={errors.social_twitter ? 'border-red-500' : ''}
                    />
                    {errors.social_twitter && (
                      <p className="text-sm text-red-500 mt-1">{errors.social_twitter.message}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Consejos para redes sociales:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Usa URLs completas (incluyendo https://)</li>
                    <li>• Los campos vacíos no se mostrarán en el sitio web</li>
                    <li>• Verifica que los enlaces funcionen correctamente</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sección SEO */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-orange-500" />
                  Configuración SEO
                </CardTitle>
                <CardDescription>
                  Optimiza tu sitio web para motores de búsqueda como Google
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="meta_title">Título SEO (Meta Title) *</Label>
                    <Input
                      id="meta_title"
                      {...register('meta_title')}
                      placeholder="Inmobiliaria Marconi - Propiedades en venta y alquiler"
                      className={errors.meta_title ? 'border-red-500' : ''}
                      maxLength={60}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.meta_title && (
                        <p className="text-sm text-red-500">{errors.meta_title.message}</p>
                      )}
                      <p className={`text-sm ml-auto ${(metaTitle?.length || 0) > 60 ? 'text-red-500' : (metaTitle?.length || 0) > 50 ? 'text-yellow-500' : 'text-gray-500'}`}>
                        {metaTitle?.length || 0}/60 caracteres
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="meta_description">Descripción SEO (Meta Description) *</Label>
                    <Textarea
                      id="meta_description"
                      {...register('meta_description')}
                      placeholder="Encuentra tu propiedad ideal en Marconi Inmobiliaria. Casas, departamentos y terrenos en las mejores zonas. Asesoramiento profesional garantizado."
                      className={errors.meta_description ? 'border-red-500' : ''}
                      rows={3}
                      maxLength={160}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.meta_description && (
                        <p className="text-sm text-red-500">{errors.meta_description.message}</p>
                      )}
                      <p className={`text-sm ml-auto ${(metaDescription?.length || 0) > 160 ? 'text-red-500' : (metaDescription?.length || 0) > 140 ? 'text-yellow-500' : 'text-gray-500'}`}>
                        {metaDescription?.length || 0}/160 caracteres
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="meta_keywords">Palabras Clave (opcional)</Label>
                    <Input
                      id="meta_keywords"
                      {...register('meta_keywords')}
                      placeholder="inmobiliaria, propiedades, casas, departamentos, alquiler, venta"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Separa las palabras clave con comas
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Herramientas de Análisis</h4>

                  <div>
                    <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                    <Input
                      id="google_analytics_id"
                      {...register('google_analytics_id')}
                      placeholder="G-XXXXXXXXXX"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Formato: G-XXXXXXXXXX (Google Analytics 4)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="google_tag_manager_id">Google Tag Manager ID</Label>
                    <Input
                      id="google_tag_manager_id"
                      {...register('google_tag_manager_id')}
                      placeholder="GTM-XXXXXXX"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Formato: GTM-XXXXXXX
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">🚀 Vista previa en Google:</h4>
                  <div className="bg-white p-3 rounded border">
                    <h3 className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                      {metaTitle || 'Inmobiliaria Marconi - Propiedades en venta y alquiler'}
                    </h3>
                    <p className="text-green-700 text-sm">marconi-inmobiliaria.com</p>
                    <p className="text-gray-600 text-sm mt-1">
                      {metaDescription || 'Encuentra tu propiedad ideal en Marconi Inmobiliaria. Casas, departamentos y terrenos en las mejores zonas. Asesoramiento profesional garantizado.'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Consejos para SEO:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• El título debe ser único y descriptivo (50-60 caracteres)</li>
                    <li>• La descripción debe resumir tu negocio (140-160 caracteres)</li>
                    <li>• Incluye palabras clave relevantes naturalmente</li>
                    <li>• Los IDs de Analytics son opcionales pero recomendados</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sección Branding */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-orange-500" />
                  Identidad de Marca
                </CardTitle>
                <CardDescription>
                  Configura los logos, colores y elementos visuales de tu inmobiliaria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload de Logos */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Logos</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Logo Principal */}
                    <LogoUpload
                      type="logo"
                      title="Logo Principal"
                      description="Logo para fondo claro (formato PNG recomendado)"
                      currentUrl={settings?.logo_url}
                      onUploadSuccess={loadSettings}
                    />

                    {/* Logo Oscuro */}
                    <LogoUpload
                      type="logo_dark"
                      title="Logo para Fondo Oscuro"
                      description="Logo para fondo oscuro (opcional)"
                      currentUrl={settings?.logo_dark_url}
                      onUploadSuccess={loadSettings}
                    />

                    {/* Favicon */}
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
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Colores de Marca</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="brand_primary_color">Color Primario</Label>
                      <div className="flex gap-2">
                        <Input
                          id="brand_primary_color"
                          type="color"
                          {...register('brand_primary_color')}
                          className="w-16 h-10 p-1 border rounded cursor-pointer"
                        />
                        <Input
                          type="text"
                          {...register('brand_primary_color')}
                          placeholder="#f97316"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="brand_secondary_color">Color Secundario</Label>
                      <div className="flex gap-2">
                        <Input
                          id="brand_secondary_color"
                          type="color"
                          {...register('brand_secondary_color')}
                          className="w-16 h-10 p-1 border rounded cursor-pointer"
                        />
                        <Input
                          type="text"
                          {...register('brand_secondary_color')}
                          placeholder="#1f2937"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">🎨 Consejos de branding:</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Logo: preferiblemente PNG transparente, máximo 5MB</li>
                    <li>• Favicon: 32x32 píxeles, formato ICO o PNG</li>
                    <li>• Los colores se aplicarán en elementos del sitio web</li>
                    <li>• Mantén consistencia visual en todos los elementos</li>
                  </ul>
                </div>
              </CardContent>
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