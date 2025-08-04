import { Plus, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PropertiesPageHeader() {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="flex items-center space-x-3">
        <Home className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propiedades</h1>
          <p className="text-gray-600">Gestiona el inventario de propiedades</p>
        </div>
      </div>
      
      <Button 
        onClick={() => router.push("/admin/properties/new")}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Nueva Propiedad
      </Button>
    </div>
  );
}