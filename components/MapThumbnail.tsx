import React from "react"

interface MapThumbnailProps {
  query: string
  zoom?: number
  className?: string
  title?: string
}

export function MapThumbnail({ query, zoom = 16, className = "", title = "Mapa" }: MapThumbnailProps) {
  const src = `https://www.google.com/maps?hl=es&q=${encodeURIComponent(query)}&z=${zoom}&output=embed`

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <iframe
        src={src}
        title={title}
        className="absolute inset-0 w-full h-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        aria-label={title}
      />
    </div>
  )
}