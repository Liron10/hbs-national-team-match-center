import type { DerivedMatchBucket, Match, MatchFilter, MatchStatus } from '../types'
import { isBeforeJerusalemDay, isSameJerusalemDay, isTomorrowJerusalem } from './datetime'
import { isStartingSoon } from './countdown'

export function isLiveStatus(status: MatchStatus): boolean {
  return status === 'live' || status === 'halftime'
}

export function deriveBucket(match: Match, now = new Date()): DerivedMatchBucket {
  if (isLiveStatus(match.status)) return 'live'
  if (match.status === 'finished') return 'finished'
  if (match.status === 'postponed' || match.status === 'cancelled') return 'other'
  if (isSameJerusalemDay(match.kickoff, now)) return 'today'
  if (isBeforeJerusalemDay(match.kickoff, now) && match.status === 'scheduled') {
    return 'upcoming'
  }
  if (new Date(match.kickoff) > now) return 'upcoming'
  return 'upcoming'
}

export function displayStatus(match: Match, now = new Date()): MatchStatus | 'today' | 'tomorrow' | 'soon' {
  if (match.status !== 'scheduled') return match.status
  if (isStartingSoon(match.kickoff, now)) return 'soon'
  if (isSameJerusalemDay(match.kickoff, now)) return 'today'
  if (isTomorrowJerusalem(match.kickoff, now)) return 'tomorrow'
  return 'scheduled'
}

export function matchesFilter(match: Match, filter: MatchFilter, now = new Date()): boolean {
  if (match.status === 'postponed' || match.status === 'cancelled') {
    return filter === 'all'
  }
  if (filter === 'all') return true
  if (filter === 'live') return isLiveStatus(match.status)
  if (filter === 'today') return isSameJerusalemDay(match.kickoff, now)
  if (filter === 'upcoming') {
    return match.status === 'scheduled' && new Date(match.kickoff).getTime() > now.getTime()
  }
  return match.status === 'finished'
}

export function splitMatchBoard(matches: Match[], now = new Date()): { open: Match[]; finished: Match[] } {
  const open: Match[] = []
  const finished: Match[] = []
  for (const match of matches) {
    if (deriveBucket(match, now) === 'finished') finished.push(match)
    else open.push(match)
  }
  return { open, finished }
}

export function hasLiveMatches(matches: Match[], now = new Date()): boolean {
  return matches.some((match) => deriveBucket(match, now) === 'live')
}
