// Client-safe Cloudinary utility functions
export interface CloudinaryOptions {
  width?: number
  height?: number
  crop?: string
  quality?: string
  format?: string
  gravity?: string
  fetch_format?: string
}

export function getOptimizedImageUrl(imageId: string, options: CloudinaryOptions = {}): string {
  if (!imageId) return ""

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName) return ""

  // If it's already a full Cloudinary URL, extract the public_id
  if (imageId.includes('cloudinary.com')) {
    const urlParts = imageId.split('/')
    const uploadIndex = urlParts.findIndex(part => part === 'upload')
    if (uploadIndex !== -1 && urlParts.length > uploadIndex + 1) {
      // Extract public_id (everything after version or transformations)
      const afterUpload = urlParts.slice(uploadIndex + 1)
      // Skip version if present (starts with 'v' followed by numbers)
      const startIndex = afterUpload[0]?.match(/^v\d+$/) ? 1 : 0
      const publicId = afterUpload.slice(startIndex).join('/')
      return getOptimizedImageUrl(publicId, options)
    }
  }

  // If it's already an HTTP URL (not Cloudinary), return as is
  if (imageId.startsWith('http://') || imageId.startsWith('https://')) {
    return imageId
  }

  const { width = 800, height = 600, crop = "fill", quality = "auto", format = "auto", gravity = "center" } = options

  const transformations = [
    `w_${width}`,
    `h_${height}`,
    `c_${crop}`,
    `q_${quality}`,
    `f_${format}`,
    `g_${gravity}`,
  ].join(",")

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${imageId}`
}

export function getVideoUrl(publicId: string, options: CloudinaryOptions = {}): string {
  if (!publicId) return ""

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName) return ""

  const { width = 800, height = 600, crop = "fill", quality = "auto", format = "mp4" } = options

  const transformations = [`w_${width}`, `h_${height}`, `c_${crop}`, `q_${quality}`, `f_${format}`].join(",")

  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformations}/${publicId}`
}

// Helper function to process image arrays from different sources
export function processPropertyImages(images: string[] | null | undefined): string[] {
  if (!images || !Array.isArray(images)) return []
  
  return images.filter(img => img && typeof img === 'string' && img.trim() !== '')
}

// Helper function to get the first valid image from a property
export function getPropertyMainImage(images: string[] | null | undefined, fallback?: string): string {
  const processedImages = processPropertyImages(images)
  return processedImages.length > 0 ? processedImages[0] : (fallback || "gustavo-papasergio-emoKYb99CRI-unsplash_w6gipy")
}
