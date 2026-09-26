import type { Match, PlayerAppearance } from '../types'
import { getPlayer } from '../data/players'
import { formatMatchTime, formatOvernightContext, isSameJerusalemDay, jerusalemDayDiff } from './datetime'
import { remainingMs } from './countdown'
import { isLiveStatus } from './matchStatus'
import { displayTeamName } from './matchLine'
import { nationalTeams } from '../data/teams'

export function isTonightMatch(match: Match, now = new Date()): boolean {
  if (match.status === 'postponed' || match.status === 'cancelled') return false
  if (isSameJerusalemDay(match.kickoff, now)) return true
  return jerusalemDayDiff(match.kickoff, now) === 1 && formatOvernightContext(match.kickoff) != null
}

export function tonightSlate(matches: Match[], now = new Date()): Match[] {
  return [...matches]
    .filter((match) => isTonightMatch(match, now))
    .sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff))
}

export function windowStillOpen(matches: Match[], now = new Date()): boolean {
  return matches.some(
    (match) =>
      isLiveStatus(match.status) ||
      (match.status === 'scheduled' && remainingMs(match.kickoff, now) > 0),
  )
}

export function tonightPlayers(matches: Match[]): Array<{ appearance: PlayerAppearance; match: Match }> {
  return matches.flatMap((match) => match.players.map((appearance) => ({ appearance, match })))
}

export function uniqueTonightNames(matches: Match[]): string[] {
  const names: string[] = []
  const seen = new Set<string>()
  for (const { appearance } of tonightPlayers(matches)) {
    const player = getPlayer(appearance.playerId)
    if (!player || seen.has(player.id)) continue
    seen.add(player.id)
    names.push(player.nameHe)
  }
  return names
}

export function lineupPublished(match: Match): boolean {
  return match.players.some(
    (appearance) =>
      appearance.squadStatus === 'starter' ||
      appearance.squadStatus === 'bench' ||
      appearance.squadStatus === 'subbed-in' ||
      appearance.squadStatus === 'subbed-out' ||
      appearance.squadStatus === 'unused',
  )
}

export function tonightLineupCounts(matches: Match[]): { starters: number; bench: number } {
  let starters = 0
  let bench = 0
  for (const { appearance } of tonightPlayers(matches)) {
    if (appearance.squadStatus === 'starter') starters += 1
    if (appearance.squadStatus === 'bench' || appearance.squadStatus === 'unused') bench += 1
  }
  return { starters, bench }
}

export function eveningBadge(match: Match, matches: Match[], now = new Date()): 'first' | 'night' | undefined {
  const slate = tonightSlate(matches, now)
  if (slate.length < 2) return undefined
  const first = slate[0]
  const last = slate[slate.length - 1]
  if (last && match.id === last.id && formatOvernightContext(match.kickoff)) return 'night'
  if (first && match.id === first.id) return 'first'
  return undefined
}

export function tonightKickoffLines(matches: Match[]): string[] {
  const lines: string[] = []
  const seen = new Set<string>()
  for (const match of matches) {
    const time = formatMatchTime(match.kickoff)
    for (const appearance of match.players) {
      const player = getPlayer(appearance.playerId)
      if (!player || seen.has(player.id)) continue
      seen.add(player.id)
      lines.push(`${time} – ${player.nameHe}`)
    }
  }
  return lines.slice(0, 6)
}

export function liveOnPitchLines(matches: Match[]): string[] {
  const lines: string[] = []
  for (const match of matches) {
    for (const appearance of match.players) {
      const player = getPlayer(appearance.playerId)
      if (!player) continue
      const team = nationalTeams[player.nationalTeamCode]
      lines.push(`${player.nameHe} – ${displayTeamName(team)}`)
    }
  }
  return lines
}

export function remainingCopy(remaining: Match[]): string | null {
  if (remaining.length === 0) return null
  const night = remaining.every((match) => formatOvernightContext(match.kickoff))
  if (remaining.length === 1) {
    return night ? 'נותר עוד משחק אחד הלילה' : 'נותר עוד משחק אחד לנציגי הפועל באר שבע'
  }
  return `נותרו עוד ${remaining.length} משחקים לנציגי הפועל באר שבע`
}

export function nextMatchLine(match: Match, now = new Date()): string {
  const player = match.players.map((appearance) => getPlayer(appearance.playerId)?.nameHe).find(Boolean)
  const when = isSameJerusalemDay(match.kickoff, now)
    ? `היום ב-${formatMatchTime(match.kickoff)}`
    : jerusalemDayDiff(match.kickoff, now) === 1
      ? `מחר ב-${formatMatchTime(match.kickoff)}`
      : `${formatMatchTime(match.kickoff)}`
  if (player) return `המשחק הבא: ${player} • ${when}`
  return `המשחק הבא: ${when}`
}

export function stillInWindowNames(matches: Match[], now = new Date()): string[] {
  const names: string[] = []
  const seen = new Set<string>()
  for (const match of matches) {
    const open =
      isLiveStatus(match.status) || (match.status === 'scheduled' && remainingMs(match.kickoff, now) > 0)
    if (!open) continue
    for (const appearance of match.players) {
      const player = getPlayer(appearance.playerId)
      if (!player || seen.has(player.id)) continue
      seen.add(player.id)
      names.push(player.nameHe)
    }
  }
  return names
}

export function dayBrief(matches: Match[], now = new Date()): { title: string; line: string } | null {
  const slate = tonightSlate(matches, now)
  if (slate.length === 0) return null
  if (slate.some((match) => match.status !== 'finished' && match.status !== 'cancelled')) return null

  const seen = new Set<string>()
  let minutes = 0
  let goals = 0
  let assists = 0
  let played = 0
  for (const match of slate) {
    for (const appearance of match.players) {
      if (appearance.played) {
        played += 1
        minutes += appearance.minutes ?? 0
        goals += appearance.goals ?? 0
        assists += appearance.assists ?? 0
      }
      const player = getPlayer(appearance.playerId)
      if (player) seen.add(player.id)
    }
  }
  const parts = [`${seen.size} נציגים שיחקו`]
  if (minutes > 0) parts.push(`${minutes} דקות`)
  if (goals === 1) parts.push('שער אחד')
  else if (goals > 1) parts.push(`${goals} שערים`)
  if (assists === 1) parts.push('בישול אחד')
  else if (assists > 1) parts.push(`${assists} בישולים`)
  return { title: 'סיכום היום', line: parts.join(' · ') }
}

export function livePhaseLabel(match: Match): string {
  if (match.status === 'halftime') return 'מחצית'
  const clock = (match.clock ?? '').trim()
  if (/pen/i.test(clock) || clock === 'פנדלים') return 'פנדלים'
  if (/et|aet|הארכה/i.test(clock) || clock === 'הארכה') {
    return clock && clock !== 'הארכה' ? `הארכה · ${clock}` : 'הארכה'
  }
  return match.clock ? `משחק עכשיו · ${match.clock}` : 'משחק עכשיו'
}
