// =============================================
// DYNAMIC METADATA GENERATOR
// Utilidad para generar metadata dinámica basada en configuraciones
// =============================================

import type { Metadata } from "next"
import { SettingsService } from '@/services/settings'

/**
 * Genera metadata dinámica para el sitio basada en las configuraciones
 * @returns Promise<Metadata>
 */
export async function generateDynamicMetadata(): Promise<Metadata> {
  try {
    const settings = await SettingsService.getSettingsWithDefaults()

    return {
      title: settings.meta_title || "Inmobiliaria | Tu próximo hogar perfecto",
      description: settings.meta_description || "La inmobiliaria que te ayuda a encontrar tu hogar ideal.",
      keywords: settings.meta_keywords || undefined,
      openGraph: {
        title: settings.meta_title || "Inmobiliaria",
        description: settings.meta_description || "Encuentra tu hogar ideal",
        siteName: settings.company_name || "Inmobiliaria",
        locale: 'es_ES',
        type: 'website',
        images: settings.logo_url ? [
          {
            url: settings.logo_url,
            width: 1200,
            height: 630,
            alt: settings.company_name || "Logo",
          }
        ] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: settings.meta_title || "Inmobiliaria",
        description: settings.meta_description || "Encuentra tu hogar ideal",
        images: settings.logo_url ? [settings.logo_url] : undefined,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
      generator: 'v0.dev'
    }
  } catch (error) {
    console.error('Error generating dynamic metadata:', error)

    // Fallback metadata en caso de error
    return {
      title: "Inmobiliaria | Tu próximo hogar perfecto",
      description: "La inmobiliaria que te ayuda a encontrar tu hogar ideal.",
      generator: 'v0.dev'
    }
  }
}

/**
 * Genera metadata específica para páginas con título personalizado
 * @param pageTitle - Título específico de la página
 * @param pageDescription - Descripción específica de la página
 * @returns Promise<Metadata>
 */
export async function generatePageMetadata(
  pageTitle: string,
  pageDescription?: string
): Promise<Metadata> {
  try {
    const settings = await SettingsService.getSettingsWithDefaults()
    const fullTitle = `${pageTitle} | ${settings.company_name || 'Inmobiliaria'}`

    return {
      title: fullTitle,
      description: pageDescription || settings.meta_description || "Encuentra tu hogar ideal",
      openGraph: {
        title: fullTitle,
        description: pageDescription || settings.meta_description || "Encuentra tu hogar ideal",
        siteName: settings.company_name || "Inmobiliaria",
      },
      twitter: {
        title: fullTitle,
        description: pageDescription || settings.meta_description || "Encuentra tu hogar ideal",
      }
    }
  } catch (error) {
    console.error('Error generating page metadata:', error)
    return {
      title: pageTitle,
      description: pageDescription || "Encuentra tu hogar ideal",
    }
  }
}