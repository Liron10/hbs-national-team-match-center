import type { Match } from '../types'

export function assetUrl(path: string): string {
  const normalized = path.replace(/^\//, '')
  const base = import.meta.env.BASE_URL
  return `${base}${normalized}`
}

export function matchInvolvesPlayer(match: Match, playerId: string): boolean {
  return match.players.some((appearance) => appearance.playerId === playerId)
}

export function countPlayerMatches(matches: Match[], playerId: string): number {
  return matches.filter((match) => matchInvolvesPlayer(match, playerId)).length
}
