"use client";

import { useState, useEffect } from "react";
import { Search, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIsClient } from "@/hooks/use-is-client";

interface HeaderProps {
  showMobileSearch?: boolean;
}

export default function Header({ showMobileSearch = true }: HeaderProps) {
  const pathname = usePathname();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isClient = useIsClient();

  const isActivePage = (path: string) => {
    return pathname === path;
  };

  const getLinkClassName = (path: string) => {
    if (isActivePage(path)) {
      return "accent-premium border-b-2 border-vibrant-orange pb-1 font-medium transition-colors";
    }
    return "text-bone-white/80 hover:text-bone-white transition-colors";
  };

  // Special case for contacto page - uses vibrant orange
  const getContactLinkClassName = () => {
    if (isActivePage("/contacto")) {
      return "accent-premium font-semibold";
    }
    return "text-bone-white/80 hover:text-bone-white transition-colors";
  };

  // Special case for agentes page - uses vibrant orange
  const getAgentesLinkClassName = () => {
    if (isActivePage("/agentes")) {
      return "accent-premium font-semibold";
    }
    return "text-bone-white/80 hover:text-bone-white transition-colors";
  };

  // Scroll progress tracking
  useEffect(() => {
    if (!isClient) {
      return;
    }
    const handleScroll = () => {
      const winScroll = window.scrollY || document.documentElement.scrollTop;
      const height =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? (winScroll / height) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    // Ejecutar una vez para inicializar en el primer render del cliente
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isClient]);

  return (
    <header className="bg-premium-main border-b border-support-gray/20 sticky top-0 z-50 shadow-xl">
      {/* Scroll Progress Bar - PREMIUM */}
      <div
        aria-hidden
        className="absolute top-0 left-0 h-1 z-[60] pointer-events-none"
        style={{ width: `${scrollProgress}%` }}
      >
        <div className="w-full h-full bg-gradient-to-r from-transparent via-vibrant-orange to-transparent shadow-lg" />
      </div>
      
      <div className="w-full container-premium">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/assets/logos/marconi_header_orangewhite.png"
              alt="Marconi Inmobiliaria"
              width={140}
              height={45}
              className="h-8 md:h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation - PREMIUM SPACING */}
          <nav className="hidden md:flex items-center space-x-12">
            <Link
              href="/propiedades"
              className={getLinkClassName("/propiedades")}
            >
              <span className="body-md font-medium tracking-wide">
                PROPIEDADES
              </span>
            </Link>
            <Link
              href="/agentes"
              className={getAgentesLinkClassName()}
            >
              <span className="body-md font-medium tracking-wide">
                AGENTES
              </span>
            </Link>
            <Link
              href="/contacto"
              className={getContactLinkClassName()}
            >
              <span className="body-md font-medium tracking-wide">
                CONTACTO
              </span>
            </Link>
          </nav>

          {/* Mobile Menu Button - PREMIUM STYLED */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-bone-white hover:bg-premium-card"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu - PREMIUM STYLED */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-premium-main border-b border-support-gray/20">
          <div className="container-premium py-premium-md">
            <nav className="flex flex-col space-y-premium-sm">
              <Link
                href="/propiedades"
                className={`${getLinkClassName("/propiedades")} block py-premium-sm px-premium-md rounded-lg hover:bg-premium-card transition-colors`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="body-md font-medium tracking-wide">
                  PROPIEDADES
                </span>
              </Link>
              <Link
                href="/agentes"
                className={`${getAgentesLinkClassName()} block py-premium-sm px-premium-md rounded-lg hover:bg-premium-card transition-colors`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="body-md font-medium tracking-wide">
                  AGENTES
                </span>
              </Link>
              <Link
                href="/contacto"
                className={`${getContactLinkClassName()} block py-premium-sm px-premium-md rounded-lg hover:bg-premium-card transition-colors`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="body-md font-medium tracking-wide">
                  CONTACTO
                </span>
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Decorative divider line - PREMIUM GRADIENT */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-vibrant-orange to-transparent shadow-lg opacity-80"></div>
    </header>
  );
}