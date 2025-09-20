"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PropertyService } from "@/services/properties";
import { type Property, PROPERTY_TYPE_MAP, OPERATION_TYPE_MAP, STATUS_MAP } from "@/lib/supabase";
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from "lucide-react";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    property_type: "",
    operation_type: "",
    bedrooms: "",
    bathrooms: "",
    area_m2: "",
    address: "",
    neighborhood: "",
    city: "Ciudad",
    province: "Provincia",
    images: [] as string[],
    features: [] as string[],
    featured: false,
    status: "available"
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const result = await PropertyService.getProperties({ limit: 50 });
      setProperties(result.properties);
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title,
      description: property.description || "",
      price: property.price.toString(),
      property_type: property.property_type,
      operation_type: property.operation_type,
      bedrooms: property.bedrooms?.toString() || "",
      bathrooms: property.bathrooms?.toString() || "",
      area_m2: property.area_m2?.toString() || "",
      address: property.address || "",
      neighborhood: property.neighborhood || "",
      city: property.city,
      province: property.province,
      images: property.images || [],
      features: property.features || [],
      featured: property.featured,
      status: property.status
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const propertyData = {
        title: formData.title,
        description: formData.description || null,
        price: parseFloat(formData.price),
        property_type: formData.property_type,
        operation_type: formData.operation_type,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        area_m2: formData.area_m2 ? parseFloat(formData.area_m2) : null,
        address: formData.address || null,
        neighborhood: formData.neighborhood || null,
        city: formData.city,
        province: formData.province,
        images: formData.images,
        features: formData.features,
        featured: formData.featured,
        status: formData.status
      };

      if (editingProperty) {
        await PropertyService.updateProperty(editingProperty.id, propertyData);
      } else {
        await PropertyService.createProperty(propertyData);
      }

      setShowForm(false);
      setEditingProperty(null);
      resetForm();
      loadProperties();
    } catch (error) {
      console.error("Error saving property:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta propiedad?")) {
      try {
        await PropertyService.deleteProperty(id);
        loadProperties();
      } catch (error) {
        console.error("Error deleting property:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      property_type: "",
      operation_type: "",
      bedrooms: "",
      bathrooms: "",
      area_m2: "",
      address: "",
      neighborhood: "",
      city: "Ciudad",
      province: "Provincia",
      images: [],
      features: [],
      featured: false,
      status: "available"
    });
  };

  const handleNewProperty = () => {
    resetForm();
    setEditingProperty(null);
    setShowForm(true);
  };

  if (isLoading) {
    return <div className="p-6">Cargando propiedades...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Propiedades</h1>
        <Button onClick={handleNewProperty} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Nueva Propiedad
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingProperty ? "Editar Propiedad" : "Nueva Propiedad"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título de la propiedad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Precio</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Precio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Propiedad</label>
                <Select value={formData.property_type} onValueChange={(value) => setFormData({ ...formData, property_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROPERTY_TYPE_MAP).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Operación</label>
                <Select value={formData.operation_type} onValueChange={(value) => setFormData({ ...formData, operation_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar operación" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(OPERATION_TYPE_MAP).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Dormitorios</label>
                <Input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  placeholder="Número de dormitorios"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Baños</label>
                <Input
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  placeholder="Número de baños"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Área (m²)</label>
                <Input
                  type="number"
                  value={formData.area_m2}
                  onChange={(e) => setFormData({ ...formData, area_m2: e.target.value })}
                  placeholder="Área en metros cuadrados"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_MAP).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Dirección</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Dirección completa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Barrio</label>
              <Input
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                placeholder="Barrio"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la propiedad"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
              />
              <label htmlFor="featured" className="text-sm font-medium">Propiedad Destacada</label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave}>
                {editingProperty ? "Actualizar" : "Crear"} Propiedad
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {properties.map((property) => (
          <Card key={property.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{property.title}</h3>
                    {property.featured && <Badge variant="secondary">Destacada</Badge>}
                    <Badge variant="outline">{STATUS_MAP[property.status as keyof typeof STATUS_MAP]}</Badge>
                  </div>
                  <p className="text-gray-600 mb-2">
                    {PROPERTY_TYPE_MAP[property.property_type as keyof typeof PROPERTY_TYPE_MAP]} • {OPERATION_TYPE_MAP[property.operation_type as keyof typeof OPERATION_TYPE_MAP]}
                  </p>
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    ${property.price.toLocaleString()} {property.currency}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {property.bedrooms && <span>{property.bedrooms} dorm.</span>}
                    {property.bathrooms && <span>{property.bathrooms} baños</span>}
                    {property.area_m2 && <span>{property.area_m2} m²</span>}
                    <span className="flex items-center gap-1">
                      <EyeIcon className="h-4 w-4" />
                      {property.views} vistas
                    </span>
                  </div>
                  {property.address && (
                    <p className="text-sm text-gray-600 mt-1">{property.address}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(property)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(property.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {properties.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">No hay propiedades registradas</p>
            <Button onClick={handleNewProperty} className="mt-4">
              <PlusIcon className="h-4 w-4 mr-2" />
              Crear primera propiedad
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}