import { createClient } from "@supabase/supabase-js"

// Variables de entorno (no lanzar en build)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any)

// Para operaciones del servidor (con service role)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = (supabaseUrl && supabaseServiceRoleKey)
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

// Tipos TypeScript para la base de datos
export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: number
          title: string
          description: string | null
          price: number
          currency: string
          property_type: string
          operation_type: string
          bedrooms: number | null
          bathrooms: number | null
          area_m2: number | null
          address: string | null
          neighborhood: string | null
          city: string
          province: string
          images: string[]
          features: string[]
          featured: boolean
          status: string
          views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          price: number
          currency?: string
          property_type: string
          operation_type: string
          bedrooms?: number | null
          bathrooms?: number | null
          area_m2?: number | null
          address?: string | null
          neighborhood?: string | null
          city?: string
          province?: string
          images?: string[]
          features?: string[]
          featured?: boolean
          status?: string
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          price?: number
          currency?: string
          property_type?: string
          operation_type?: string
          bedrooms?: number | null
          bathrooms?: number | null
          area_m2?: number | null
          address?: string | null
          neighborhood?: string | null
          city?: string
          province?: string
          images?: string[]
          features?: string[]
          featured?: boolean
          status?: string
          views?: number
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: number
          name: string
          email: string | null
          phone: string | null
          message: string | null
          property_id: number | null
          lead_source: string
          status: string
          notes: string | null
          last_contact: string | null
          next_action: string | null
          next_action_date: string | null
          priority: string
          score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          email?: string | null
          phone?: string | null
          message?: string | null
          property_id?: number | null
          lead_source?: string
          status?: string
          notes?: string | null
          last_contact?: string | null
          next_action?: string | null
          next_action_date?: string | null
          priority?: string
          score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string | null
          phone?: string | null
          message?: string | null
          property_id?: number | null
          lead_source?: string
          status?: string
          notes?: string | null
          last_contact?: string | null
          next_action?: string | null
          next_action_date?: string | null
          priority?: string
          score?: number
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: string
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Property = Database["public"]["Tables"]["properties"]["Row"]
export type PropertyInsert = Database["public"]["Tables"]["properties"]["Insert"]
export type PropertyUpdate = Database["public"]["Tables"]["properties"]["Update"]

export type Lead = Database["public"]["Tables"]["leads"]["Row"]
export type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"]
export type LeadUpdate = Database["public"]["Tables"]["leads"]["Update"]

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]

// Mapeo de valores para el frontend
export const STATUS_MAP = {
  available: "Disponible",
  sold: "Vendido",
  rented: "Alquilado",
  reserved: "Reservado",
} as const

export const STATUS_MAP_REVERSE = {
  Disponible: "available",
  Vendido: "sold",
  Alquilado: "rented",
  Reservado: "reserved",
} as const

export const PROPERTY_TYPE_MAP = {
  casa: "Casa",
  departamento: "Departamento",
  terreno: "Terreno",
  local: "Local",
} as const

export const OPERATION_TYPE_MAP = {
  venta: "Venta",
  alquiler: "Alquiler",
} as const

// Lead status mapping
export const LEAD_STATUS_MAP = {
  new: "Nuevo",
  contacted: "Contactado",
  qualified: "Calificado",
  converted: "Convertido",
} as const

export const LEAD_PRIORITY_MAP = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
} as const
