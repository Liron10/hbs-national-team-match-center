import type { Match } from '../types'
import { isStartingSoon } from './countdown'
import { isTomorrowJerusalem } from './datetime'
import { deriveBucket } from './matchStatus'

function rank(match: Match, now: Date): number {
  const bucket = deriveBucket(match, now)
  if (bucket === 'live') return 0
  if (bucket === 'finished') return 6
  if (bucket === 'other') return 7
  if (match.status === 'scheduled' && isStartingSoon(match.kickoff, now)) return 1
  if (bucket === 'today') return 2
  if (isTomorrowJerusalem(match.kickoff, now)) return 3
  return 4
}

export function sortMatches(matches: Match[], now = new Date()): Match[] {
  return [...matches].sort((a, b) => {
    const rankDiff = rank(a, now) - rank(b, now)
    if (rankDiff !== 0) return rankDiff
    const timeA = new Date(a.kickoff).getTime()
    const timeB = new Date(b.kickoff).getTime()
    if (deriveBucket(a, now) === 'finished') return timeB - timeA
    return timeA - timeB
  })
}
