import { Lead, LeadInsert } from "@/lib/supabase";

export class LeadsService {
	private static baseUrl = "/api/leads";

	// Crear nuevo lead (desde formulario de contacto)
	static async createLead(data: Omit<LeadInsert, "id">): Promise<Lead> {
		const response = await fetch(this.baseUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to create lead");
		}

		const result = await response.json();
		return result.lead;
	}

	// Actualizar estado del lead
	static async updateLead(id: number, data: { status: string; notes?: string }): Promise<Lead> {
		const response = await fetch(`${this.baseUrl}/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to update lead");
		}

		const result = await response.json();
		return result.lead;
	}
}
