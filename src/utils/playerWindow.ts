import type { Match, PlayerAppearance } from '../types'
import { participationLine } from './appearanceCopy'
import { displayTeamName } from './matchLine'
import { remainingMs } from './countdown'
import { formatFanKickoff } from './datetime'
import { players } from '../data/players'
import { nationalTeams } from '../data/teams'
import { windowStillOpen } from './fanDay'

export interface NamedStat {
  label: string
  value: string
}

export interface PlayerMatchClip {
  matchId: string
  line: string
  detail?: string
}

export interface PlayerWindowProfile {
  appearances: number
  minutes: number
  goals: number
  assists: number
  starts: number
  subs: number
  yellow: number
  red: number
  matches: number
  headlineStats: NamedStat[]
  windowStats: NamedStat[]
  lastMatch?: PlayerMatchClip
  nextMatch?: PlayerMatchClip & { when: string; eta?: string }
  recent: PlayerMatchClip[]
  facts: string[]
  windowDone: boolean
}

function appearanceOf(match: Match, playerId: string): PlayerAppearance | undefined {
  return match.players.find((appearance) => appearance.playerId === playerId)
}

function playerMatches(matches: Match[], playerId: string): Array<{ match: Match; appearance: PlayerAppearance }> {
  return matches
    .map((match) => {
      const appearance = appearanceOf(match, playerId)
      return appearance ? { match, appearance } : null
    })
    .filter((item): item is { match: Match; appearance: PlayerAppearance } => item != null)
    .sort((a, b) => Date.parse(a.match.kickoff) - Date.parse(b.match.kickoff))
}

function scoreline(match: Match): string {
  const home = displayTeamName(match.homeTeam)
  const away = displayTeamName(match.awayTeam)
  if (match.homeScore == null || match.awayScore == null) return `${home} – ${away}`
  return `${home} ${match.homeScore}:${match.awayScore} ${away}`
}

function clipDetail(appearance: PlayerAppearance): string | undefined {
  const parts: string[] = []
  if (appearance.played && appearance.minutes != null && appearance.minutes > 0) {
    parts.push(`${appearance.minutes}'`)
  } else if (appearance.squadStatus === 'unused' || appearance.squadStatus === 'bench') {
    parts.push('לא שותף')
  }
  if ((appearance.goals ?? 0) > 0) parts.push(appearance.goals === 1 ? 'שער' : `${appearance.goals} שערים`)
  if ((appearance.assists ?? 0) > 0) parts.push(appearance.assists === 1 ? 'בישול' : `${appearance.assists} בישולים`)
  return parts.length > 0 ? parts.join(' • ') : undefined
}

function pushStat(stats: NamedStat[], value: number, label: string) {
  if (value > 0) stats.push({ label, value: String(value) })
}

function playerFacts(
  completed: Array<{ match: Match; appearance: PlayerAppearance }>,
  played: Array<{ match: Match; appearance: PlayerAppearance }>,
  minutes: number,
  hasNext: boolean,
): string[] {
  const facts: string[] = []
  const possible = completed.length * 90
  if (minutes > 0 && possible > 0) {
    facts.push(`שיחק ${minutes} מתוך ${possible} דקות אפשריות`)
  }

  const recentFive = [...completed].reverse().slice(0, 5)
  const recentStarts = recentFive.filter(
    (row) => row.appearance.started || row.appearance.squadStatus === 'starter' || row.appearance.squadStatus === 'subbed-out',
  ).length
  if (recentFive.length >= 3 && recentStarts > 0) {
    facts.push(`פתח בהרכב ב-${recentStarts} מתוך ${recentFive.length} המשחקים האחרונים`)
  }

  let startStreak = 0
  for (const row of [...played].reverse()) {
    const started = row.appearance.started || row.appearance.squadStatus === 'starter' || row.appearance.squadStatus === 'subbed-out'
    if (!started) break
    startStreak += 1
  }
  if (startStreak >= 3) facts.push(`פתח ב-${startStreak} משחקים רצופים בנבחרת`)

  let playStreak = 0
  for (const row of [...completed].reverse()) {
    if (!row.appearance.played) break
    playStreak += 1
  }
  if (playStreak >= 3) facts.push(`שותף ב-${playStreak} משחקים רצופים`)

  if (!hasNext && completed.length > 0) {
    facts.unshift('סיים את משחקיו בנבחרת')
  }

  return facts
}

function isCompletedMatch(match: Match): boolean {
  return match.status === 'finished'
}

