import { NextRequest, NextResponse } from 'next/server'
import { loadConfig } from '@/utils/config'
import { VitalsLogger } from '@/libs/vitals-logger'
import type { LogEntry } from '@/types/vitals'

const vitalsLogger = new VitalsLogger()

export async function POST(request: NextRequest) {
  try {
    const config = await loadConfig()

    if (!config.app.vitals.enabled) {
      return NextResponse.json({ success: false, error: 'Vitals logging disabled' })
    }

    const vitals = await request.json()

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      url: vitals.url || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      sessionId: vitals.sessionId,
      metrics: vitals.metrics,
      navigation: vitals.navigation,
      connection: vitals.connection
    }

    await vitalsLogger.logEntry(logEntry, config)

    return NextResponse.json({ success: true, batched: true })
  } catch (error) {
    console.error('Vitals API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to log vitals' },
      { status: 500 }
    )
  }
}