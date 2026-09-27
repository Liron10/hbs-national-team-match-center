import { getFootballApiBase } from './config'

const BROWSER_ACCEPT = 'application/json, text/plain, */*'
const FETCH_MS = 8_000

export async function footballGet<T>(path: string): Promise<T> {
  const url = `${getFootballApiBase()}${path.startsWith('/') ? path : `/${path}`}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_MS)
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        Accept: BROWSER_ACCEPT,
      },
    })
    if (!response.ok) {
      throw new Error(`Football API ${response.status} ${path}`)
    }
    return (await response.json()) as T
  } finally {
    clearTimeout(timer)
  }
}
