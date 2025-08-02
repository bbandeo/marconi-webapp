import { type NextRequest, NextResponse } from "next/server"
import { uploadToCloudinary } from "@/lib/cloudinary-server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      return uploadToCloudinary(buffer, {
        folder: "marconi/properties",
      })
    })

    const results = await Promise.all(uploadPromises)

    return NextResponse.json({ uploads: results })
  } catch (error) {
    console.error("Multiple upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
