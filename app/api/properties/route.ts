import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ properties: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } })
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search")
    const operation = searchParams.get("operation")
    const type = searchParams.get("type")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")

    let query = supabase
      .from("properties")
      .select("*", { count: "exact" })
      .eq("status", "active")
      .order("created_at", { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,address.ilike.%${search}%,neighborhood.ilike.%${search}%`)
    }

    if (operation) {
      query = query.eq("operation_type", operation)
    }

    if (type) {
      query = query.eq("property_type", type)
    }

    if (minPrice) {
      query = query.gte("price", Number.parseInt(minPrice))
    }

    if (maxPrice) {
      query = query.lte("price", Number.parseInt(maxPrice))
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
    }

    return NextResponse.json({
      properties: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await request.json()

    const { data, error } = await supabase.from("properties").insert([body]).select().single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create property" }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
