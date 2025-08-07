"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import PropertyForm from "@/components/admin/PropertyForm";

export default function EditPropertyPage() {
	const params = useParams();
	const [property, setProperty] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadProperty = async () => {
			try {
				const response = await fetch(`/api/properties/${params.id}`);
				
				if (!response.ok) {
					if (response.status === 404) {
						setProperty(null);
						return;
					}
					throw new Error('Error al cargar la propiedad');
				}
				
				const property = await response.json();
				setProperty(property);
			} catch (error) {
				console.error("Error loading property:", error);
				setProperty(null);
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
