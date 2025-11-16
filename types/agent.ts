import { z } from "zod"
import type { Agent } from "@/lib/supabase"

// Zod validation schema for agent form
export const agentFormSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(255, "El nombre no puede exceder 255 caracteres"),

  email: z
    .string()
    .min(1, "El email es requerido")
    .email("El email debe ser válido")
    .max(255, "El email no puede exceder 255 caracteres"),

  phone: z
    .string()
    .min(1, "El teléfono es requerido")
    .max(50, "El teléfono no puede exceder 50 caracteres"),

  whatsapp: z
    .string()
    .max(50, "El WhatsApp no puede exceder 50 caracteres")
    .optional()
    .or(z.literal("")),

  bio: z
    .string()
    .optional()
    .or(z.literal("")),

  specialty: z
    .string()
    .max(255, "La especialidad no puede exceder 255 caracteres")
    .optional()
    .or(z.literal("")),

  years_of_experience: z
    .number({
      invalid_type_error: "Los años de experiencia deben ser un número",
    })
    .int("Los años de experiencia deben ser un número entero")
    .min(0, "Los años de experiencia no pueden ser negativos")
    .optional()
    .or(z.nan()),

  photo: z
    .instanceof(File, { message: "Debe ser un archivo" })
    .refine(
      (file) => file.size === 0 || file.size <= 5 * 1024 * 1024,
      "La imagen debe ser menor a 5MB"
    )
    .refine(
      (file) =>
        file.size === 0 ||
        ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type),
      "Solo se aceptan archivos JPG, PNG o WebP"
    )
    .optional(),
})

// Infer TypeScript type from Zod schema
export type AgentFormData = z.infer<typeof agentFormSchema>

// Extended agent type with additional client-side fields
export interface AgentWithPhoto extends Agent {
  photoFile?: File
}

// Helper type for API responses
export interface AgentApiResponse {
  agent?: Agent
  agents?: Agent[]
  error?: string
}

// Helper type for form submission data (before uploading to Cloudinary)
export interface AgentFormSubmitData {
  name: string
  email: string
  phone: string
  whatsapp?: string | null
  bio?: string | null
  specialty?: string | null
  years_of_experience?: number | null
  photo_url?: string | null
  photo_public_id?: string | null
}
