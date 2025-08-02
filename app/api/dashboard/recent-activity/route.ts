import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    // Try to connect to Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Try to fetch real data from Supabase
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)

    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(3)

    // If we have real data, format and return it
    if (!leadsError && !propertiesError && leads && properties) {
      const recentActivity = [
        ...leads.map((lead) => ({
          id: lead.id,
          type: "lead" as const,
          title: `Nuevo contacto: ${lead.name}`,
          description: `Interesado en ${lead.property_type || "propiedades"}`,
          time: new Date(lead.created_at).toLocaleString("es-AR"),
          icon: "👤",
        })),
        ...properties.map((property) => ({
          id: property.id,
          type: "property" as const,
          title: `Propiedad actualizada: ${property.title}`,
          description: `${property.type} en ${property.location}`,
          time: new Date(property.updated_at).toLocaleString("es-AR"),
          icon: "🏠",
        })),
      ]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 10)

      return NextResponse.json({ recentActivity })
    }
  } catch (error) {
    console.error("Error connecting to Supabase:", error)
  }

  // Fallback to mock data if Supabase is not available
  const mockRecentActivity = [
    {
      id: "1",
      type: "lead" as const,
      title: "Nuevo contacto: María González",
      description: "Interesada en casa de 3 dormitorios",
      time: new Date(Date.now() - 1000 * 60 * 15).toLocaleString("es-AR"),
      icon: "👤",
    },
    {
      id: "2",
      type: "property" as const,
      title: "Propiedad actualizada: Casa Barrio Norte",
      description: "Precio reducido a $85.000 USD",
      time: new Date(Date.now() - 1000 * 60 * 45).toLocaleString("es-AR"),
      icon: "🏠",
    },
    {
      id: "3",
      type: "lead" as const,
      title: "Nuevo contacto: Carlos Rodríguez",
      description: "Busca terreno para inversión",
      time: new Date(Date.now() - 1000 * 60 * 60 * 2).toLocaleString("es-AR"),
      icon: "👤",
    },
    {
      id: "4",
      type: "property" as const,
      title: "Nueva propiedad: Departamento Centro",
      description: "Departamento 2 ambientes agregado",
      time: new Date(Date.now() - 1000 * 60 * 60 * 4).toLocaleString("es-AR"),
      icon: "🏢",
    },
    {
      id: "5",
      type: "lead" as const,
      title: "Consulta WhatsApp: Ana Martínez",
      description: "Pregunta por financiación",
      time: new Date(Date.now() - 1000 * 60 * 60 * 6).toLocaleString("es-AR"),
      icon: "💬",
    },
  ]

  return NextResponse.json({ recentActivity: mockRecentActivity })
}
