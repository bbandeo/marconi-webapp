import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Fetch first image for related properties (in bulk)
    const propertyIds = Array.from(new Set((data || []).map((lead: any) => lead.property_id).filter(Boolean)))
    let propertyImagesMap: Record<number, { firstImage?: string; title?: string }> = {}

    if (propertyIds.length > 0) {
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select("id, images, title")
        .in("id", propertyIds)

      if (!propertiesError && Array.isArray(propertiesData)) {
        propertyImagesMap = propertiesData.reduce((acc: Record<number, { firstImage?: string; title?: string }>, p: any) => {
          acc[p.id] = { firstImage: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : undefined, title: p.title }
          return acc
        }, {})
      }
    }

    // Transform data to match frontend interface
    const transformedData = (data || []).map((lead: any) => ({
      id: lead.id,
      name: lead.name,
      email: lead.email || "",
      phone: lead.phone || "",
      message: lead.message || "",
      property: `Propiedad #${lead.property_id || "N/A"}`,
      propertyId: lead.property_id || null,
      propertyImage: lead.property_id ? propertyImagesMap[lead.property_id]?.firstImage || "" : "",
      status: lead.status || "new",
      source: lead.lead_source || "Website",
      createdAt: lead.created_at,
      notes: lead.notes || "",
      lastContact: lead.last_contact || "",
      nextAction: lead.next_action || "",
      nextActionDate: lead.next_action_date || "",
      priority: lead.priority || "medium",
      score: lead.score || 5,
    }))

    return NextResponse.json(transformedData)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from("leads")
      .insert({
        name: body.name,
        email: body.email,
        phone: body.phone,
        message: body.message,
        property_id: body.property_id,
        lead_source: body.source || "Website",
        status: body.status || "new",
        notes: body.notes || "",
        priority: body.priority || "medium",
        score: body.score || 5,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
