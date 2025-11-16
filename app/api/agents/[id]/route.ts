import { type NextRequest, NextResponse } from "next/server"
import { AgentService } from "@/services/agents"
import { deleteFromCloudinary } from "@/lib/cloudinary-server"

/**
 * GET /api/agents/[id]
 * Fetches a single agent by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = Number(params.id)

    if (isNaN(agentId)) {
      return NextResponse.json({ error: "ID de agente inválido" }, { status: 400 })
    }

    const agent = await AgentService.getAgentById(agentId)

    if (!agent) {
      return NextResponse.json({ error: "Agente no encontrado" }, { status: 404 })
    }

    return NextResponse.json(agent)
  } catch (error) {
    console.error("API error fetching agent:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener agente" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/agents/[id]
 * Updates an existing agent
 * Body should contain AgentUpdate data
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = Number(params.id)

    if (isNaN(agentId)) {
      return NextResponse.json({ error: "ID de agente inválido" }, { status: 400 })
    }

    const body = await request.json()

    const agent = await AgentService.updateAgent(agentId, body)

    return NextResponse.json(agent)
  } catch (error) {
    console.error("API error updating agent:", error)

    // Handle duplicate email error
    if (error instanceof Error && error.message.includes("ya está registrado")) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al actualizar agente" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/agents/[id]
 * Soft deletes an agent (sets active = false)
 * Also removes the agent's photo from Cloudinary if it exists
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = Number(params.id)

    if (isNaN(agentId)) {
      return NextResponse.json({ error: "ID de agente inválido" }, { status: 400 })
    }

    // Get agent to retrieve photo_public_id before deletion
    const agent = await AgentService.getAgentById(agentId)

    if (!agent) {
      return NextResponse.json({ error: "Agente no encontrado" }, { status: 404 })
    }

    // Delete photo from Cloudinary if it exists
    if (agent.photo_public_id) {
      try {
        await deleteFromCloudinary(agent.photo_public_id)
      } catch (cloudinaryError) {
        // Log the error but don't fail the deletion
        console.error("Error deleting photo from Cloudinary:", cloudinaryError)
      }
    }

    // Soft delete the agent from database
    await AgentService.deleteAgent(agentId)

    return NextResponse.json({ success: true, message: "Agente eliminado correctamente" })
  } catch (error) {
    console.error("API error deleting agent:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al eliminar agente" },
      { status: 500 }
    )
  }
}
