import { MapPin } from "lucide-react";
import { PropertyFormData, FormErrors } from "../types";
import { PROPERTY_FORM_CONFIG } from "../config";

interface LocationSectionProps {
  formData: PropertyFormData;
  errors: FormErrors;
  handleInputChange: (field: keyof PropertyFormData, value: any) => void;
}

export default function LocationSection({ 
  formData, 
  errors, 
  handleInputChange 
}: LocationSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center space-x-2 mb-6">
        <MapPin className="h-5 w-5 text-red-600" />
        <h2 className="text-lg font-semibold text-gray-900">Ubicación</h2>
      </div>

      <div className="space-y-6">
        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.address ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Ej: San Martín 1234"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        {/* Neighborhood */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Barrio *
          </label>
          <select
            value={formData.neighborhood}
            onChange={(e) => handleInputChange("neighborhood", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {PROPERTY_FORM_CONFIG.neighborhoods.map((neighborhood) => (
              <option key={neighborhood} value={neighborhood}>
                {neighborhood}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}