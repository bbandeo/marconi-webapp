'use client'

import { useState } from 'react'
import { Save, User, Bell, Shield, Globe } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    name: 'Floriana Marconi',
    email: 'floriana@marconiinmobiliaria.com',
    phone: '+54 9 3482 308100',
    company: 'Marconi Inmobiliaria',
    address: 'Belgrano 123, Reconquista, Santa Fe',
    notifications: {
      newLeads: true,
      propertyViews: false,
      weeklyReports: true
    }
  })

  const handleSave = () => {
    // Aquí iría la lógica para guardar configuraciones
    console.log('Saving settings:', settings)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600">Administra tu perfil y preferencias</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <input 
                    type="text" 
                    value={settings.name}
                    onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={settings.email}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input 
                  type="tel" 
                  value={settings.phone}
                  onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
            </div>
            
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {key === 'newLeads' && 'Nuevos leads'}
                    {key === 'propertyViews' && 'Vistas de propiedades'}
                    {key === 'weeklyReports' && 'Reportes semanales'}
                  </span>
                  <input 
                    type="checkbox" 
                    checked={value}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, [key]: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Sidebar */}
        <div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h2>
            
            <div className="space-y-3">
              <button 
                onClick={handleSave}
                className="w-full flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </button>
              
              <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Cambiar Contraseña
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
