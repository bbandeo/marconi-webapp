import { HomeIcon } from "lucide-react";
import { PropertyFormData, FormErrors } from "../types";

interface PropertyDetailsSectionProps {
  formData: PropertyFormData;
  errors: FormErrors;
  handleInputChange: (field: keyof PropertyFormData, value: any) => void;
}

export default function PropertyDetailsSection({ 
  formData, 
  errors, 
  handleInputChange 
}: PropertyDetailsSectionProps) {
  const showRoomFields = formData.type === "casa" || formData.type === "departamento";

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center space-x-2 mb-6">
        <HomeIcon className="h-5 w-5 text-green-600" />
        <h2 className="text-lg font-semibold text-gray-900">Detalles de la Propiedad</h2>
      </div>

      <div className="space-y-6">
        {/* Conditional Room Fields */}
        {showRoomFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dormitorios *
              </label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => handleInputChange("bedrooms", e.target.value ? Number(e.target.value) : "")}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.bedrooms ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="3"
                min="0"
              />
              {errors.bedrooms && (
                <p className="mt-1 text-sm text-red-600">{errors.bedrooms}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Baños *
              </label>
              <input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => handleInputChange("bathrooms", e.target.value ? Number(e.target.value) : "")}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.bathrooms ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="2"
                min="0"
                step="0.5"
              />
              {errors.bathrooms && (
                <p className="mt-1 text-sm text-red-600">{errors.bathrooms}</p>
              )}
            </div>
          </div>
        )}

        {/* Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Superficie (m²) *
          </label>
          <input
            type="number"
            value={formData.area}
            onChange={(e) => handleInputChange("area", e.target.value ? Number(e.target.value) : "")}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.area ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="120"
            min="0"
          />
          {errors.area && (
            <p className="mt-1 text-sm text-red-600">{errors.area}</p>
          )}
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Características
          </label>
          <input
            type="text"
            value={formData.features}
            onChange={(e) => handleInputChange("features", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: Garage, Jardín, Piscina, Asador (separados por comas)"
          />
          <p className="mt-1 text-sm text-gray-500">
            Separa las características con comas
          </p>
        </div>
      </div>
    </div>
  );
}