"use client";

import { useRouter } from "next/navigation";
import { PropertyFormProps } from "./types";
import { usePropertyForm } from "./hooks/usePropertyForm";
import { useImageUpload } from "./hooks/useImageUpload";

// Section Components
import PropertyFormHeader from "./sections/PropertyFormHeader";
import BasicInformationSection from "./sections/BasicInformationSection";
import PropertyDetailsSection from "./sections/PropertyDetailsSection";
import LocationSection from "./sections/LocationSection";
import ConfigurationSection from "./sections/ConfigurationSection";
import ImageUploadSection from "./sections/ImageUploadSection";
import FormActionsSection from "./sections/FormActionsSection";

export default function PropertyForm({ property, mode = "create" }: PropertyFormProps) {
  const router = useRouter();
  
  // Custom hooks for form logic
  const formHook = usePropertyForm(property, mode);
  const imageHook = useImageUpload(property?.images || []);

  const handleCancel = () => {
    router.push("/admin/properties");
  };

  const handleImagesChange = (images: string[]) => {
    // Update form data with new images
    formHook.handleInputChange("images", images);
  };

  return (
    <form onSubmit={formHook.handleSubmit} className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <PropertyFormHeader mode={mode} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          <BasicInformationSection 
            formData={formHook.formData}
            errors={formHook.errors}
            handleInputChange={formHook.handleInputChange}
          />
          
          <PropertyDetailsSection 
            formData={formHook.formData}
            errors={formHook.errors}
            handleInputChange={formHook.handleInputChange}
          />
          
          <LocationSection 
            formData={formHook.formData}
            errors={formHook.errors}
            handleInputChange={formHook.handleInputChange}
          />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <ConfigurationSection 
            formData={formHook.formData}
            handleInputChange={formHook.handleInputChange}
          />
          
          <ImageUploadSection 
            imagePreview={imageHook.imagePreview}
            imageUploading={imageHook.imageUploading}
            handleImageUpload={imageHook.handleImageUpload}
            removeImage={imageHook.removeImage}
            onImagesChange={handleImagesChange}
          />
          
          <FormActionsSection 
            mode={mode}
            loading={formHook.loading}
            handleSubmit={formHook.handleSubmit}
            handleDelete={mode === "edit" ? formHook.handleDelete : undefined}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </form>
  );
}