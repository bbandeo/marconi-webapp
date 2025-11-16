"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Users, Building2, Menu, ExternalLink, BarChart3, UserCircle } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: BarChart3 },
  { name: "Propiedades", href: "/admin/properties", icon: Building2 },
  { name: "Contactos", href: "/admin/contacts", icon: Users },
  { name: "Agentes", href: "/admin/agents", icon: UserCircle },
  // { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gray-800 border-r border-gray-700">
          <div className="flex items-center px-4 py-6">
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive ? "bg-brand-orange text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              {/* Mobile menu */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 bg-gray-800 border-gray-700">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center px-4 py-6">
                      <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                    </div>
                    <nav className="flex-1 px-4 space-y-2">
                      {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              isActive
                                ? "bg-brand-orange text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                            }`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                          </Link>
                        )
                      })}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>

              <h2 className="ml-4 text-lg font-semibold text-white lg:ml-0">
                {navigation.find((item) => item.href === pathname)?.name || "Admin"}
              </h2>
            </div>
            <Link
              href="/"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Sitio
            </Link>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
