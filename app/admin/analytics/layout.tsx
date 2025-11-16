import type React from "react"
import AnalyticsLayoutWrapper from "@/components/navigation/analytics-layout-wrapper"

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AnalyticsLayoutWrapper>{children}</AnalyticsLayoutWrapper>
}
