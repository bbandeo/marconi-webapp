"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  showMobileSearch?: boolean;
}

export default function Header({ showMobileSearch = true }: HeaderProps) {
  const pathname = usePathname();

  const isActivePage = (path: string) => {
    return pathname === path;
  };

  const getLinkClassName = (path: string) => {
    if (isActivePage(path)) {
      return "text-orange-500 border-b-2 border-orange-500 pb-1 font-medium transition-colors";
    }
    return "text-gray-300 hover:text-white transition-colors";
  };

  // Special case for contacto page - uses brand-orange instead of orange-500
  const getContactLinkClassName = () => {
    if (isActivePage("/contacto")) {
      return "text-brand-orange font-semibold";
    }
    return "text-gray-300 hover:text-white transition-colors";
  };

  // Special case for agentes page - uses brand-orange instead of orange-500
  const getAgentesLinkClassName = () => {
    if (isActivePage("/agentes")) {
      return "text-brand-orange font-semibold";
    }
    return "text-gray-300 hover:text-white transition-colors";
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 shadow-md">
      <div className="w-full px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/assets/logos/marconi_header_orangewhite.png"
              alt="Marconi Inmobiliaria"
              width={140}
              height={45}
              className="h-8 md:h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/propiedades"
              className={getLinkClassName("/propiedades")}
            >
              PROPIEDADES
            </Link>
            <Link
              href="/agentes"
              className={getAgentesLinkClassName()}
            >
              AGENTES
            </Link>
            <Link
              href="/contacto"
              className={getContactLinkClassName()}
            >
              CONTACTO
            </Link>
          </nav>

          {/* Mobile Search Bar */}
          {showMobileSearch && (
            <div className="md:hidden flex-1 max-w-xs ml-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar propiedades..."
                  className="pl-10 h-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 text-sm focus:border-brand-orange"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Decorative divider line */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-lg"></div>
    </header>
  );
}