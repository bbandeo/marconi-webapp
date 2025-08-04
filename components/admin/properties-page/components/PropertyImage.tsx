import { useState } from "react";
import { getOptimizedImageUrl } from "@/lib/cloudinary";

interface PropertyImageProps {
  images: string[];
  title: string;
}

export default function PropertyImage({ images, title }: PropertyImageProps) {
  const [imageError, setImageError] = useState(false);

  const mainImage = images && images.length > 0 ? images[0] : null;

  if (!mainImage || imageError) {
    return (
      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-400 text-xs">Sin imagen</span>
      </div>
    );
  }

  return (
    <img
      src={getOptimizedImageUrl(mainImage, {
        width: 64,
        height: 64,
        crop: "fill",
        quality: "auto",
        format: "auto",
      }) || "/placeholder.svg"}
      alt={title}
      className="w-16 h-16 object-cover rounded-lg"
      onError={() => setImageError(true)}
    />
  );
}