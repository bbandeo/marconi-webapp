import { Upload, Camera, Trash2 } from "lucide-react";

interface ImageUploadSectionProps {
  imagePreview: string[];
  imageUploading: boolean;
  handleImageUpload: (files: FileList) => Promise<string[]>;
  removeImage: (index: number) => void;
  onImagesChange?: (images: string[]) => void;
}

export default function ImageUploadSection({ 
  imagePreview, 
  imageUploading, 
  handleImageUpload, 
  removeImage,
  onImagesChange 
}: ImageUploadSectionProps) {
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const uploadedUrls = await handleImageUpload(files);
      if (onImagesChange) {
        onImagesChange([...imagePreview, ...uploadedUrls]);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    removeImage(index);
    if (onImagesChange) {
      const newImages = imagePreview.filter((_, i) => i !== index);
      onImagesChange(newImages);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Camera className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Imágenes</h3>
      </div>

      {/* Upload Area */}
      <div className="mb-4">
        <label className="block">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {imageUploading ? "Subiendo..." : "Arrastra archivos aquí o haz clic para seleccionar"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG hasta 10MB
            </p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={imageUploading}
          />
        </label>
      </div>

      {/* Image Preview Grid */}
      {imagePreview.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {imagePreview.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-1 left-1 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {imagePreview.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No hay imágenes cargadas
        </p>
      )}
    </div>
  );
}