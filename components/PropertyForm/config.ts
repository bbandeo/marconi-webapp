export const PROPERTY_FORM_CONFIG = {
  propertyTypes: [
    { value: "casa", label: "Casa" },
    { value: "departamento", label: "Departamento" },
    { value: "terreno", label: "Terreno" },
    { value: "local", label: "Local" }
  ],
  
  operations: [
    { value: "venta", label: "Venta" },
    { value: "alquiler", label: "Alquiler" }
  ],
  
  currencies: ["USD", "ARS"],
  
  neighborhoods: [
    "Centro", 
    "Barrio Parque", 
    "Barrio Lorenzón", 
    "314 Viviendas", 
    "Zona Rural", 
    "Barrio Norte", 
    "Villa Constitución"
  ],
  
  statuses: [
    { value: "available", label: "Disponible" },
    { value: "reserved", label: "Reservado" },
    { value: "sold", label: "Vendido" },
    { value: "rented", label: "Alquilado" }
  ]
};