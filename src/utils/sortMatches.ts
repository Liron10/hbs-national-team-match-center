import type { Match } from '../types'
import { deriveBucket } from './matchStatus'

const bucketRank: Record<string, number> = {
  live: 0,
  today: 1,
  upcoming: 2,
  finished: 3,
  other: 4,
}

export function sortMatches(matches: Match[], now = new Date()): Match[] {
  return [...matches].sort((a, b) => {
    const bucketA = deriveBucket(a, now)
    const bucketB = deriveBucket(b, now)
    const rankDiff = bucketRank[bucketA] - bucketRank[bucketB]
    if (rankDiff !== 0) return rankDiff

    const timeA = new Date(a.kickoff).getTime()
    const timeB = new Date(b.kickoff).getTime()
    if (bucketA === 'finished') return timeB - timeA
    return timeA - timeB
  })
}
