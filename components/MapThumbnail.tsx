import React from "react"

interface MapThumbnailProps {
  query: string
  className?: string
  title?: string
}

export function MapThumbnail({ query, className = "", title = "Mapa" }: MapThumbnailProps) {
  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`

  return (
    <div className={`relative w-full h-full ${className}`}>
      <iframe
        title={title}
        src={embedSrc}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 w-full h-full border-0"
        aria-label={title}
      />
    </div>
  )
}