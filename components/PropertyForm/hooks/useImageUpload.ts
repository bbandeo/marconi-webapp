import { useState } from 'react';

export const useImageUpload = (initialImages: string[] = []) => {
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>(initialImages);

  const handleImageUpload = async (files: FileList) => {
    setImageUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Here would go the real Cloudinary upload logic
        // const response = await uploadToCloudinary(file)
        // return response.secure_url

        // For now, simulate with local URL
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImagePreview(prev => [...prev, ...uploadedUrls]);
      
      return uploadedUrls;
    } catch (error) {
      console.error("Error uploading images:", error);
      return [];
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  return {
    imagePreview,
    imageUploading,
    handleImageUpload,
    removeImage
  };
};