import { useState, useEffect } from "react";
import type { Property } from "@/lib/supabase";

interface PropertyWithStats extends Property {
  views?: number;
  leads?: number;
}

export const usePropertiesData = () => {
  const [properties, setProperties] = useState<PropertyWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/properties");
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setError("Error al cargar las propiedades");
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (propertyId: number, featured: boolean) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Update local state
      setProperties(prev =>
        prev.map(property =>
          property.id === propertyId ? { ...property, featured } : property
        )
      );

      return true;
    } catch (error) {
      console.error("Error updating featured status:", error);
      return false;
    }
  };

  const deleteProperty = async (propertyId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta propiedad?")) {
      return false;
    }

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Remove from local state
      setProperties(prev => prev.filter(property => property.id !== propertyId));
      return true;
    } catch (error) {
      console.error("Error deleting property:", error);
      return false;
    }
  };

  const getStats = () => {
    const total = properties.length;
    const available = properties.filter(p => p.status === "available").length;
    const sold = properties.filter(p => p.status === "sold" || p.status === "rented").length;
    const featured = properties.filter(p => p.featured).length;

    return { total, available, sold, featured };
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return {
    properties,
    loading,
    error,
    fetchProperties,
    toggleFeatured,
    deleteProperty,
    getStats,
  };
};