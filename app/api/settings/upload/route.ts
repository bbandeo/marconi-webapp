import { NextRequest, NextResponse } from 'next/server'
import { uploadToCloudinary } from '@/lib/cloudinary-server'
import { SettingsService } from '@/services/settings'

// POST /api/settings/upload - Upload de logos y branding
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'logo', 'logo_dark', 'favicon'

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided'
        },
        { status: 400 }
      )
    }

    if (!type || !['logo', 'logo_dark', 'favicon'].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid type. Must be: logo, logo_dark, or favicon'
        },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type. Allowed: PNG, JPG, JPEG, SVG, WEBP'
        },
        { status: 400 }
      )
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: 'File too large. Maximum size: 5MB'
        },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Configuración específica por tipo
    const uploadOptions = {
      folder: `marconi/branding/${type}`,
      public_id: `marconi_${type}_${Date.now()}`,
      overwrite: true,
      invalidate: true,
      transformation: type === 'favicon'
        ? [{ width: 32, height: 32, crop: 'fill' }]
        : [{ width: 500, height: 500, crop: 'limit' }]
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, uploadOptions)

    // Actualizar configuraciones con la nueva URL
    const updateData = {
      [`${type}_url`]: result.secure_url
    }

    await SettingsService.updateBranding(updateData)

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        type,
        size: file.size,
        format: result.format
      },
      message: `${type} uploaded successfully`
    })

  } catch (error) {
    console.error('Settings upload error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Upload failed'
      },
      { status: 500 }
    )
  }
}