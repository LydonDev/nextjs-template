'use client'

import { useEffect } from 'react'
import { initializeVitals } from '@/libs/vitals-collector'

interface PerformanceEntryWithValue extends PerformanceEntry {
  value?: number
}

export function VitalsTracker() {
  useEffect(() => {
    const collector = initializeVitals()

    if (collector && typeof window !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        for (const entry of entries) {
          if (entry.entryType === 'largest-contentful-paint' ||
              entry.entryType === 'first-input' ||
              entry.entryType === 'layout-shift') {
            const entryWithValue = entry as PerformanceEntryWithValue
            console.log(`${entry.entryType}:`, entryWithValue.value || entry.startTime)
          }
        }
      })

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'navigation', 'paint'] })
      } catch (e) {
        console.warn('Performance Observer not supported:', e)
      }

      return () => {
        observer.disconnect()
      }
    }
  }, [])

  return null
}