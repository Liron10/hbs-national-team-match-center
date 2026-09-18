/**
 * Single place for the football data API origin.
 * Override with VITE_FOOTBALL_API_BASE, or self-host a FotMob proxy later.
 */
export function getFootballApiBase(): string {
  const viteBase = (import.meta as { env?: { VITE_FOOTBALL_API_BASE?: string } }).env?.VITE_FOOTBALL_API_BASE?.trim()
  if (viteBase) return viteBase.replace(/\/$/, '')
  const host = (globalThis as { location?: { hostname?: string } }).location?.hostname
  if (host === 'localhost' || host === '127.0.0.1') return '/football-api'
  return 'https://www.fotmob.com/api'
}
