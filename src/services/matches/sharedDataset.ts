import type { Match, MatchDataset } from '../../types'
import bundled from '../../data/matches.json'

const typedBundled = bundled as MatchDataset

export const SHARED_MATCHES_URL =
  'https://raw.githubusercontent.com/Liron10/hbs-national-team-match-center/main/src/data/matches.json'

export function usesSharedMatchDataset(): boolean {
  const host = (globalThis as { location?: { hostname?: string } }).location?.hostname
  if (!host) return false
  return host !== 'localhost' && host !== '127.0.0.1'
}

export function bundledMatches(): Match[] {
  return typedBundled.matches
}

export async function fetchSharedMatches(fallback: Match[] = bundledMatches()): Promise<Match[]> {
  if (!usesSharedMatchDataset()) return fallback

  const base = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/'
  const urls = [
    `${SHARED_MATCHES_URL}?t=${Date.now()}`,
    `${base}matches.json?t=${Date.now()}`,
  ]

  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: 'no-store' })
      if (!response.ok) continue
      const data = (await response.json()) as Partial<MatchDataset>
      if (Array.isArray(data.matches) && data.matches.length > 0) return data.matches
    } catch {
      continue
    }
  }

  return fallback
}
