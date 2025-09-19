'use client'

import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'
import type { VitalMetric, VitalsData, PerformanceMetrics } from '@/types/vitals'
import type { WebVitalsMetric } from '@/types/browser'
import { getNavigationInfo, getConnectionInfo } from '@/utils/browser-info'

export class VitalsCollector {
  private sessionId: string
  private collectedMetrics: VitalMetric[] = []
  private pendingBatch: VitalMetric[] = []
  private performanceMetrics: PerformanceMetrics = {
    cls: null,
    fcp: null,
    inp: null,
    lcp: null,
    ttfb: null
  }
  private batchTimeout: NodeJS.Timeout | null = null
  private readonly maxBatchSize = 50
  private readonly batchWaitTime = 30000

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeCollection()
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeCollection(): void {
    if (typeof window === 'undefined') return

    onCLS(this.handleMetric.bind(this), { reportAllChanges: true })
    onFCP(this.handleMetric.bind(this), { reportAllChanges: true })
    onINP(this.handleMetric.bind(this), { reportAllChanges: true })
    onLCP(this.handleMetric.bind(this), { reportAllChanges: true })
    onTTFB(this.handleMetric.bind(this), { reportAllChanges: true })

    this.setupVisibilityChangeListener()
    this.setupBeforeUnloadListener()
  }

  private handleMetric(metric: WebVitalsMetric): void {
    const vitalMetric: VitalMetric = {
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      navigationType: (metric.navigationType as VitalMetric['navigationType']) || 'navigate',
      ...(metric.attribution && { attribution: metric.attribution })
    }

    this.collectedMetrics.push(vitalMetric)
    this.pendingBatch.push(vitalMetric)
    this.performanceMetrics[metric.name.toLowerCase() as keyof PerformanceMetrics] = metric.value

    if (this.pendingBatch.length >= this.maxBatchSize) {
      this.flushBatch()
    } else {
      this.scheduleBatchFlush()
    }
  }

  private scheduleBatchFlush(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
    }

    this.batchTimeout = setTimeout(() => {
      this.flushBatch()
    }, this.batchWaitTime)
  }

  private async flushBatch(): Promise<void> {
    if (this.pendingBatch.length === 0) return

    const batchToSend = [...this.pendingBatch]
    this.pendingBatch = []

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = null
    }

    const vitalsData: VitalsData = {
      url: window.location.href,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      metrics: batchToSend,
      navigation: getNavigationInfo(),
      connection: getConnectionInfo()
    }

    try {
      await fetch('/api/vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vitalsData),
        keepalive: true
      })
    } catch (error) {
      console.error('Failed to report vitals batch:', error)
      this.pendingBatch.unshift(...batchToSend)
    }
  }

  private setupVisibilityChangeListener(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushBatch()
      }
    })
  }

  private setupBeforeUnloadListener(): void {
    window.addEventListener('beforeunload', () => {
      this.flushBatch()
    })

    window.addEventListener('pagehide', () => {
      this.flushBatch()
    })
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics }
  }

  public getSessionId(): string {
    return this.sessionId
  }

  public forceBatchFlush(): Promise<void> {
    return this.flushBatch()
  }
}

let vitalsCollector: VitalsCollector | null = null

export function initializeVitals(): VitalsCollector | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (!vitalsCollector) {
    vitalsCollector = new VitalsCollector()
  }

  return vitalsCollector
}

export function getVitalsCollector(): VitalsCollector | null {
  return vitalsCollector
}