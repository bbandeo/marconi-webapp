"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, X, Upload, Camera, Trash2, ArrowLeft, MapPin, DollarSign, Home as HomeIcon, Info } from "lucide-react";

interface PropertyFormData {
	title: string;
	description: string;
	type: string;
	operation: string;
	price: number | "";
	currency: string;
	bedrooms: number | "";
	bathrooms: number | "";
	area: number | "";
	address: string;
	neighborhood: string;
	features: string;
	featured: boolean;
	status: string;
	images: File[];
}

interface PropertyFormProps {
	property?: any; // Para modo edición
	mode: "create" | "edit";
}

const PropertyForm = ({ property, mode = "create" }: PropertyFormProps) => {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [imageUploading, setImageUploading] = useState(false);

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

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [imagePreview, setImagePreview] = useState<string[]>(property?.images || []);

	const propertyTypes = [
		{ value: "casa", label: "Casa" },
		{ value: "departamento", label: "Departamento" },
		{ value: "terreno", label: "Terreno" },
		{ value: "local", label: "Local" }
	];
	const operations = [
		{ value: "venta", label: "Venta" },
		{ value: "alquiler", label: "Alquiler" }
	];
	const currencies = ["USD", "ARS"];
	const neighborhoods = ["Centro", "Barrio Parque", "Barrio Lorenzón", "314 Viviendas", "Zona Rural", "Barrio Norte", "Villa Constitución"];
	const statuses = [
		{ value: "available", label: "Disponible" },
		{ value: "reserved", label: "Reservado" },
		{ value: "sold", label: "Vendido" },
		{ value: "rented", label: "Alquilado" }
	];

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.title.trim()) newErrors.title = "El título es obligatorio";
		if (!formData.description.trim()) newErrors.description = "La descripción es obligatoria";
		if (!formData.price) newErrors.price = "El precio es obligatorio";
		if (!formData.area) newErrors.area = "La superficie es obligatoria";
		if (!formData.address.trim()) newErrors.address = "La dirección es obligatoria";

		// Validaciones específicas por tipo
		if (formData.type === "casa" || formData.type === "departamento") {
			if (!formData.bedrooms) newErrors.bedrooms = "Los dormitorios son obligatorios para casas y departamentos";
			if (!formData.bathrooms) newErrors.bathrooms = "Los baños son obligatorios para casas y departamentos";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange = (field: keyof PropertyFormData, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Limpiar error del campo cuando el usuario empiece a escribir
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const handleImageUpload = async (files: FileList) => {
		setImageUploading(true);

		// Simular upload a Cloudinary
		try {
			const uploadPromises = Array.from(files).map(async file => {
				// Aquí iría la lógica real de upload a Cloudinary
				// const response = await uploadToCloudinary(file)
				// return response.secure_url

				// Por ahora, simulamos con URL local
				return new Promise<string>(resolve => {
					const reader = new FileReader();
					reader.onload = e => resolve(e.target?.result as string);
					reader.readAsDataURL(file);
				});
			});

			const uploadedUrls = await Promise.all(uploadPromises);
			setImagePreview(prev => [...prev, ...uploadedUrls]);
			setFormData(prev => ({ ...prev, images: [...prev.images, ...Array.from(files)] }));
		} catch (error) {
			console.error("Error uploading images:", error);
		} finally {
			setImageUploading(false);
		}
	};

	const removeImage = (index: number) => {
		setImagePreview(prev => prev.filter((_, i) => i !== index));
		setFormData(prev => ({
			...prev,
			images: prev.images.filter((_, i) => i !== index)
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setLoading(true);

		try {
			// Preparar datos para envío
			const submitData = {
				...formData,
				features: formData.features
					.split(",")
					.map(f => f.trim())
					.filter(f => f),
				price: Number(formData.price),
				area: Number(formData.area),
				bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
				bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null
			};

			// Aquí iría la llamada a la API
			if (mode === "create") {
				// await createProperty(submitData)
				console.log("Creating property:", submitData);
			} else {
				// await updateProperty(property.id, submitData)
				console.log("Updating property:", submitData);
			}

			// Redirect después del éxito
			router.push("/admin/properties");
		} catch (error) {
			console.error("Error saving property:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
						<ArrowLeft className="w-5 h-5" />
					</button>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">{mode === "create" ? "Nueva Propiedad" : "Editar Propiedad"}</h1>
						<p className="text-gray-600">
							{mode === "create" ? "Completa la información para publicar una nueva propiedad" : "Modifica los datos de la propiedad"}
						</p>
					</div>
				</div>
			</div>

			<div onSubmit={handleSubmit} className="space-y-6">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Información Básica */}
					<div className="lg:col-span-2 space-y-6">
						<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
							<div className="flex items-center space-x-2 mb-4">
								<Info className="w-5 h-5 text-orange-500" />
								<h2 className="text-lg font-semibold text-gray-900">Información Básica</h2>
							</div>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
									<input
										type="text"
										value={formData.title}
										onChange={e => handleInputChange("title", e.target.value)}
										className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
											errors.title ? "border-red-300" : "border-gray-300"
										}`}
										placeholder="Ej: Casa familiar en Barrio Parque"
									/>
									{errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
										<select
											value={formData.type}
											onChange={e => handleInputChange("type", e.target.value)}
											className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500">
											{propertyTypes.map(type => (
												<option key={type.value} value={type.value}>
													{type.label}
												</option>
											))}
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Operación *</label>
										<select
											value={formData.operation}
											onChange={e => handleInputChange("operation", e.target.value)}
											className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500">
											{operations.map(op => (
												<option key={op.value} value={op.value}>
													{op.label}
												</option>
											))}
										</select>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Precio *</label>
										<input
											type="number"
											value={formData.price}
											onChange={e => handleInputChange("price", e.target.value ? Number(e.target.value) : "")}
											className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
												errors.price ? "border-red-300" : "border-gray-300"
											}`}
											placeholder="75000"
										/>
										{errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
										<select
											value={formData.currency}
											onChange={e => handleInputChange("currency", e.target.value)}
											className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500">
											{currencies.map(currency => (
												<option key={currency} value={currency}>
													{currency}
												</option>
											))}
										</select>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
									<textarea
										rows={4}
										value={formData.description}
										onChange={e => handleInputChange("description", e.target.value)}
										className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
											errors.description ? "border-red-300" : "border-gray-300"
										}`}
										placeholder="Describe las características principales de la propiedad..."
									/>
									{errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
								</div>
							</div>
						</div>

						{/* Detalles */}
						<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
							<div className="flex items-center space-x-2 mb-4">
								<HomeIcon className="w-5 h-5 text-orange-500" />
								<h2 className="text-lg font-semibold text-gray-900">Detalles de la Propiedad</h2>
							</div>

							<div className="grid grid-cols-3 gap-4 mb-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Dormitorios {(formData.type === "Casa" || formData.type === "Departamento") && "*"}
									</label>
									<input
										type="number"
										value={formData.bedrooms}
										onChange={e => handleInputChange("bedrooms", e.target.value ? Number(e.target.value) : "")}
										className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
											errors.bedrooms ? "border-red-300" : "border-gray-300"
										}`}
										placeholder="3"
										disabled={formData.type === "Terreno" || formData.type === "Local"}
									/>
									{errors.bedrooms && <p className="text-red-500 text-xs mt-1">{errors.bedrooms}</p>}
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Baños {(formData.type === "Casa" || formData.type === "Departamento") && "*"}
									</label>
									<input
										type="number"
										value={formData.bathrooms}
										onChange={e => handleInputChange("bathrooms", e.target.value ? Number(e.target.value) : "")}
										className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
											errors.bathrooms ? "border-red-300" : "border-gray-300"
										}`}
										placeholder="2"
										disabled={formData.type === "Terreno" || formData.type === "Local"}
									/>
									{errors.bathrooms && <p className="text-red-500 text-xs mt-1">{errors.bathrooms}</p>}
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Superficie (m²) *</label>
									<input
										type="number"
										value={formData.area}
										onChange={e => handleInputChange("area", e.target.value ? Number(e.target.value) : "")}
										className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
											errors.area ? "border-red-300" : "border-gray-300"
										}`}
										placeholder="150"
									/>
									{errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Características (separadas por coma)</label>
								<input
									type="text"
									value={formData.features}
									onChange={e => handleInputChange("features", e.target.value)}
									className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
									placeholder="cochera, patio, parrilla, aire acondicionado"
								/>
							</div>
						</div>

						{/* Ubicación */}
						<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
							<div className="flex items-center space-x-2 mb-4">
								<MapPin className="w-5 h-5 text-orange-500" />
								<h2 className="text-lg font-semibold text-gray-900">Ubicación</h2>
							</div>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
									<input
										type="text"
										value={formData.address}
										onChange={e => handleInputChange("address", e.target.value)}
										className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
											errors.address ? "border-red-300" : "border-gray-300"
										}`}
										placeholder="Belgrano 1234"
									/>
									{errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Barrio</label>
									<select
										value={formData.neighborhood}
										onChange={e => handleInputChange("neighborhood", e.target.value)}
										className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500">
										{neighborhoods.map(neighborhood => (
											<option key={neighborhood} value={neighborhood}>
												{neighborhood}
											</option>
										))}
									</select>
								</div>
							</div>
						</div>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Estado y Configuración */}
						<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
							<h2 className="text-lg font-semibold text-gray-900 mb-4">Configuración</h2>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
									<select
										value={formData.status}
										onChange={e => handleInputChange("status", e.target.value)}
										className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500">
										{statuses.map(status => (
											<option key={status.value} value={status.value}>
												{status.label}
											</option>
										))}
									</select>
								</div>

								<div className="flex items-center space-x-2">
									<input
										type="checkbox"
										id="featured"
										checked={formData.featured}
										onChange={e => handleInputChange("featured", e.target.checked)}
										className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
									/>
									<label htmlFor="featured" className="text-sm text-gray-700 font-medium">
										Propiedad destacada
									</label>
								</div>
							</div>
						</div>

						{/* Upload de Imágenes */}
						<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
							<div className="flex items-center space-x-2 mb-4">
								<Camera className="w-5 h-5 text-orange-500" />
								<h2 className="text-lg font-semibold text-gray-900">Imágenes</h2>
							</div>

							{/* Drag & Drop Area */}
							<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
								<Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p className="text-gray-600 mb-2">Arrastra imágenes aquí o haz click para seleccionar</p>
								<p className="text-sm text-gray-500 mb-4">PNG, JPG hasta 10MB cada una</p>
								<input
									type="file"
									multiple
									accept="image/*"
									onChange={e => e.target.files && handleImageUpload(e.target.files)}
									className="hidden"
									id="image-upload"
								/>
								<label
									htmlFor="image-upload"
									className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer transition-colors">
									<Upload className="w-4 h-4 mr-2" />
									{imageUploading ? "Subiendo..." : "Seleccionar Imágenes"}
								</label>
							</div>

							{/* Image Preview */}
							{imagePreview.length > 0 && (
								<div className="mt-4 space-y-2">
									<h3 className="text-sm font-medium text-gray-700">Imágenes cargadas:</h3>
									<div className="grid grid-cols-2 gap-2">
										{imagePreview.map((src, index) => (
											<div key={index} className="relative group">
												<img
													src={src}
													alt={`Preview ${index + 1}`}
													className="w-full h-24 object-cover rounded-lg border border-gray-200"
												/>
												<button
													type="button"
													onClick={() => removeImage(index)}
													className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
													<X className="w-3 h-3" />
												</button>
											</div>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Acciones */}
						<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
							<h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h2>

							<div className="space-y-3">
								<button
									type="button"
									onClick={handleSubmit}
									disabled={loading}
									className="w-full flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
									<Save className="w-4 h-4 mr-2" />
									{loading ? "Guardando..." : mode === "create" ? "Crear Propiedad" : "Actualizar Propiedad"}
								</button>

								<button
									type="button"
									onClick={() => router.back()}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
									Cancelar
								</button>

								{mode === "edit" && (
									<button
										type="button"
										onClick={() => {
											if (confirm("¿Estás seguro de que quieres eliminar esta propiedad?")) {
												// handleDelete(property.id)
												router.push("/admin/properties");
											}
										}}
										className="w-full flex items-center justify-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
										<Trash2 className="w-4 h-4 mr-2" />
										Eliminar Propiedad
									</button>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PropertyForm;
