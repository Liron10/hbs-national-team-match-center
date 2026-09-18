import { getFootballApiBase } from './config'

const BROWSER_ACCEPT = 'application/json, text/plain, */*'

export async function footballGet<T>(path: string): Promise<T> {
  const url = `${getFootballApiBase()}${path.startsWith('/') ? path : `/${path}`}`
  const response = await fetch(url, {
    headers: {
      Accept: BROWSER_ACCEPT,
    },
  })
  if (!response.ok) {
    throw new Error(`Football API ${response.status} ${path}`)
  }
  return (await response.json()) as T
}
