'use client'

import { useEffect, useRef } from "react"
import { usePropertyAnalytics } from "@/hooks/useAnalytics"

interface PropertyViewTrackerProps {
  propertyId: number
  title?: string
  enableScrollTracking?: boolean
  enableTimeTracking?: boolean
  onViewTracked?: (eventId: string | null) => void
  children?: React.ReactNode
}

export function PropertyViewTracker({ 
  propertyId, 
  title,
  enableScrollTracking = true,
  enableTimeTracking = true,
  onViewTracked,
  children 
}: PropertyViewTrackerProps) {
  const analytics = usePropertyAnalytics(propertyId, {
    trackScrollDepth: enableScrollTracking,
    trackTimeOnPage: enableTimeTracking,
    enableAutoTracking: true
  })

  const hasNotifiedParent = useRef(false)

  // Notify parent component when view is tracked
  useEffect(() => {
    if (analytics.sessionId && !analytics.isOptedOut && !hasNotifiedParent.current) {
      hasNotifiedParent.current = true
      // The view is automatically tracked by usePropertyAnalytics
      // We call the callback to notify parent that tracking has been initialized
      onViewTracked?.(analytics.sessionId)
    }
  }, [analytics.sessionId, analytics.isOptedOut, onViewTracked])

  // This component is invisible by default, but can wrap content
  if (children) {
    return <>{children}</>
  }

  // Return null if no children - purely for tracking
  return null
}

// Convenience component for tracking contact interactions
interface ContactTrackerProps {
  propertyId: number
  type: 'whatsapp' | 'phone' | 'email' | 'form'
  children: React.ReactElement
  metadata?: Record<string, any>
}

export function ContactTracker({ 
  propertyId, 
  type, 
  children, 
  metadata 
}: ContactTrackerProps) {
  const analytics = usePropertyAnalytics(propertyId)

  const handleClick = () => {
    analytics.trackContact(type)
    
    // Track additional interaction data if provided
    if (metadata) {
      analytics.trackInteraction(`contact_${type}_detailed`, `contact_${type}_button`, propertyId, metadata)
    }
  }

  // Clone the child element and add our click handler
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      // Call the original onClick if it exists
      if (children.props.onClick) {
        children.props.onClick(e)
      }
      handleClick()
    }
  })
}

// Component for tracking image gallery interactions
interface ImageGalleryTrackerProps {
  propertyId: number
  totalImages: number
  children: React.ReactNode
}

export function ImageGalleryTracker({ 
  propertyId, 
  totalImages, 
  children 
}: ImageGalleryTrackerProps) {
  const analytics = usePropertyAnalytics(propertyId)
  const viewedImages = useRef(new Set<number>())

  const trackImageView = (imageIndex: number) => {
    if (!viewedImages.current.has(imageIndex)) {
      viewedImages.current.add(imageIndex)
      
      analytics.trackInteraction('image_view', `image_${imageIndex}`, propertyId, {
        image_index: imageIndex,
        total_images: totalImages,
        images_viewed_count: viewedImages.current.size,
        view_percentage: Math.round((viewedImages.current.size / totalImages) * 100)
      })
    }
  }

  // Provide context to children
  return (
    <ImageGalleryContext.Provider value={{ trackImageView }}>
      {children}
    </ImageGalleryContext.Provider>
  )
}

// Context for image gallery tracking
import React from 'react'

interface ImageGalleryContextValue {
  trackImageView: (imageIndex: number) => void
}

const ImageGalleryContext = React.createContext<ImageGalleryContextValue | null>(null)

export function useImageGalleryTracker() {
  const context = React.useContext(ImageGalleryContext)
  if (!context) {
    throw new Error('useImageGalleryTracker must be used within ImageGalleryTracker')
  }
  return context
}

// Scroll milestone tracker
interface ScrollMilestoneTrackerProps {
  propertyId: number
  milestones?: number[] // Default: [25, 50, 75, 100]
}

export function ScrollMilestoneTracker({ 
  propertyId, 
  milestones = [25, 50, 75, 100] 
}: ScrollMilestoneTrackerProps) {
  const analytics = usePropertyAnalytics(propertyId)
  const trackedMilestones = useRef(new Set<number>())

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercentage = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0

      // Check each milestone
      milestones.forEach(milestone => {
        if (scrollPercentage >= milestone && !trackedMilestones.current.has(milestone)) {
          trackedMilestones.current.add(milestone)
          analytics.trackInteraction('scroll_milestone', `scroll_${milestone}`, propertyId, {
            milestone_percentage: milestone,
            actual_percentage: scrollPercentage,
            timestamp: Date.now()
          })
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [milestones, analytics, propertyId])

  return null
}

// Time milestone tracker
interface TimeMilestoneTrackerProps {
  propertyId: number
  milestones?: number[] // Time in seconds, default: [30, 60, 120, 300]
}

export function TimeMilestoneTracker({ 
  propertyId, 
  milestones = [30, 60, 120, 300] 
}: TimeMilestoneTrackerProps) {
  const analytics = usePropertyAnalytics(propertyId)
  const startTime = useRef(Date.now())
  const trackedMilestones = useRef(new Set<number>())

  useEffect(() => {
    const intervals = milestones.map(milestone => {
      return setTimeout(() => {
        if (!trackedMilestones.current.has(milestone)) {
          trackedMilestones.current.add(milestone)
          const actualTime = Math.round((Date.now() - startTime.current) / 1000)
          
          analytics.trackInteraction('time_milestone', `time_${milestone}s`, propertyId, {
            milestone_seconds: milestone,
            actual_seconds: actualTime,
            engagement_level: milestone >= 120 ? 'high' : milestone >= 60 ? 'medium' : 'low'
          })
        }
      }, milestone * 1000)
    })

    return () => {
      intervals.forEach(clearTimeout)
    }
  }, [milestones, analytics, propertyId])

  return null
}

// Comprehensive property view tracker with all features
interface ComprehensivePropertyTrackerProps {
  propertyId: number
  title?: string
  totalImages?: number
  enableScrollMilestones?: boolean
  enableTimeMilestones?: boolean
  scrollMilestones?: number[]
  timeMilestones?: number[]
  onViewTracked?: (eventId: string | null) => void
  children?: React.ReactNode
}

export function ComprehensivePropertyTracker({
  propertyId,
  title,
  totalImages = 0,
  enableScrollMilestones = true,
  enableTimeMilestones = true,
  scrollMilestones,
  timeMilestones,
  onViewTracked,
  children
}: ComprehensivePropertyTrackerProps) {
  return (
    <>
      <PropertyViewTracker 
        propertyId={propertyId}
        title={title}
        onViewTracked={onViewTracked}
      >
        {children}
      </PropertyViewTracker>
      
      {enableScrollMilestones && (
        <ScrollMilestoneTracker 
          propertyId={propertyId}
          milestones={scrollMilestones}
        />
      )}
      
      {enableTimeMilestones && (
        <TimeMilestoneTracker 
          propertyId={propertyId}
          milestones={timeMilestones}
        />
      )}
    </>
  )
}