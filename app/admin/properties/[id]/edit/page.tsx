"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import PropertyForm from "@/components/admin/PropertyForm";

export default function EditPropertyPage() {
	const params = useParams();
	const [property, setProperty] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Simular carga de datos de la propiedad
		const loadProperty = async () => {
			try {
				// const property = await getProperty(params.id)
				// Datos de ejemplo
				const mockProperty = {
					id: Number(params.id),
					title: "Casa familiar en Barrio Parque",
					description: "Hermosa casa de 3 dormitorios con gran patio y parrilla. Ideal para familias que buscan comodidad y espacio.",
					type: "Casa",
					operation: "Venta",
					price: 75000,
					currency: "USD",
					bedrooms: 3,
					bathrooms: 2,
					area: 150,
					address: "Belgrano 1234",
					neighborhood: "Barrio Parque",
					features: ["cochera", "patio", "parrilla", "aire acondicionado"],
					featured: true,
					status: "Disponible",
					images: []
				};
				setProperty(mockProperty);
			} catch (error) {
				console.error("Error loading property:", error);
			} finally {
				setLoading(false);
			}
		};

		if (params.id) {
			loadProperty();
		}
	}, [params.id]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
			</div>
		);
	}

	if (!property) {
		return (
			<div className="text-center py-12">
				<h2 className="text-2xl font-bold text-gray-900 mb-4">Propiedad no encontrada</h2>
				<p className="text-gray-600">La propiedad que buscas no existe o ha sido eliminada.</p>
			</div>
		);
	}

	return <PropertyForm property={property} mode="edit" />;
}
