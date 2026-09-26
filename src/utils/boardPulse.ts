import type { Match } from '../types'
import { players } from '../data/players'
import { isOnThePitch } from './appearanceCopy'
import { remainingMs } from './countdown'
import { isSameJerusalemDay } from './datetime'
import { isLiveStatus } from './matchStatus'

export function nextScheduledMatch(matches: Match[], now = new Date()): Match | undefined {
  return [...matches]
    .filter((match) => match.status === 'scheduled' && remainingMs(match.kickoff, now) > 0)
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())[0]
}

export function boardPulse(matches: Match[], now = new Date()): { text: string; live: boolean } {
  const liveMatches = matches.filter((match) => isLiveStatus(match.status))
  if (liveMatches.length > 0) {
    const onPitch = liveMatches.reduce(
      (count, match) =>
        count + match.players.filter((appearance) => isOnThePitch(appearance, match.status)).length,
      0,
    )
    const inSquad = liveMatches.reduce((count, match) => count + match.players.length, 0)
    if (onPitch === 1) return { text: 'נציג אחד משחק עכשיו', live: true }
    if (onPitch > 1) return { text: `${onPitch} נציגים משחקים עכשיו`, live: true }
    if (inSquad === 1) return { text: 'נציג בסגל במשחק שמתקיים עכשיו', live: true }
    if (inSquad > 1) return { text: `${inSquad} נציגים בסגל במשחק שמתקיים עכשיו`, live: true }
    return {
      text: liveMatches.length === 1 ? 'משחק אחד מתקיים עכשיו' : `${liveMatches.length} משחקים מתקיימים עכשיו`,
      live: true,
    }
  }

  const todayCount = matches.filter(
    (match) =>
      match.status !== 'finished' &&
      match.status !== 'postponed' &&
      match.status !== 'cancelled' &&
      isSameJerusalemDay(match.kickoff, now),
  ).length
  const squad = `${players.length} נציגי הפועל באר שבע בנבחרות`
  if (todayCount > 0) {
    return { text: `${squad} • ${todayCount} משחקים היום`, live: false }
  }

  const next = nextScheduledMatch(matches, now)
  if (!next) return { text: squad, live: false }
  const remaining = remainingMs(next.kickoff, now)
  const days = Math.floor(remaining / 86_400_000)
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000)
  if (days >= 1) {
    return { text: `המשחק הבא בעוד ${days} ${days === 1 ? 'יום' : 'ימים'} ו-${hours} שעות`, live: false }
  }
  if (hours >= 1) {
    return { text: `המשחק הבא בעוד ${hours} שעות`, live: false }
  }
  return { text: 'המשחק הבא בקרוב', live: false }
}

export function liveTabTitle(matches: Match[]): string | null {
  const live = matches.find((match) => isLiveStatus(match.status))
  if (!live || live.homeScore == null || live.awayScore == null) return null
  return `🔴 ${live.homeTeam.nameHe} ${live.homeScore}:${live.awayScore} ${live.awayTeam.nameHe} | האדומים בנבחרות`
}

export function competitionBadge(competitionHe: string): string {
  if (competitionHe.includes('עד 21')) return 'מוקדמות יורו U21'
  if (competitionHe.includes('ליגת האומות')) return 'ליגת האומות'
  if (competitionHe.includes('ידידות')) return 'משחק ידידות'
  if (competitionHe.includes('מונדיאל')) return 'מוקדמות מונדיאל'
  return competitionHe
}
