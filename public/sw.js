// Inkhaven Chat Service Worker - Market Leader Edition
// Provides offline functionality, message queuing, and push notifications

const CACHE_NAME = 'inkhaven-chat-v2.0.1'
const STATIC_CACHE = 'inkhaven-static-v2.0.1'
const DYNAMIC_CACHE = 'inkhaven-dynamic-v2.0.1'

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Core CSS and JS will be added by Next.js build process
]

// API routes that should work offline with cached responses
const CACHEABLE_ROUTES = [
  '/api/themes',
  '/api/languages',
  '/api/rooms/categories'
]

// Message queue for offline functionality
let messageQueue = []
let isOnline = navigator.onLine

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Installation complete')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, CACHE_NAME]
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!validCaches.includes(cacheName)) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Activation complete')
        // Take control of uncontrolled clients immediately so they get the new cache behavior
        return self.clients.claim()
      })
  )
})

// Fetch event - handle requests with cache-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle static assets and pages
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(request)
          .then((response) => {
            // Cache successful GET responses only (POST/PUT/DELETE cannot be cached)
            if (response.status === 200 && request.method === 'GET') {
              const responseClone = response.clone()
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseClone)
                })
            }
            return response
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline')
            }
            throw new Error('Network request failed and no cache available')
          })
      })
  )
})

// Handle API requests with offline support
async function handleApiRequest(request) {
  const url = new URL(request.url)
  
  try {
    // Try network first for API requests
    const response = await fetch(request)
    
    // Cache successful GET requests
    if (request.method === 'GET' && response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    
    // Handle message sending
    if (url.pathname === '/api/chat/message' && request.method === 'POST') {
      await processOnlineMessages()
    }
    
    return response
  } catch (error) {
    console.log('Service Worker: Network request failed', error)
    
    // Handle offline message queuing
    if (url.pathname === '/api/chat/message' && request.method === 'POST') {
      return handleOfflineMessage(request)
    }
    
    // Return cached response for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
    }
    
    // Return offline response
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'You are currently offline. Messages will be sent when connection is restored.' 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle offline message queuing
async function handleOfflineMessage(request) {
  try {
    const messageData = await request.json()
    
    // Add timestamp and unique ID
    const queuedMessage = {
      id: generateMessageId(),
      ...messageData,
      timestamp: Date.now(),
      retryCount: 0
    }
    
    // Store in IndexedDB for persistence
    await storeOfflineMessage(queuedMessage)
    
    // Add to memory queue
    messageQueue.push(queuedMessage)
    
    console.log('Service Worker: Message queued for offline sending', queuedMessage.id)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        queued: true,
        messageId: queuedMessage.id,
        message: 'Message queued. Will be sent when online.' 
      }),
      { 
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Service Worker: Failed to queue message', error)
    return new Response(
      JSON.stringify({ error: 'Failed to queue message' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// Process queued messages when online
async function processOnlineMessages() {
  if (messageQueue.length === 0) return
  
  console.log(`Service Worker: Processing ${messageQueue.length} queued messages`)
  
  const messagesToProcess = [...messageQueue]
  messageQueue = []
  
  for (const message of messagesToProcess) {
    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message.content,
          sessionId: message.sessionId,
          queuedMessageId: message.id
        })
      })
      
      if (response.ok) {
        console.log('Service Worker: Queued message sent successfully', message.id)
        await removeOfflineMessage(message.id)
        
        // Notify client of successful send
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'QUEUED_MESSAGE_SENT',
              messageId: message.id,
              success: true
            })
          })
        })
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('Service Worker: Failed to send queued message', message.id, error)
      
      // Retry logic
      message.retryCount++
      if (message.retryCount < 3) {
        messageQueue.push(message)
        console.log(`Service Worker: Retrying message ${message.id} (attempt ${message.retryCount})`)
      } else {
        console.log(`Service Worker: Giving up on message ${message.id} after 3 attempts`)
        await removeOfflineMessage(message.id)
        
        // Notify client of failure
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'QUEUED_MESSAGE_SENT',
              messageId: message.id,
              success: false,
              error: 'Failed to send after 3 attempts'
            })
          })
        })
      }
    }
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received')
  
  let notificationData = {
    title: 'Inkhaven Chat',
    body: 'You have a new message!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'inkhaven-message',
    requireInteraction: false,
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
    actions: [
      {
        action: 'reply',
        title: 'Reply',
        icon: '/icons/action-reply.png'
      },
      {
        action: 'view',
        title: 'View Chat',
        icon: '/icons/action-view.png'
      }
    ]
  }
  
  if (event.data) {
    try {
      const pushData = event.data.json()
      notificationData = { ...notificationData, ...pushData }
    } catch (error) {
      console.error('Service Worker: Failed to parse push data', error)
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action)
  
  event.notification.close()
  
  const notificationData = event.notification.data || {}
  const sessionId = notificationData.sessionId
  
  let targetUrl = '/'
  
  if (event.action === 'reply') {
    // Open chat with focus on input
    targetUrl = sessionId ? `/?session=${sessionId}&focus=input` : '/?focus=input'
  } else if (event.action === 'view' || !event.action) {
    // Open chat normally
    targetUrl = sessionId ? `/?session=${sessionId}` : '/'
  }
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Check if there's already a window open
        for (const client of clients) {
          if (client.url.includes(self.location.origin)) {
            // Focus existing window and navigate if needed
            if (sessionId) {
              client.postMessage({
                type: 'NOTIFICATION_CLICK',
                action: event.action,
                sessionId: sessionId,
                url: targetUrl
              })
            }
            return client.focus()
          }
        }
        
        // Open new window if none exists
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl)
        }
      })
  )
})

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification closed')
  
  // Track notification dismissal for analytics
  const notificationData = event.notification.data || {}
  
  if (notificationData.sessionId) {
    console.log('Service Worker: Notification dismissed for session:', notificationData.sessionId)
  }
})

// Online/offline event handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'ONLINE_STATUS_CHANGED') {
    isOnline = event.data.isOnline
    
    if (isOnline) {
      console.log('Service Worker: Back online, processing queued messages')
      processOnlineMessages()
    }
  }
})

// Utility functions
function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// IndexedDB operations for persistent message queue
async function storeOfflineMessage(message) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('InkhavenOfflineDB', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['messages'], 'readwrite')
      const store = transaction.objectStore('messages')
      
      store.add(message)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    }
    
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('messages')) {
        db.createObjectStore('messages', { keyPath: 'id' })
      }
    }
  })
}

async function removeOfflineMessage(messageId) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('InkhavenOfflineDB', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['messages'], 'readwrite')
      const store = transaction.objectStore('messages')
      
      store.delete(messageId)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    }
  })
}

// Load queued messages on startup
async function loadQueuedMessages() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('InkhavenOfflineDB', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['messages'], 'readonly')
      const store = transaction.objectStore('messages')
      
      const getAllRequest = store.getAll()
      getAllRequest.onsuccess = () => {
        messageQueue = getAllRequest.result || []
        console.log(`Service Worker: Loaded ${messageQueue.length} queued messages`)
        resolve()
      }
      getAllRequest.onerror = () => reject(getAllRequest.error)
    }
    
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('messages')) {
        db.createObjectStore('messages', { keyPath: 'id' })
      }
    }
  })
}

// Initialize on startup
loadQueuedMessages().catch(console.error)