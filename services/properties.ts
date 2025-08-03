import { supabase, type Property, type PropertyInsert, type PropertyUpdate, STATUS_MAP } from "@/lib/supabase"

export interface PropertyFilters {
  property_type?: string
  operation_type?: string
  min_price?: number
  max_price?: number
  bedrooms?: number
  bathrooms?: number
  neighborhood?: string
  featured?: boolean
  status?: string
}

export interface PropertySearchParams extends PropertyFilters {
  page?: number
  limit?: number
  search?: string
  sort_by?: "price" | "created_at" | "views"
  sort_order?: "asc" | "desc"
}

export class PropertyService {
  static async getProperties(params: PropertySearchParams = {}) {
    const { page = 1, limit = 10, search, sort_by = "created_at", sort_order = "desc", ...filters } = params

    let query = supabase.from("properties").select("*", { count: "exact" })

    // Aplicar filtros
    if (filters.property_type) {
      query = query.eq("property_type", filters.property_type)
    }

    if (filters.operation_type) {
      query = query.eq("operation_type", filters.operation_type)
    }

    if (filters.min_price) {
      query = query.gte("price", filters.min_price)
    }

    if (filters.max_price) {
      query = query.lte("price", filters.max_price)
    }

    if (filters.bedrooms) {
      query = query.eq("bedrooms", filters.bedrooms)
    }

    if (filters.bathrooms) {
      query = query.eq("bathrooms", filters.bathrooms)
    }

    if (filters.neighborhood) {
      query = query.eq("neighborhood", filters.neighborhood)
    }

    if (filters.featured !== undefined) {
      query = query.eq("featured", filters.featured)
    }

    if (filters.status) {
      query = query.eq("status", filters.status)
    }

    // Búsqueda por texto
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,address.ilike.%${search}%`)
    }

    // Ordenamiento
    query = query.order(sort_by, { ascending: sort_order === "asc" })

    // Paginación
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error fetching properties: ${error.message}`)
    }

    // Convertir status de la base de datos al frontend y procesar imágenes
    const propertiesWithMappedStatus = data?.map((property) => ({
      ...property,
      status_display: STATUS_MAP[property.status as keyof typeof STATUS_MAP] || property.status,
      images: property.images || [], // Asegurar que images sea un array
    }))

    return {
      properties: propertiesWithMappedStatus || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    }
  }

  static async getPropertyById(id: number): Promise<Property | null> {
    const { data, error } = await supabase.from("properties").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // Property not found
      }
      throw new Error(`Error fetching property: ${error.message}`)
    }

    return data
  }

  static async createProperty(property: PropertyInsert): Promise<Property> {
    const { data, error } = await supabase.from("properties").insert([property]).select().single()

    if (error) {
      throw new Error(`Error creating property: ${error.message}`)
    }

    return data
  }

  static async updateProperty(id: number, updates: PropertyUpdate): Promise<Property> {
    const { data, error } = await supabase.from("properties").update(updates).eq("id", id).select().single()

    if (error) {
      throw new Error(`Error updating property: ${error.message}`)
    }

    return data
  }

  static async deleteProperty(id: number): Promise<void> {
    const { error } = await supabase.from("properties").delete().eq("id", id)

    if (error) {
      throw new Error(`Error deleting property: ${error.message}`)
    }
  }

  static async incrementViews(id: number): Promise<void> {
    const { error } = await supabase.rpc("increment_property_views", {
      property_id: id,
    })

    if (error) {
      console.error("Error incrementing views:", error)
      // No lanzar error para no afectar la experiencia del usuario
    }
  }

  static async getFeaturedProperties(limit = 6): Promise<Property[]> {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("featured", true)
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Error fetching featured properties: ${error.message}`)
    }

    return data || []
  }

  static async getNeighborhoods(): Promise<string[]> {
    const { data, error } = await supabase
      .from("properties")
      .select("neighborhood")
      .not("neighborhood", "is", null)
      .order("neighborhood")

    if (error) {
      throw new Error(`Error fetching neighborhoods: ${error.message}`)
    }

    // Obtener valores únicos
    const neighborhoods = [...new Set(data?.map((item) => item.neighborhood).filter(Boolean))]
    return neighborhoods as string[]
  }

  static async getPropertyStats() {
    const { data, error } = await supabase.from("properties").select("status, featured, views")

    if (error) {
      throw new Error(`Error fetching property stats: ${error.message}`)
    }

    const stats = {
      total: data?.length || 0,
      available: data?.filter((p) => p.status === "available").length || 0,
      sold: data?.filter((p) => p.status === "sold").length || 0,
      rented: data?.filter((p) => p.status === "rented").length || 0,
      reserved: data?.filter((p) => p.status === "reserved").length || 0,
      featured: data?.filter((p) => p.featured).length || 0,
      totalViews: data?.reduce((sum, p) => sum + (p.views || 0), 0) || 0,
    }

    return stats
  }
}

// Helper function para convertir status de DB a frontend
export function getStatusDisplay(status: string): string {
  return STATUS_MAP[status as keyof typeof STATUS_MAP] || status
}
