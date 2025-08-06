import { v2 as cloudinary } from "cloudinary"

// Server-side configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

// Server-side upload function
export const uploadToCloudinary = async (
  file: string | Buffer,
  options: {
    folder?: string
    transformation?: any[]
    public_id?: string
  } = {},
) => {
  try {
    // Convert Buffer to base64 data URI if needed
    let uploadSource: string
    if (Buffer.isBuffer(file)) {
      uploadSource = `data:image/png;base64,${file.toString('base64')}`
    } else {
      uploadSource = file
    }

    const result = await cloudinary.uploader.upload(uploadSource, {
      folder: options.folder || "marconi/properties",
      transformation: options.transformation || [
        { width: 1200, height: 800, crop: "fill", quality: "auto" },
        { format: "auto" },
      ],
      public_id: options.public_id,
      overwrite: true,
      resource_type: "auto",
    })

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    throw new Error("Failed to upload image")
  }
}

// Server-side delete function
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error)
    throw new Error("Failed to delete image")
  }
}
