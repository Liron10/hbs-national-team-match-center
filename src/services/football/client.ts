import { getFootballApiBase } from './config'

const BROWSER_ACCEPT = 'application/json, text/plain, */*'
const BROWSER_FETCH_MS = 8_000
const NODE_FETCH_MS = 20_000

function browserHost(): string | undefined {
  return (globalThis as { location?: { hostname?: string } }).location?.hostname
}

function footballHeaders(): Record<string, string> {
  const headers: Record<string, string> = { Accept: BROWSER_ACCEPT }
  if (!browserHost()) {
    headers['User-Agent'] =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    headers.Referer = 'https://www.fotmob.com/'
    headers.Origin = 'https://www.fotmob.com'
  }
  return headers
}

export async function footballGet<T>(path: string): Promise<T> {
  const url = `${getFootballApiBase()}${path.startsWith('/') ? path : `/${path}`}`
  const controller = new AbortController()
  const timeoutMs = browserHost() ? BROWSER_FETCH_MS : NODE_FETCH_MS
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
      headers: footballHeaders(),
    })
    if (!response.ok) {
      throw new Error(`Football API ${response.status} ${path}`)
    }
    return (await response.json()) as T
  } finally {
    clearTimeout(timer)
  }
}
