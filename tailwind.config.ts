import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
        serif: ["var(--font-playfair-display)"],
        // SISTEMA TIPOGRÁFICO PREMIUM
        inter: ["Inter", "sans-serif"], // Principal para todo el sitio
        museo: ["Museo Sans", "sans-serif"], // Deprecar gradualmente
        playfair: ["Playfair Display", "serif"], // Para elementos especiales
        // ANALYTICS & DATA TYPOGRAPHY
        mono: ["JetBrains Mono", "Monaco", "Consolas", "monospace"], // Para números y datos
        data: ["Inter", "sans-serif"], // Optimizada para legibilidad de datos
      },
      // JERARQUÍA TIPOGRÁFICA PREMIUM
      fontSize: {
        // Títulos de impacto (H1) - Bold, uppercase
        'display-xl': ['4rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-lg': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }], 
        'display-md': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],
        'display-sm': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        
        // Subtítulos respirable (H2, H3) - Regular
        'heading-xl': ['2rem', { lineHeight: '1.3', fontWeight: '400' }],
        'heading-lg': ['1.75rem', { lineHeight: '1.3', fontWeight: '400' }],
        'heading-md': ['1.5rem', { lineHeight: '1.4', fontWeight: '400' }],
        'heading-sm': ['1.25rem', { lineHeight: '1.4', fontWeight: '400' }],
        
        // Cuerpo de texto - Light con línea generosa
        'body-xl': ['1.25rem', { lineHeight: '1.7', fontWeight: '300' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7', fontWeight: '300' }],
        'body-md': ['1rem', { lineHeight: '1.7', fontWeight: '300' }],
        'body-sm': ['0.875rem', { lineHeight: '1.7', fontWeight: '300' }],
        
        // Texto secundario y metadatos
        'caption-lg': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption-md': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption-sm': ['0.625rem', { lineHeight: '1.5', fontWeight: '400' }],

        // TYPOGRAPHY FOR ANALYTICS & DATA
        // Números y KPIs principales
        'data-xxl': ['3rem', { lineHeight: '1.0', fontWeight: '800' }],      // 48px - KPIs hero
        'data-xl': ['2.5rem', { lineHeight: '1.1', fontWeight: '700' }],     // 40px - KPIs principales
        'data-lg': ['1.75rem', { lineHeight: '1.2', fontWeight: '600' }],    // 28px - Valores secundarios
        'data-md': ['1.25rem', { lineHeight: '1.3', fontWeight: '500' }],    // 20px - Labels de charts
        'data-sm': ['0.875rem', { lineHeight: '1.4', fontWeight: '400' }],   // 14px - Leyendas y tooltips
        'data-xs': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],    // 12px - Metadatos y timestamps
        'data-xxs': ['0.625rem', { lineHeight: '1.4', fontWeight: '400' }],  // 10px - Labels pequeños
      },
      colors: {
        // SISTEMA DE COLORES PREMIUM - ECONOMÍA DEL COLOR
        // Azul Nocturno - 80% del uso visual
        "night-blue": "#212832",
        // Naranja Vibrante - SOLO para elementos interactivos (botones, CTAs, enlaces)
        "vibrant-orange": "#F37321",
        // Blanco Hueso - Para títulos y texto principal
        "bone-white": "#F5F5F5",
        // Gris de Soporte - Para texto secundario y metadatos
        "support-gray": "#8A9199",
        // Gris Sutil - Para textos descriptivos secundarios
        "subtle-gray": "#B3B3B3",

        // Legacy (mantener por compatibilidad durante transición)
        "brand-orange": "#F37321", // Actualizado al naranja vibrante

        // Paleta premium antigua (deprecar gradualmente)
        "premium": {
          gold: "#c9a961",
          warm: "#8b7355",
          muted: "#e8e2d5",
          dark: "#1a1a1a",
          light: "#fafafa",
        },

        // ANALYTICS & DATA VISUALIZATION COLORS
        "chart": {
          primary: "#F37321",     // vibrant-orange - Series principal
          secondary: "#4F46E5",   // Azul para comparaciones
          tertiary: "#10B981",    // Verde para métricas positivas
          quaternary: "#8B5CF6",  // Púrpura para categorías adicionales
          warning: "#F59E0B",     // Amarillo para alertas
          danger: "#EF4444",      // Rojo para métricas negativas
          neutral: "#6B7280",     // Gris para datos neutros
          info: "#3B82F6",        // Azul información
        },

        // STATUS INDICATORS
        "status": {
          success: "#10B981",     // Verde - operaciones exitosas
          warning: "#F59E0B",     // Amarillo - advertencias
          error: "#EF4444",       // Rojo - errores
          info: "#3B82F6",        // Azul - información
          neutral: "#6B7280",     // Gris - neutral
        },

        // TREND INDICATORS
        "trend": {
          positive: "#10B981",    // Verde - tendencia positiva
          negative: "#EF4444",    // Rojo - tendencia negativa
          neutral: "#6B7280",     // Gris - sin cambios
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      spacing: {
        // SISTEMA DE ESPACIADO PREMIUM - MÁS GENEROSO
        xs: "0.5rem", // 8px
        sm: "1rem", // 16px
        md: "1.5rem", // 24px
        lg: "2rem", // 32px
        xl: "3rem", // 48px
        "2xl": "4rem", // 64px
        "3xl": "6rem", // 96px
        "4xl": "8rem", // 128px - Para secciones premium
        "5xl": "10rem", // 160px - Para espaciado dramático
        "6xl": "12rem", // 192px - Para hero sections
        
        // Espaciado específico para componentes premium
        "premium-sm": "1.5rem", // 24px - Cards padding
        "premium-md": "2.5rem", // 40px - Section padding
        "premium-lg": "4rem", // 64px - Section vertical padding
        "premium-xl": "6rem", // 96px - Hero sections
        "premium-2xl": "8rem", // 128px - Landing sections

        // ANALYTICS & WIDGETS SPACING
        "widget-xs": "0.75rem", // 12px - Widget padding pequeño
        "widget-sm": "1rem", // 16px - Widget padding estándar
        "widget-md": "1.5rem", // 24px - Widget padding generoso
        "widget-lg": "2rem", // 32px - Widget padding amplio
        "widget-gap": "1.5rem", // 24px - Gap entre widgets
        "chart-padding": "1.25rem", // 20px - Padding interno de charts
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
