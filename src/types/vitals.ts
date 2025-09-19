export interface VitalMetric {
  id: string
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'back-forward-cache' | 'prerender' | 'restore'
  attribution?: Record<string, unknown>
}

export interface VitalsData {
  url: string
  sessionId: string
  timestamp: number
  metrics: VitalMetric[]
  navigation: NavigationInfo
  connection: ConnectionInfo
}

export interface NavigationInfo {
  type: string
  redirectCount: number
  timing: PerformanceNavigationTiming | null
}

export interface ConnectionInfo {
  effectiveType: string | null
  downlink: number | null
  rtt: number | null
  saveData: boolean | null
}

export interface PerformanceMetrics {
  cls: number | null
  fcp: number | null
  inp: number | null
  lcp: number | null
  ttfb: number | null
}

export interface LogEntry {
  timestamp: string
  url: string
  userAgent: string
  sessionId: string
  metrics: VitalMetric[]
  navigation: NavigationInfo
  connection: ConnectionInfo
}