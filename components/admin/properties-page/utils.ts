import type { Property } from "@/lib/supabase";

export const formatPrice = (price: number, currency: string = "USD") => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const getPropertyTypeLabel = (type: string) => {
  switch (type) {
    case "casa":
      return "Casa";
    case "departamento":
      return "Departamento";
    case "local":
      return "Local Comercial";
    case "terreno":
      return "Terreno";
    default:
      return type;
  }
};

export const getOperationTypeLabel = (operation: string) => {
  switch (operation) {
    case "venta":
      return "Venta";
    case "alquiler":
      return "Alquiler";
    default:
      return operation;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800";
    case "reserved":
      return "bg-yellow-100 text-yellow-800";
    case "sold":
      return "bg-red-100 text-red-800";
    case "rented":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "available":
      return "Disponible";
    case "reserved":
      return "Reservado";
    case "sold":
      return "Vendido";
    case "rented":
      return "Alquilado";
    default:
      return status;
  }
};

export const filterProperties = (
  properties: Property[],
  searchTerm: string,
  statusFilter: string,
  typeFilter: string
) => {
  return properties.filter(property => {
    const matchesSearch = !searchTerm || 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || property.status === statusFilter;
    const matchesType = typeFilter === "all" || property.property_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });
};