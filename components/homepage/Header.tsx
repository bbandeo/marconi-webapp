"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"

interface HeaderProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  handleSearch: () => void
}

export default function Header({ searchTerm, setSearchTerm, handleSearch }: HeaderProps) {
  return (
    <header className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Image
                src="/assets/logos/logocasa.svg"
                alt="Logo Casa"
                width={32}
                height={32}
                className="h-8 w-8 md:h-10 md:w-10 group-hover:scale-110 transition-transform duration-300"
                priority
              />
              <div className="absolute -inset-2 bg-gradient-to-r from-brand-orange/20 to-orange-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <Image
              src="/assets/logos/marconi_title.svg"
              alt="Marconi Inmobiliaria"
              width={140}
              height={45}
              className="h-8 md:h-10 w-auto group-hover:scale-105 transition-transform duration-300"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {['PROPIEDADES', 'AGENTES', 'CONTACTO'].map((item) => (
              <Link 
                key={item}
                href={`/${item.toLowerCase()}`} 
                className="text-gray-300 hover:text-white transition-all duration-300 relative group px-3 py-2 rounded-lg hover:bg-white/5 backdrop-blur-sm"
              >
                <span className="relative z-10 font-medium tracking-wide">{item}</span>
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-brand-orange to-orange-500 group-hover:w-full group-hover:left-0 transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Mobile Search Bar */}
          <div className="md:hidden flex-1 max-w-xs ml-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar propiedades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 h-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 text-sm focus:border-brand-orange"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}