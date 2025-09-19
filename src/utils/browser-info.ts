import type { NavigationInfo, ConnectionInfo } from '@/types/vitals'
import type { NetworkConnection } from '@/types/browser'

export function getNavigationInfo(): NavigationInfo {
  if (typeof window === 'undefined' || !window.performance) {
    return {
      type: 'unknown',
      redirectCount: 0,
      timing: null
    }
  }

  const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

  return {
    type: navigation?.type || 'unknown',
    redirectCount: navigation?.redirectCount || 0,
    timing: navigation || null
  }
}

export function getConnectionInfo(): ConnectionInfo {
  if (typeof window === 'undefined') {
    return {
      effectiveType: null,
      downlink: null,
      rtt: null,
      saveData: null
    }
  }

  const connection: NetworkConnection | undefined = navigator.connection || navigator.mozConnection || navigator.webkitConnection

  return {
    effectiveType: connection?.effectiveType || null,
    downlink: connection?.downlink || null,
    rtt: connection?.rtt || null,
    saveData: connection?.saveData || null
  }
}