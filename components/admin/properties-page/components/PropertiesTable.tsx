import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Edit, Trash2, MoreHorizontal, MapPin, Bed, Bath, Square, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Property } from "@/lib/supabase";
import { formatPrice, getPropertyTypeLabel, getOperationTypeLabel, getStatusColor, getStatusLabel } from "../utils";
import PropertyImage from "./PropertyImage";

interface PropertyWithStats extends Property {
  views?: number;
  leads?: number;
}

interface PropertiesTableProps {
  properties: PropertyWithStats[];
  onToggleFeatured: (propertyId: number, featured: boolean) => Promise<boolean>;
  onDeleteProperty: (propertyId: number) => Promise<boolean>;
}

export default function PropertiesTable({
  properties,
  onToggleFeatured,
  onDeleteProperty,
}: PropertiesTableProps) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const handleToggleFeatured = async (property: PropertyWithStats) => {
    setActionLoading(property.id);
    await onToggleFeatured(property.id, !property.featured);
    setActionLoading(null);
  };

  const handleDeleteProperty = async (propertyId: number) => {
    setActionLoading(propertyId);
    await onDeleteProperty(propertyId);
    setActionLoading(null);
  };

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay propiedades disponibles
          </h3>
          <p className="text-gray-500 mb-6">
            Comienza agregando tu primera propiedad al sistema.
          </p>
          <Button
            onClick={() => router.push("/admin/properties/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Agregar Propiedad
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propiedad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo / Operación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Detalles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estadísticas
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-4">
                    <PropertyImage images={property.images || []} title={property.title} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {property.title}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {property.address}, {property.neighborhood}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getPropertyTypeLabel(property.property_type)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {getOperationTypeLabel(property.operation_type)}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatPrice(property.price, property.currency)}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {property.bedrooms && (
                      <div className="flex items-center">
                        <Bed className="h-3 w-3 mr-1" />
                        {property.bedrooms}
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center">
                        <Bath className="h-3 w-3 mr-1" />
                        {property.bathrooms}
                      </div>
                    )}
                    {property.area_m2 && (
                      <div className="flex items-center">
                        <Square className="h-3 w-3 mr-1" />
                        {property.area_m2}m²
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getStatusColor(property.status)}>
                    {getStatusLabel(property.status)}
                  </Badge>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {property.views || 0}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFeatured(property)}
                      disabled={actionLoading === property.id}
                      className={property.featured ? "text-yellow-600" : "text-gray-400"}
                    >
                      <Star className={`h-4 w-4 ${property.featured ? "fill-current" : ""}`} />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/properties/${property.id}/edit`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteProperty(property.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={actionLoading === property.id}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}