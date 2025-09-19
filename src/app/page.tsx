'use client'

import { useEffect } from 'react'
import { reportWebVitals } from '@/hooks/performance'

export default function Home() {
  useEffect(() => {
    const loadWebVitals = async () => {
      if (typeof window !== 'undefined') {
        reportWebVitals()
      }
    }
    loadWebVitals()
  }, [])

  return (
    <div className='bg-zinc-950 min-h-screen'>
      <h1 className="text-white p-4">Hello!</h1>
    </div>
  )
}
