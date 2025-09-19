const CACHE_NAME = 'perf-app-v1'
const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
]

const CACHE_STRATEGIES = {
  images: 'CacheFirst',
  api: 'NetworkFirst',
  static: 'CacheFirst',
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            return cacheName !== CACHE_NAME &&
                   cacheName !== STATIC_CACHE &&
                   cacheName !== DYNAMIC_CACHE
          })
          .map(cacheName => caches.delete(cacheName))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request))
  } else if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, 'images'))
  } else {
    event.respondWith(staleWhileRevalidate(request))
  }
})

async function cacheFirst(request, cacheName = STATIC_CACHE) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)
    if (response.status === 200) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    return new Response('Network error', { status: 503 })
  }
}

async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE)

  try {
    const response = await fetch(request)
    if (response.status === 200) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await cache.match(request)
    return cached || new Response('Network error', { status: 503 })
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cached = await cache.match(request)

  const fetchPromise = fetch(request).then(response => {
    if (response.status === 200) {
      cache.put(request, response.clone())
    }
    return response
  })

  return cached || fetchPromise
}