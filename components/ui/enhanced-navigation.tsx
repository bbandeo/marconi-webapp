"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X, ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EnhancedNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const { scrollYProgress } = useScroll();
  const navOpacity = useTransform(scrollYProgress, [0, 0.1], [0.9, 1]);
  const navBlur = useTransform(scrollYProgress, [0, 0.1], [10, 20]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    {
      name: "PROPIEDADES",
      href: "/propiedades",
      hasDropdown: true,
      dropdownItems: [
        { name: "Todas las Propiedades", href: "/propiedades" },
        { name: "Casas", href: "/propiedades?type=house" },
        { name: "Departamentos", href: "/propiedades?type=apartment" },
        { name: "Comerciales", href: "/propiedades?type=commercial" },
        { name: "Terrenos", href: "/propiedades?type=land" }
      ]
    },
    {
      name: "SERVICIOS",
      href: "#",
      hasDropdown: true,
      dropdownItems: [
        { name: "Venta", href: "/servicios/venta" },
        { name: "Alquiler", href: "/servicios/alquiler" },
        { name: "Tasaciones", href: "/servicios/tasaciones" },
        { name: "Asesoramiento", href: "/servicios/asesoramiento" }
      ]
    },
    {
      name: "AGENTES",
      href: "/agentes",
      hasDropdown: false
    },
    {
      name: "CONTACTO",
      href: "/contacto",
      hasDropdown: false
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-gray-900/95 border-b border-gray-700/30' 
          : 'bg-gray-900/80 border-b border-transparent'
      }`}
      style={{
        backdropFilter: `blur(${navBlur}px)`,
        opacity: navOpacity
      }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600"
        style={{ scaleX: scrollYProgress }}
        transformOrigin="0%"
      />
      
      <div className="container mx-auto px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo con animación */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/logos/marconi_header_orangewhite.png"
                alt="Marconi Inmobiliaria"
                width={140}
                height={45}
                className="h-10 w-auto transition-all duration-300 hover:brightness-110"
                priority
              />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item, index) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.hasDropdown && setActiveDropdown(index)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <motion.div
                  variants={itemVariants}
                  className="group"
                >
                  {item.hasDropdown ? (
                    <div className="flex items-center cursor-pointer">
                      <span className="text-gray-300 hover:text-white transition-all duration-300 font-medium tracking-wide text-sm relative group">
                        {item.name}
                        <motion.span
                          className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"
                        />
                      </span>
                      <motion.div
                        animate={{ rotate: activeDropdown === index ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4 ml-1 text-gray-400" />
                      </motion.div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-gray-300 hover:text-white transition-all duration-300 font-medium tracking-wide text-sm relative group"
                    >
                      {item.name}
                      <motion.span
                        className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"
                      />
                    </Link>
                  )}
                </motion.div>

                {/* Dropdown Menu */}
                {item.hasDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{
                      opacity: activeDropdown === index ? 1 : 0,
                      y: activeDropdown === index ? 0 : 10,
                      scale: activeDropdown === index ? 1 : 0.95
                    }}
                    transition={{ duration: 0.2 }}
                    className={`absolute top-full left-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden ${
                      activeDropdown === index ? 'pointer-events-auto' : 'pointer-events-none'
                    }`}
                  >
                    <div className="py-3">
                      {item.dropdownItems.map((dropdownItem, dropIndex) => (
                        <motion.div
                          key={dropdownItem.name}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{
                            x: activeDropdown === index ? 0 : -20,
                            opacity: activeDropdown === index ? 1 : 0
                          }}
                          transition={{ delay: dropIndex * 0.05, duration: 0.15 }}
                        >
                          <Link
                            href={dropdownItem.href}
                            className="block px-6 py-3 text-gray-300 hover:text-white hover:bg-orange-500/10 transition-all duration-200 text-sm"
                          >
                            {dropdownItem.name}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <motion.div
            className="hidden md:block"
            variants={itemVariants}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar propiedades..."
                className="pl-10 w-64 bg-gray-800/60 border-gray-700/30 text-white placeholder:text-gray-400 focus:border-orange-500 transition-all duration-300 backdrop-blur-sm"
              />
            </div>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.div>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isMobileMenuOpen ? 1 : 0,
            height: isMobileMenuOpen ? 'auto' : 0
          }}
          transition={{ duration: 0.3 }}
          className="lg:hidden overflow-hidden bg-gray-800/95 backdrop-blur-xl border-t border-gray-700/30"
        >
          <div className="py-6 space-y-4">
            {/* Mobile Search */}
            <div className="px-6 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar propiedades..."
                  className="pl-10 w-full bg-gray-700/60 border-gray-600/30 text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Mobile Navigation Items */}
            {navigationItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="px-6"
              >
                {item.hasDropdown ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
                      className="flex items-center justify-between w-full text-gray-300 hover:text-white transition-colors py-2"
                    >
                      <span className="font-medium">{item.name}</span>
                      <motion.div
                        animate={{ rotate: activeDropdown === index ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </button>
                    
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: activeDropdown === index ? 1 : 0,
                        height: activeDropdown === index ? 'auto' : 0
                      }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden ml-4 space-y-2"
                    >
                      {item.dropdownItems.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.name}
                          href={dropdownItem.href}
                          className="block text-gray-400 hover:text-orange-400 transition-colors py-1 text-sm"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {dropdownItem.name}
                        </Link>
                      ))}
                    </motion.div>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="block text-gray-300 hover:text-white transition-colors py-2 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </motion.div>
            ))}

            {/* CTA Button Mobile */}
            <motion.div
              className="px-6 pt-6 border-t border-gray-700/30"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium">
                Contactar Agente
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}