import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import AnalyticsInitializer from "@/components/AnalyticsInitializer"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
})

export const metadata: Metadata = {
  title: "Marconi Inmobiliaria | Tu próximo hogar perfecto",
  description: "La inmobiliaria que está revolucionando Reconquista con tecnología y confianza local.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
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
