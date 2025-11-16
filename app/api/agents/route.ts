import { type NextRequest, NextResponse } from "next/server"
import { AgentService } from "@/services/agents"

/**
 * GET /api/agents
 * Fetches agents from the database
 * Query params:
 *   - active: "true" to fetch only active agents, omit to fetch all
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("active") === "true"

    const agents = activeOnly
      ? await AgentService.getActiveAgents()
      : await AgentService.getAllAgents()

    return NextResponse.json({ agents })
  } catch (error) {
    console.error("API error fetching agents:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener agentes" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/agents
 * Creates a new agent
 * Body should contain AgentInsert data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json(
        { error: "Los campos nombre, email y teléfono son requeridos" },
        { status: 400 }
      )
    }

    const agent = await AgentService.createAgent(body)

    return NextResponse.json(agent, { status: 201 })
  } catch (error) {
    console.error("API error creating agent:", error)

    // Handle duplicate email error
    if (error instanceof Error && error.message.includes("ya está registrado")) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear agente" },
      { status: 500 }
    )
  }
}
