/**
 * Conference Scraper API Service
 * Self-contained client configured for frontend standalone operation
 * with built-in client-side Stale-While-Revalidate (SWR) caching.
 */

const BASE_URL = import.meta.env.VITE_CONFERENCE_API_URL || 'https://conference-scraper-api.dcism.org'
const DEFAULT_KEY = import.meta.env.VITE_CONFERENCE_API_KEY || ''

// Cache TTL: 2 hours (per API guide suggestion to avoid stale fees)
const CACHE_TTL_MS = 2 * 60 * 60 * 1000

// In-memory cache for fast tab/modal navigation
const memoryCache = new Map()

/**
 * Read cached item from sessionStorage with fallback to memory
 */
function getCachedData(key) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return memoryCache.get(key) || null
    const parsed = JSON.parse(raw)
    const isStale = Date.now() - parsed.timestamp > CACHE_TTL_MS
    return { data: parsed.data, isStale, timestamp: parsed.timestamp }
  } catch {
    return memoryCache.get(key) || null
  }
}

/**
 * Write item to sessionStorage and memory cache
 */
function setCachedData(key, data) {
  const item = { data, timestamp: Date.now(), isStale: false }
  memoryCache.set(key, item)
  try {
    sessionStorage.setItem(key, JSON.stringify(item))
  } catch (err) {
    // If quota exceeded, clear stale entries from sessionStorage
    try {
      sessionStorage.clear()
      sessionStorage.setItem(key, JSON.stringify(item))
    } catch {}
  }
}

/**
 * Clear all cached conference entries
 */
export function clearConferenceCache() {
  memoryCache.clear()
  try {
    const keysToRemove = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (key.startsWith('cq_conf_') || key.startsWith('cq_detail_') || key.startsWith('cq_summary'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k))
  } catch {}
}

/**
 * Get currently active API key (from localStorage override or env)
 */
export function getApiKey() {
  return localStorage.getItem('cq_api_key') || DEFAULT_KEY
}

/**
 * Update user-customized API key
 */
export function setApiKey(key) {
  if (!key) {
    localStorage.removeItem('cq_api_key')
  } else {
    localStorage.setItem('cq_api_key', key.trim())
  }
  clearConferenceCache()
}

/**
 * Base fetch helper with auth header and JSON error handling
 */
async function request(path, options = {}) {
  const key = getApiKey()
  const headers = {
    'Accept': 'application/json',
    ...(key ? { 'X-API-Key': key } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    let message = `Error ${res.status}`
    try {
      const err = await res.json()
      if (err?.detail) {
        message = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail)
      }
    } catch {
      message = res.statusText || message
    }
    const error = new Error(message)
    error.status = res.status
    throw error
  }

  return res.json()
}

/**
 * Fetch health info (no key needed, short cache)
 */
export async function fetchHealth() {
  const res = await fetch(`${BASE_URL}/health`)
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`)
  return res.json()
}

/**
 * Fetch counts and summary metadata with caching
 */
export async function fetchSummary({ forceRefresh = false } = {}) {
  const cacheKey = 'cq_summary'
  if (!forceRefresh) {
    const cached = getCachedData(cacheKey)
    if (cached?.data && !cached.isStale) return cached.data
  }

  const fresh = await request('/summary')
  setCachedData(cacheKey, fresh)
  return fresh
}

/**
 * Direct network call for conferences list
 */
export async function fetchConferencesNetwork({
  continent = 'Asia',
  compact = true,
  limit = 1000,
  hasFees = null,
  startsFrom = null,
  startsTo = null,
  abstractFrom = null,
  abstractTo = null,
  hasAbstract = null,
  source = null,
  status = null,
} = {}) {
  const params = new URLSearchParams()
  if (continent && continent !== 'all') params.append('continent', continent)
  if (compact !== undefined) params.append('compact', String(compact))
  if (limit) params.append('limit', String(limit))
  if (hasFees !== null && hasFees !== undefined) params.append('has_fees', String(hasFees))
  if (startsFrom) params.append('starts_from', startsFrom)
  if (startsTo) params.append('starts_to', startsTo)
  if (abstractFrom) params.append('abstract_from', abstractFrom)
  if (abstractTo) params.append('abstract_to', abstractTo)
  if (hasAbstract !== null && hasAbstract !== undefined) params.append('has_abstract', String(hasAbstract))
  if (source) params.append('source', source)
  if (status) params.append('status', status)

  return request(`/conferences?${params.toString()}`)
}

/**
 * Fetch conferences with Stale-While-Revalidate (SWR) caching.
 * Returns cached list instantly (0ms) and optionally fires onBackgroundUpdate when fresh data arrives.
 */
export async function fetchConferences(params = {}, onBackgroundUpdate = null) {
  const continent = params.continent === undefined ? 'Asia' : params.continent
  const cacheKey = `cq_conf_${continent || 'all'}`

  // Check client cache first
  if (!params.forceRefresh) {
    const cached = getCachedData(cacheKey)
    if (cached?.data) {
      // If stale or background update callback is registered, revalidate silently
      if (cached.isStale || onBackgroundUpdate) {
        fetchConferencesNetwork(params)
          .then((fresh) => {
            setCachedData(cacheKey, fresh)
            if (onBackgroundUpdate) onBackgroundUpdate(fresh)
          })
          .catch(() => {})
      }
      return cached.data
    }
  }

  // Not in cache or forced refresh: fetch over the network
  const fresh = await fetchConferencesNetwork(params)
  setCachedData(cacheKey, fresh)
  return fresh
}

/**
 * Fetch detailed view for a single conference (with memory & storage caching)
 */
export async function fetchConferenceById(id, { forceRefresh = false } = {}) {
  const cacheKey = `cq_detail_${id}`

  if (!forceRefresh) {
    const cached = getCachedData(cacheKey)
    if (cached?.data) return cached.data
  }

  const fresh = await request(`/conferences/${id}`)
  setCachedData(cacheKey, fresh)
  return fresh
}

/**
 * Download conferences export (CSV or Excel) using fetch + blob to carry API key
 */
export async function downloadExport({
  fmt = 'xlsx',
  continent = 'Asia',
  source = null,
  startsFrom = null,
  startsTo = null,
} = {}) {
  const key = getApiKey()
  const params = new URLSearchParams()
  params.append('fmt', fmt)
  if (continent) params.append('continent', continent)
  if (source) params.append('source', source)
  if (startsFrom) params.append('starts_from', startsFrom)
  if (startsTo) params.append('starts_to', startsTo)

  const res = await fetch(`${BASE_URL}/conferences/export?${params.toString()}`, {
    headers: {
      ...(key ? { 'X-API-Key': key } : {}),
    },
  })

  if (!res.ok) {
    let msg = `Download failed with HTTP ${res.status}`
    try {
      const err = await res.json()
      if (err?.detail) msg = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail)
    } catch {}
    throw new Error(msg)
  }

  // Extract filename from Content-Disposition header if present
  const disposition = res.headers.get('Content-Disposition')
  let filename = `conferences-${new Date().toISOString().slice(0, 10)}.${fmt}`
  if (disposition) {
    const match = /filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?/i.exec(disposition)
    if (match && match[1]) {
      filename = decodeURIComponent(match[1])
    }
  }

  const blob = await res.blob()
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(blobUrl)
}
