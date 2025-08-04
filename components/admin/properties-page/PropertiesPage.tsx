"use client";

import { useState, useMemo } from "react";
import { usePropertiesData } from "./hooks/usePropertiesData";
import { filterProperties } from "./utils";

// Components
import PropertiesPageHeader from "./components/PropertiesPageHeader";
import PropertiesStats from "./components/PropertiesStats";
import PropertiesFilters from "./components/PropertiesFilters";
import PropertiesTable from "./components/PropertiesTable";
import PropertiesLoadingState from "./components/PropertiesLoadingState";

export default function PropertiesPage() {
  // Data management
  const {
    properties,
    loading,
    error,
    toggleFeatured,
    deleteProperty,
    getStats,
  } = usePropertiesData();

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return filterProperties(properties, searchTerm, statusFilter, typeFilter);
  }, [properties, searchTerm, statusFilter, typeFilter]);

  // Calculate stats
  const stats = useMemo(() => getStats(), [properties]);

  if (loading) {
    return (
      <div className="space-y-8">
        <PropertiesPageHeader />
        <PropertiesLoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <PropertiesPageHeader />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PropertiesPageHeader />
      
      <PropertiesStats stats={stats} />
      
      <PropertiesFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
      />
      
      <PropertiesTable
        properties={filteredProperties}
        onToggleFeatured={toggleFeatured}
        onDeleteProperty={deleteProperty}
      />
    </div>
  );
}