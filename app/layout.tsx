import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import AnalyticsInitializer from "@/components/AnalyticsInitializer"
import { generateDynamicMetadata } from "@/lib/metadata"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
})

export async function generateMetadata(): Promise<Metadata> {
  return await generateDynamicMetadata()
}

// Componente para el favicon dinámico
async function DynamicFavicon() {
  try {
    const { SettingsService } = await import('@/services/settings')
    const settings = await SettingsService.getSettingsWithDefaults()

    if (settings.favicon_url) {
      return (
        <link rel="icon" type="image/x-icon" href={settings.favicon_url} />
      )
    }
  } catch (error) {
    console.error('Error loading dynamic favicon:', error)
  }

  return (
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <DynamicFavicon />
      </head>
      <body className={`${inter.variable} ${playfairDisplay.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AnalyticsInitializer />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
