import { Save, X, Trash2 } from "lucide-react";

interface FormActionsSectionProps {
  mode: "create" | "edit";
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleDelete?: () => void;
  onCancel?: () => void;
}

export default function FormActionsSection({ 
  mode, 
  loading, 
  handleSubmit, 
  handleDelete,
  onCancel 
}: FormActionsSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
      
      <div className="space-y-3">
        {/* Save Button */}
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>
            {loading 
              ? "Guardando..." 
              : mode === "create" 
                ? "Crear Propiedad" 
                : "Actualizar Propiedad"
            }
          </span>
        </button>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
        >
          <X className="h-4 w-4" />
          <span>Cancelar</span>
        </button>

        {/* Delete Button (Edit Mode Only) */}
        {mode === "edit" && handleDelete && (
          <>
            <div className="border-t pt-3 mt-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Eliminar Propiedad</span>
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-gray-500">
          * Los campos marcados son obligatorios
        </p>
      </div>
    </div>
  );
}