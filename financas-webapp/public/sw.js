/* eslint-disable no-restricted-globals */
// Service Worker do app Finanças — RF06 (Limites de Gastos)
//
// Responsabilidades:
// 1. Cache-first para GET /categories e GET /spending-limits
// 2. Network-first (com fallback para cache) para GET /transactions
// 3. Página de fallback offline quando nenhum recurso em cache é encontrado
// 4. Web Notification quando uma transação é criada e o gasto da categoria
//    atinge 80% do limite definido (enviado via postMessage pela página)

const CACHE_NAME = 'financas-cache-v1'
const OFFLINE_URL = '/offline.html'

// Origem da API. Mantido em sincronia com src/services/api.ts
const API_ORIGIN = 'http://localhost:8080'

const CACHE_FIRST_PATHS = ['/categories', '/spending-limits']
const NETWORK_FIRST_PATHS = ['/transactions']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL]).catch(() => {}))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

function matchesPath(url, paths) {
  return paths.some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`))
}

// Resposta JSON "vazia" usada quando não há rede nem cache disponíveis,
// mantendo o formato esperado por cada endpoint para não quebrar o front-end.
function emptyJsonFallback(url) {
  let body = []
  if (matchesPath(url, NETWORK_FIRST_PATHS)) {
    body = { content: [], totalPages: 0, totalElements: 0, number: 0, size: 10 }
  }
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)

  if (cached) {
    // Atualiza o cache em segundo plano (stale-while-revalidate leve)
    fetch(request)
      .then((response) => {
        if (response && response.ok) cache.put(request, response.clone())
      })
      .catch(() => {})
    return cached
  }

  try {
    const response = await fetch(request)
    if (response && response.ok) cache.put(request, response.clone())
    return response
  } catch (err) {
    return emptyJsonFallback(new URL(request.url))
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  try {
    const response = await fetch(request)
    if (response && response.ok) cache.put(request, response.clone())
    return response
  } catch (err) {
    const cached = await cache.match(request)
    if (cached) return cached
    return emptyJsonFallback(new URL(request.url))
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request

  // Navegação de páginas: tenta a rede, cai para a página offline se falhar
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    )
    return
  }

  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== API_ORIGIN) return

  if (matchesPath(url, CACHE_FIRST_PATHS)) {
    event.respondWith(cacheFirst(request))
    return
  }

  if (matchesPath(url, NETWORK_FIRST_PATHS)) {
    event.respondWith(networkFirst(request))
  }
})

// Recebe mensagens da página (ex.: após criar uma transação) para disparar
// uma Web Notification, mesmo com a aba em segundo plano.
self.addEventListener('message', (event) => {
  const data = event.data
  if (!data || data.type !== 'SPENDING_ALERT') return

  const { categoryName, spent, limitAmount, percentUsed, categoryId } = data.payload || {}
  const fmt = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const title =
    percentUsed >= 100 ? 'Limite de gastos ultrapassado!' : 'Atenção ao limite de gastos'
  const body = `${categoryName}: ${fmt(spent)} de ${fmt(limitAmount)} (${percentUsed}%)`

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/favicon.svg',
      tag: `spending-limit-${categoryId}`,
      renotify: true,
    })
  )
})
