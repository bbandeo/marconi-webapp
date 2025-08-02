import type { Contact } from "./useContacts"

export function useContactActions() {
  const generateWhatsAppLink = (contact: Contact) => {
    const message = encodeURIComponent(
      `Hola ${contact.name}, me comunico desde Marconi Inmobiliaria respecto a su consulta sobre ${contact.property}. ¿Podríamos coordinar una visita?`,
    )
    return `https://wa.me/${contact.phone.replace(/\D/g, "")}?text=${message}`
  }

  const generateEmailLink = (contact: Contact) => {
    const subject = encodeURIComponent(`Consulta sobre ${contact.property}`)
    const body = encodeURIComponent(
      `Estimado/a ${contact.name},\n\nGracias por su interés en ${contact.property}.\n\nNos ponemos en contacto para brindarle más información y coordinar una visita.\n\nSaludos cordiales,\nEquipo Marconi Inmobiliaria`,
    )
    return `mailto:${contact.email}?subject=${subject}&body=${body}`
  }

  const generatePhoneLink = (contact: Contact) => {
    return `tel:${contact.phone}`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
      return false
    }
  }

  const markAsContacted = async (
    contactId: number,
    updateContact: (id: number, updates: Partial<Contact>) => Promise<any>,
  ) => {
    try {
      await updateContact(contactId, {
        status: "contacted",
        lastContact: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Failed to mark as contacted:", error)
      throw error
    }
  }

  return {
    generateWhatsAppLink,
    generateEmailLink,
    generatePhoneLink,
    copyToClipboard,
    markAsContacted,
  }
}
