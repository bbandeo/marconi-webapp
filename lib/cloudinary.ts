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

export function getOptimizedImageUrl(publicId: string, options: CloudinaryOptions = {}): string {
  if (!publicId) return ""

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName) return ""

  const { width = 800, height = 600, crop = "fill", quality = "auto", format = "auto", gravity = "center" } = options

  const transformations = [
    `w_${width}`,
    `h_${height}`,
    `c_${crop}`,
    `q_${quality}`,
    `f_${format}`,
    `g_${gravity}`,
  ].join(",")

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`
}

export function getVideoUrl(publicId: string, options: CloudinaryOptions = {}): string {
  if (!publicId) return ""

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName) return ""

  const { width = 800, height = 600, crop = "fill", quality = "auto", format = "mp4" } = options

  const transformations = [`w_${width}`, `h_${height}`, `c_${crop}`, `q_${quality}`, `f_${format}`].join(",")

  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformations}/${publicId}`
}
