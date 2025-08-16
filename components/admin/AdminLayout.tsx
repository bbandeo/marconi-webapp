"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Users, Building2, Settings, Menu, ExternalLink, BarChart3, ChevronDown, Star } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: BarChart3 },
  { 
    name: "Propiedades", 
    href: "/admin/properties", 
    icon: Building2,
    submenu: [
      { name: "Listado", href: "/admin/properties", icon: Building2 },
      { name: "Prioridades", href: "/admin/properties/priorities", icon: Star },
      { name: "Nueva Propiedad", href: "/admin/properties/new", icon: Building2 },
    ]
  },
  { name: "Contactos", href: "/admin/contacts", icon: Users },
  { name: "Configuración", href: "/admin/settings", icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [propertiesOpen, setPropertiesOpen] = useState(
    pathname.startsWith("/admin/properties")
  )

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
              if (item.submenu) {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Collapsible
                    key={item.name}
                    open={propertiesOpen}
                    onOpenChange={setPropertiesOpen}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div
                        className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center">
                          <item.icon className="w-5 h-5 mr-3" />
                          {item.name}
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            propertiesOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-1 ml-4 space-y-1">
                      {item.submenu.map((subItem) => {
                        const isSubActive = pathname === subItem.href
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                              isSubActive
                                ? "bg-brand-orange text-white"
                                : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                            }`}
                          >
                            <subItem.icon className="w-4 h-4 mr-2" />
                            {subItem.name}
                          </Link>
                        )
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                )
              } else {
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
              }
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
                        if (item.submenu) {
                          const isActive = pathname.startsWith(item.href)
                          return (
                            <Collapsible
                              key={item.name}
                              open={propertiesOpen}
                              onOpenChange={setPropertiesOpen}
                            >
                              <CollapsibleTrigger className="w-full">
                                <div
                                  className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                  }`}
                                >
                                  <div className="flex items-center">
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                  </div>
                                  <ChevronDown
                                    className={`w-4 h-4 transition-transform ${
                                      propertiesOpen ? "rotate-180" : ""
                                    }`}
                                  />
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-1 ml-4 space-y-1">
                                {item.submenu.map((subItem) => {
                                  const isSubActive = pathname === subItem.href
                                  return (
                                    <Link
                                      key={subItem.name}
                                      href={subItem.href}
                                      className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                                        isSubActive
                                          ? "bg-brand-orange text-white"
                                          : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                                      }`}
                                      onClick={() => setSidebarOpen(false)}
                                    >
                                      <subItem.icon className="w-4 h-4 mr-2" />
                                      {subItem.name}
                                    </Link>
                                  )
                                })}
                              </CollapsibleContent>
                            </Collapsible>
                          )
                        } else {
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
                        }
                      })}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>

              <h2 className="ml-4 text-lg font-semibold text-white lg:ml-0">
                {pathname === "/admin/properties/priorities" 
                  ? "Editor de Prioridades" 
                  : navigation.find((item) => {
                      if (item.submenu) {
                        return item.submenu.some(sub => sub.href === pathname)
                      }
                      return item.href === pathname
                    })?.name || 
                    navigation.find((item) => item.submenu?.some(sub => sub.href === pathname))?.submenu?.find(sub => sub.href === pathname)?.name ||
                    "Admin"}
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
