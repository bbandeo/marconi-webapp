import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyFormData, FormErrors } from '../types';
import { validatePropertyForm } from '../validation';

export const usePropertyForm = (property?: any, mode: "create" | "edit" = "create") => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<PropertyFormData>({
    title: property?.title || "",
    description: property?.description || "",
    type: property?.type || "casa",
    operation: property?.operation || "venta",
    price: property?.price || "",
    currency: property?.currency || "USD",
    bedrooms: property?.bedrooms || "",
    bathrooms: property?.bathrooms || "",
    area: property?.area || "",
    address: property?.address || "",
    neighborhood: property?.neighborhood || "Centro",
    features: property?.features?.join(", ") || "",
    featured: property?.featured || false,
    status: property?.status || "available",
    images: []
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = validatePropertyForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        features: formData.features
          .split(",")
          .map(f => f.trim())
          .filter(f => f.length > 0),
        price: Number(formData.price),
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
        area: Number(formData.area)
      };

      const url = mode === "create" ? "/api/properties" : `/api/properties/${property.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Redirect to admin properties page
      router.push("/admin/properties");
    } catch (error) {
      console.error("Error saving property:", error);
      alert("Error al guardar la propiedad. Por favor, inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!property?.id || mode !== "edit") return;

    if (!confirm("¿Estás seguro de que quieres eliminar esta propiedad?")) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      router.push("/admin/properties");
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("Error al eliminar la propiedad. Por favor, inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    handleInputChange,
    handleSubmit,
    handleDelete,
    validateForm
  };
};