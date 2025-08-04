"use client"

import { useState, useEffect } from "react"
import { PropertyService } from "@/services/properties"
import type { Property } from "@/lib/supabase"

// Import components
import Header from "@/components/homepage/Header"
import HeroSection from "@/components/homepage/HeroSection"
import FeaturedProperties from "@/components/homepage/FeaturedProperties"
import StatsSection from "@/components/homepage/StatsSection"
import CTASection from "@/components/homepage/CTASection"
import Footer from "@/components/homepage/Footer"

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [operationType, setOperationType] = useState("")
  const [propertyType, setPropertyType] = useState("")
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFeaturedProperties = async () => {
      try {
        const properties = await PropertyService.getFeaturedProperties(3)
        setFeaturedProperties(properties)
      } catch (error) {
        console.error("Error loading featured properties:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFeaturedProperties()
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchTerm) params.set("search", searchTerm)
    if (operationType) params.set("operation", operationType)
    if (propertyType) params.set("type", propertyType)

    window.location.href = `/propiedades?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
      />
      <HeroSection />
      <FeaturedProperties 
        featuredProperties={featuredProperties}
        loading={loading}
      />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  )
}