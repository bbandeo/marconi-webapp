import { NextRequest, NextResponse } from 'next/server'
import { SettingsService } from '@/services/settings'
import { SiteSettingsInput } from '@/types/settings'

// GET /api/settings - Obtener configuraciones
export async function GET() {
  try {
    const settings = await SettingsService.getSettingsWithDefaults()

    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Settings API GET error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch settings'
      },
      { status: 500 }
    )
  }
}

// PATCH /api/settings - Actualizar configuraciones
export async function PATCH(request: NextRequest) {
  try {
    const body: SiteSettingsInput = await request.json()

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No data provided for update'
        },
        { status: 400 }
      )
    }

    const updatedSettings = await SettingsService.updateSettings(body)

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: 'Settings updated successfully'
    })
  } catch (error) {
    console.error('Settings API PATCH error:', error)

    // Manejar errores de validación
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update settings'
      },
      { status: 500 }
    )
  }
}