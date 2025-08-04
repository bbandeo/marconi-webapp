import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface PropertyFormHeaderProps {
  mode: "create" | "edit";
}

export default function PropertyFormHeader({ mode }: PropertyFormHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver</span>
          </button>
          <div className="h-6 border-l border-gray-300" />
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === "create" ? "Nueva Propiedad" : "Editar Propiedad"}
          </h1>
        </div>
      </div>
      <p className="mt-2 text-gray-600">
        {mode === "create" 
          ? "Completa la información para agregar una nueva propiedad al sistema."
          : "Modifica los campos necesarios y guarda los cambios."
        }
      </p>
    </div>
  );
}