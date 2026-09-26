import type { Match } from '../types'
import { players } from '../data/players'
import { isOnThePitch } from './appearanceCopy'
import { remainingMs } from './countdown'
import { isSameJerusalemDay } from './datetime'
import {
  liveOnPitchLines,
  nextMatchLine,
  remainingCopy,
  stillInWindowNames,
  tonightKickoffLines,
  tonightLineupCounts,
  tonightSlate,
  uniqueTonightNames,
  windowStillOpen,
} from './fanDay'
import { isLiveStatus } from './matchStatus'

export function nextScheduledMatch(matches: Match[], now = new Date()): Match | undefined {
  return [...matches]
    .filter((match) => match.status === 'scheduled' && remainingMs(match.kickoff, now) > 0)
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())[0]
}

export interface BoardPulse {
  text: string
  live: boolean
  lines?: string[]
}

export function boardPulse(matches: Match[], now = new Date()): BoardPulse {
  const liveMatches = matches.filter((match) => isLiveStatus(match.status))
  if (liveMatches.length > 0) {
    const onPitchAppearances = liveMatches.flatMap((match) =>
      match.players.filter((appearance) => isOnThePitch(appearance, match.status)),
    )
    const onPitchMatches = liveMatches.map((match) => ({
      ...match,
      players: match.players.filter((appearance) => isOnThePitch(appearance, match.status)),
    }))
    const inSquad = liveMatches.reduce((count, match) => count + match.players.length, 0)
    if (onPitchAppearances.length === 1) {
      return {
        text: 'נציג של הפועל באר שבע משחק כעת',
        live: true,
        lines: liveOnPitchLines(onPitchMatches),
      }
    }
    if (onPitchAppearances.length > 1) {
      return {
        text: `${onPitchAppearances.length} נציגים של הפועל באר שבע משחקים כעת`,
        live: true,
        lines: liveOnPitchLines(onPitchMatches),
      }
    }
    if (inSquad === 1) return { text: 'נציג בסגל במשחק שמתקיים עכשיו', live: true }
    if (inSquad > 1) return { text: `${inSquad} נציגים בסגל במשחק שמתקיים עכשיו`, live: true }
    return {
      text: liveMatches.length === 1 ? 'משחק אחד מתקיים עכשיו' : `${liveMatches.length} משחקים מתקיימים עכשיו`,
      live: true,
    }
  }

  const tonight = tonightSlate(matches, now)
  const upcomingTonight = tonight.filter((match) => match.status === 'scheduled')
  const finishedTonight = tonight.filter((match) => match.status === 'finished')
  const names = uniqueTonightNames(tonight)
  const { starters, bench } = tonightLineupCounts(tonight)

  if (tonight.length >= 2 && starters + bench > 0 && upcomingTonight.length > 0) {
    if (starters > 0 && bench > 0) {
      return { text: `${starters} בהרכב • ${bench} על הספסל`, live: false }
    }
    if (starters === 1) return { text: 'נציג אחד פותח הערב בהרכב', live: false }
    if (starters > 1) return { text: `${starters} נציגים פותחים הערב בהרכב`, live: false }
  }

  if (names.length >= 5 && upcomingTonight.length > 0) {
    return { text: `יום נבחרות עמוס: ${names.length} נציגים של הפועל באר שבע`, live: false }
  }

  if (tonight.length >= 2 && upcomingTonight.length > 0 && finishedTonight.length === 0) {
    return {
      text: `הערב: ${names.length} נציגים של הפועל באר שבע בנבחרות`,
      live: false,
      lines: tonightKickoffLines(upcomingTonight),
    }
  }

  if (finishedTonight.length > 0 && upcomingTonight.length > 0) {
    const remaining = remainingCopy(upcomingTonight)
    if (remaining) return { text: remaining, live: false }
  }

  if (tonight.length > 0 && upcomingTonight.length === 0 && finishedTonight.length > 0) {
    const next = nextScheduledMatch(matches, now)
    const still = stillInWindowNames(matches, now)
    const lines: string[] = []
    if (next) lines.push(nextMatchLine(next, now))
    if (still.length > 0 && next) lines.push(`עדיין במשחקי הנבחרות: ${still.join(', ')}`)
    return {
      text: 'נציגי הפועל באר שבע סיימו את משחקיהם להיום',
      live: false,
      lines: lines.length > 0 ? lines : undefined,
    }
  }

  if (!windowStillOpen(matches, now) && matches.some((match) => match.status === 'finished')) {
    return { text: 'חלון הנבחרות הסתיים', live: false }
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
  if (competitionHe.includes('מונדיאל')) return 'מוקדמות המונדיאל'
  return competitionHe
}
