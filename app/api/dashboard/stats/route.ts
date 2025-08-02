import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    // Try to connect to Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Try to fetch real data from Supabase
    const { data: properties, error: propertiesError } = await supabase.from("properties").select("*")

    const { data: leads, error: leadsError } = await supabase.from("leads").select("*")

    // If we have real data, calculate stats and return them
    if (!propertiesError && !leadsError && properties && leads) {
      const totalProperties = properties.length
      const totalLeads = leads.length
      const totalRevenue = properties.filter((p) => p.status === "sold").reduce((sum, p) => sum + (p.price || 0), 0)
      const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0)

      return NextResponse.json({
        totalProperties,
        totalLeads,
        totalRevenue,
        totalViews,
      })
    }
  } catch (error) {
    console.error("Error connecting to Supabase:", error)
  }

  // Fallback to mock data if Supabase is not available
  const mockStats = {
    totalProperties: 24,
    totalLeads: 156,
    totalRevenue: 2450000,
    totalViews: 8924,
  }

  return NextResponse.json(mockStats)
}
