import { supabase, type Agent, type AgentInsert, type AgentUpdate } from "@/lib/supabase"

/**
 * Service class for managing real estate agents
 * Provides CRUD operations for the agents table
 */
export class AgentService {
  /**
   * Get all active agents for public display
   * Only returns agents where active = true
   * Ordered by creation date (newest first)
   */
  static async getActiveAgents(): Promise<Agent[]> {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Error fetching active agents: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get all agents regardless of active status (admin view)
   * Ordered by creation date (newest first)
   */
  static async getAllAgents(): Promise<Agent[]> {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Error fetching agents: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get a single agent by ID
   * @param id - The agent's ID
   * @returns The agent if found, null otherwise
   */
  static async getAgentById(id: number): Promise<Agent | null> {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      // PGRST116 is the error code for "no rows found"
      if (error.code === "PGRST116") {
        return null
      }
      throw new Error(`Error fetching agent: ${error.message}`)
    }

    return data
  }

  /**
   * Create a new agent
   * @param agent - Agent data to insert
   * @returns The created agent
   * @throws Error if email already exists (duplicate key violation)
   */
  static async createAgent(agent: AgentInsert): Promise<Agent> {
    const { data, error } = await supabase
      .from("agents")
      .insert([agent])
      .select()
      .single()

    if (error) {
      // 23505 is the PostgreSQL error code for unique constraint violation
      if (error.code === "23505") {
        throw new Error("El email ya está registrado")
      }
      throw new Error(`Error creating agent: ${error.message}`)
    }

    return data
  }

  /**
   * Update an existing agent
   * @param id - The agent's ID
   * @param updates - Partial agent data to update
   * @returns The updated agent
   * @throws Error if email already exists (duplicate key violation)
   */
  static async updateAgent(id: number, updates: AgentUpdate): Promise<Agent> {
    const { data, error } = await supabase
      .from("agents")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      // 23505 is the PostgreSQL error code for unique constraint violation
      if (error.code === "23505") {
        throw new Error("El email ya está registrado")
      }
      throw new Error(`Error updating agent: ${error.message}`)
    }

    return data
  }

  /**
   * Soft delete an agent by setting active = false
   * This preserves the data while hiding the agent from public view
   * @param id - The agent's ID
   */
  static async deleteAgent(id: number): Promise<void> {
    const { error } = await supabase
      .from("agents")
      .update({ active: false })
      .eq("id", id)

    if (error) {
      throw new Error(`Error deleting agent: ${error.message}`)
    }
  }

  /**
   * Permanently delete an agent from the database
   * This is a hard delete and cannot be undone
   * @param id - The agent's ID
   */
  static async hardDeleteAgent(id: number): Promise<void> {
    const { error } = await supabase
      .from("agents")
      .delete()
      .eq("id", id)

    if (error) {
      throw new Error(`Error deleting agent: ${error.message}`)
    }
  }

  /**
   * Get agent statistics
   * @returns Object with total and active agent counts
   */
  static async getAgentStats(): Promise<{ total: number; active: number; inactive: number }> {
    const { data, error } = await supabase.from("agents").select("active")

    if (error) {
      throw new Error(`Error fetching agent stats: ${error.message}`)
    }

    const stats = {
      total: data?.length || 0,
      active: data?.filter((a) => a.active).length || 0,
      inactive: data?.filter((a) => !a.active).length || 0,
    }

    return stats
  }
}
