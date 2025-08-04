import { PropertyFormData, FormErrors } from './types';

export const validatePropertyForm = (formData: PropertyFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!formData.title.trim()) {
    errors.title = "El título es obligatorio";
  }
  
  if (!formData.description.trim()) {
    errors.description = "La descripción es obligatoria";
  }
  
  if (!formData.price) {
    errors.price = "El precio es obligatorio";
  }
  
  if (!formData.area) {
    errors.area = "La superficie es obligatoria";
  }
  
  if (!formData.address.trim()) {
    errors.address = "La dirección es obligatoria";
  }

  // Validaciones específicas por tipo
  if (formData.type === "casa" || formData.type === "departamento") {
    if (!formData.bedrooms) {
      errors.bedrooms = "Los dormitorios son obligatorios para casas y departamentos";
    }
    if (!formData.bathrooms) {
      errors.bathrooms = "Los baños son obligatorios para casas y departamentos";
    }
  }

  return errors;
};