export function playerWindowProfile(playerId: string, matches: Match[], now = new Date()): PlayerWindowProfile {
  const rows = playerMatches(matches, playerId)
  const completed = rows.filter((row) => isCompletedMatch(row.match))
  const played = completed.filter((row) => row.appearance.played)
  const minutes = played.reduce((sum, row) => sum + (row.appearance.minutes ?? 0), 0)
  const goals = completed.reduce((sum, row) => sum + (row.appearance.goals ?? 0), 0)
  const assists = completed.reduce((sum, row) => sum + (row.appearance.assists ?? 0), 0)
  const starts = played.filter((row) => row.appearance.started || row.appearance.squadStatus === 'starter').length
  const subs = played.filter((row) => row.appearance.squadStatus === 'subbed-in').length
  const yellow = completed.reduce((sum, row) => sum + (row.appearance.yellowCards ?? 0), 0)
  const red = completed.reduce((sum, row) => sum + (row.appearance.redCards ?? 0), 0)

  const headlineStats: NamedStat[] = []
  pushStat(headlineStats, played.length, 'הופעות')
  pushStat(headlineStats, minutes, 'דקות')
  pushStat(headlineStats, goals, 'שערים')
  pushStat(headlineStats, assists, 'בישולים')

  const windowStats: NamedStat[] = []
  pushStat(windowStats, completed.length, 'משחקים ששוחקו')
  pushStat(windowStats, minutes, 'דקות')
  pushStat(windowStats, starts, 'משחקים שפתח בהרכב')
  pushStat(windowStats, subs, 'כניסות כמחליף')
  pushStat(windowStats, goals, 'שערים')
  pushStat(windowStats, assists, 'בישולים')

  const finished = [...rows].filter((row) => row.match.status === 'finished').reverse()
  const last = finished[0]
  const next = rows.find((row) => row.match.status === 'scheduled' && remainingMs(row.match.kickoff, now) > 0)
  const recent = finished.slice(0, 5).map((row) => ({
    matchId: row.match.id,
    line: scoreline(row.match),
    detail: clipDetail(row.appearance),
  }))
  const windowDone = !next
  const facts = playerFacts(completed, played, minutes, Boolean(next))
  if (next && rows.filter((row) => row.match.status === 'scheduled').length === 1) {
    facts.unshift('המשחק האחרון בפגרה')
  }

  return {
    appearances: played.length,
    minutes,
    goals,
    assists,
    starts,
    subs,
    yellow,
    red,
    matches: completed.length,
    headlineStats,
    windowStats,
    lastMatch: last
      ? { matchId: last.match.id, line: scoreline(last.match), detail: clipDetail(last.appearance) }
      : undefined,
    nextMatch: next
      ? {
          matchId: next.match.id,
          line: `${displayTeamName(next.match.homeTeam)} – ${displayTeamName(next.match.awayTeam)}`,
          when: formatFanKickoff(next.match.kickoff, now, next.match.status).primary,
          detail: participationLine(next.appearance, next.match.status) || undefined,
        }
      : undefined,
    recent,
    facts,
    windowDone,
  }
}

export function windowBoardStats(matches: Match[]): NamedStat[] {
  const stats: NamedStat[] = [{ label: 'שחקנים', value: String(players.length) }]
  const completed = matches.filter((match) => isCompletedMatch(match))
  const minutes = completed.reduce(
    (sum, match) =>
      sum + match.players.reduce((inner, appearance) => inner + (appearance.played ? appearance.minutes ?? 0 : 0), 0),
    0,
  )
  const goals = completed.reduce(
    (sum, match) => sum + match.players.reduce((inner, appearance) => inner + (appearance.goals ?? 0), 0),
    0,
  )
  const assists = completed.reduce(
    (sum, match) => sum + match.players.reduce((inner, appearance) => inner + (appearance.assists ?? 0), 0),
    0,
  )
  pushStat(stats, minutes, 'דקות')
  pushStat(stats, completed.length, 'משחקים ששוחקו')
  pushStat(stats, goals, 'שערים')
  pushStat(stats, assists, 'בישולים')
  const teamCodes = new Set(players.map((player) => player.nationalTeamCode))
  stats.push({ label: 'נבחרות', value: String(teamCodes.size) })
  return stats
}

export interface WindowBoardView {
  stats: NamedStat[]
  teamLine: string
  closed: boolean
  notes: string[]
}

export function windowBoardView(matches: Match[], now = new Date()): WindowBoardView {
  const stats = windowBoardStats(matches)
  const counts = new Map<string, number>()
  for (const player of players) {
    const name = displayTeamName(nationalTeams[player.nationalTeamCode])
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  const teamLine = [...counts.entries()].map(([name, count]) => `${name} ×${count}`).join(' · ')
  const closed = !windowStillOpen(matches, now)
  const notes: string[] = []
  const minutesByPlayer = new Map<string, { name: string; minutes: number; starts: number; goals: number; assists: number }>()
  for (const match of matches.filter((item) => isCompletedMatch(item))) {
    for (const appearance of match.players) {
      const player = players.find((item) => item.id === appearance.playerId)
      if (!player) continue
      const current = minutesByPlayer.get(player.id) ?? {
        name: player.nameHe,
        minutes: 0,
        starts: 0,
        goals: 0,
        assists: 0,
      }
      if (appearance.played) current.minutes += appearance.minutes ?? 0
      if (appearance.started || appearance.squadStatus === 'starter' || appearance.squadStatus === 'subbed-out') {
        if (appearance.played) current.starts += 1
      }
      current.goals += appearance.goals ?? 0
      current.assists += appearance.assists ?? 0
      minutesByPlayer.set(player.id, current)
    }
  }
  const rows = [...minutesByPlayer.values()]
  const scorers = rows.filter((row) => row.goals > 0).sort((a, b) => b.goals - a.goals)
  const assisters = rows.filter((row) => row.assists > 0).sort((a, b) => b.assists - a.assists)
  if (scorers.length > 0) {
    notes.push(`כובשי השערים בפגרה · ${scorers.map((row) => `${row.name} ${row.goals}`).join(' · ')}`)
  }
  if (assisters.length > 0) {
    notes.push(`בישולים בפגרה · ${assisters.map((row) => `${row.name} ${row.assists}`).join(' · ')}`)
  }
  if (closed && rows.length > 0) {
    const mostMinutes = [...rows].sort((a, b) => b.minutes - a.minutes)[0]
    const mostStarts = [...rows].sort((a, b) => b.starts - a.starts)[0]
    if (mostMinutes && mostMinutes.minutes > 0) {
      notes.push(`הכי הרבה דקות בפגרה · ${mostMinutes.name} · ${mostMinutes.minutes} דקות`)
    }
    if (mostStarts && mostStarts.starts > 0) {
      notes.push(`הכי הרבה הופעות בהרכב · ${mostStarts.name} · ${mostStarts.starts}`)
    }
  }
  return { stats, teamLine, closed, notes }
}
