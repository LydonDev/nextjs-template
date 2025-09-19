import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'

type MetricValue = {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
}

const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals'

function getConnectionSpeed(): string {
  return (navigator as any)?.connection?.effectiveType || 'unknown'
}

function sendToAnalytics(metric: MetricValue): void {
  const body = JSON.stringify({
    dsn: process.env.NEXT_PUBLIC_ANALYTICS_ID,
    id: metric.id,
    page: window.location.pathname,
    href: window.location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed(),
  })

  if (navigator.sendBeacon) {
    navigator.sendBeacon(vitalsUrl, body)
  } else {
    fetch(vitalsUrl, {
      body,
      method: 'POST',
      keepalive: true,
    }).catch(() => {})
  }
}

export function reportWebVitals(): void {
  try {
    onCLS(sendToAnalytics)
    onINP(sendToAnalytics)
    onFCP(sendToAnalytics)
    onLCP(sendToAnalytics)
    onTTFB(sendToAnalytics)
  } catch (err) {
    console.error('Error reporting web vitals:', err)
  }
}

export function prefetchRoute(href: string): void {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  document.head.appendChild(link)
}

export function preloadCriticalAssets(): void {
  const criticalAssets = [
    '/fonts/inter-var.woff2',
    '/images/hero.webp',
  ]

  criticalAssets.forEach(asset => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = asset
    link.as = asset.includes('font') ? 'font' : 'image'
    if (asset.includes('font')) {
      link.type = 'font/woff2'
      link.crossOrigin = 'anonymous'
    }
    document.head.appendChild(link)
  })
}

export function optimizeImages(): void {
  const images = document.querySelectorAll('img[data-src]')

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = img.dataset.src || ''
          img.classList.remove('lazy')
          imageObserver.unobserve(img)
        }
      })
    })

    images.forEach(img => imageObserver.observe(img))
  } else {
    images.forEach(img => {
      const image = img as HTMLImageElement
      image.src = image.dataset.src || ''
    })
  }
}

export function enableServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          console.log('SW registered')
        })
        .catch(() => {
          console.log('SW registration failed')
        })
    })
  }
}