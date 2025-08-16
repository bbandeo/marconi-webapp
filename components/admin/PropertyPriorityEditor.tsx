"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Star, Home, MapPin, Bed, Bath, Square } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
import { PropertyService } from "@/services/properties";
import type { Property } from "@/lib/supabase";

interface PropertyWithPriority extends Property {
  priority?: number;
}

export default function PropertyPriorityEditor() {
  const [properties, setProperties] = useState<PropertyWithPriority[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const result = await PropertyService.getProperties({
        featured: true,
        limit: 50,
        sort_by: "priority",
        sort_order: "asc"
      });
      
      // Sort by priority if exists, otherwise by creation date
      const sortedProperties = result.properties.sort((a, b) => {
        if (a.priority !== undefined && b.priority !== undefined) {
          return a.priority - b.priority;
        }
        return 0;
      });
      
      setProperties(sortedProperties);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(properties);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update priorities based on new order
    const updatedItems = items.map((item, index) => ({
      ...item,
      priority: index + 1
    }));

    setProperties(updatedItems);
  };

  const savePriorities = async () => {
    try {
      setSaving(true);
      
      // Update each property's priority
      const updatePromises = properties.map((property, index) => 
        fetch(`/api/properties/${property.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            priority: index + 1
          })
        })
      );

      await Promise.all(updatePromises);
      
      // Show success message
      alert("Prioridades actualizadas exitosamente");
    } catch (error) {
      console.error("Error saving priorities:", error);
      alert("Error al guardar las prioridades");
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const PropertyThumbnail = ({ images, title }: { images: string[], title: string }) => {
    const [imageError, setImageError] = useState(false);
    const firstImage = images && images.length > 0 ? images[0] : null;

    if (!firstImage || imageError) {
      return (
        <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <Home className="w-8 h-8 text-gray-400" />
        </div>
      );
    }

    return (
      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
        <img
          src={
            getOptimizedImageUrl(firstImage, {
              width: 96,
              height: 96,
              crop: "fill"
            }) || "/placeholder.svg"
          }
          alt={title}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-64 bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Editor de Prioridades
          </h1>
          <p className="text-gray-300">
            Arrastra y suelta las propiedades para cambiar su orden de prioridad
          </p>
        </div>
        <Button
          onClick={savePriorities}
          disabled={saving}
          className="bg-brand-orange hover:bg-brand-orange/90 text-white"
        >
          {saving ? "Guardando..." : "Guardar Prioridades"}
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <Star className="w-4 h-4 text-brand-orange" />
            <span>Las propiedades con mayor prioridad aparecerán primero en la página principal</span>
          </div>
        </CardContent>
      </Card>

      {/* Properties List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Propiedades Destacadas</CardTitle>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No hay propiedades destacadas
              </h3>
              <p className="text-gray-400">
                Marca algunas propiedades como destacadas desde el listado de propiedades
              </p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="properties">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {properties.map((property, index) => (
                      <Draggable
                        key={property.id}
                        draggableId={property.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-gray-700 rounded-lg p-4 transition-all ${
                              snapshot.isDragging ? "shadow-lg ring-2 ring-brand-orange" : ""
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-move text-gray-400 hover:text-white"
                              >
                                <GripVertical className="w-5 h-5" />
                              </div>

                              {/* Priority Number */}
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {index + 1}
                                </div>
                              </div>

                              {/* Property Thumbnail */}
                              <PropertyThumbnail
                                images={property.images || []}
                                title={property.title}
                              />

                              {/* Property Info */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-white truncate">
                                  {property.title}
                                </h3>
                                <div className="flex items-center text-sm text-gray-400 space-x-4 mt-1">
                                  <span className="flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {property.neighborhood || property.city}
                                  </span>
                                  {property.bedrooms && (
                                    <span className="flex items-center">
                                      <Bed className="w-3 h-3 mr-1" />
                                      {property.bedrooms}
                                    </span>
                                  )}
                                  {property.bathrooms && (
                                    <span className="flex items-center">
                                      <Bath className="w-3 h-3 mr-1" />
                                      {property.bathrooms}
                                    </span>
                                  )}
                                  {property.area_m2 && (
                                    <span className="flex items-center">
                                      <Square className="w-3 h-3 mr-1" />
                                      {property.area_m2}m²
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Price */}
                              <div className="text-right flex-shrink-0">
                                <p className="font-semibold text-white">
                                  {formatPrice(property.price)}
                                </p>
                                <Badge className="bg-green-500 text-white text-xs">
                                  {property.operation_type === "venta" ? "Venta" : "Alquiler"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}