import type { Match, PlayerAppearance } from '../types'
import { displayTeamName } from './matchLine'
import { remainingMs } from './countdown'
import { formatFanKickoff } from './datetime'
import { players } from '../data/players'

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

export function playerWindowProfile(playerId: string, matches: Match[], now = new Date()): PlayerWindowProfile {
  const rows = playerMatches(matches, playerId)
  const played = rows.filter((row) => row.appearance.played)
  const minutes = played.reduce((sum, row) => sum + (row.appearance.minutes ?? 0), 0)
  const goals = rows.reduce((sum, row) => sum + (row.appearance.goals ?? 0), 0)
  const assists = rows.reduce((sum, row) => sum + (row.appearance.assists ?? 0), 0)
  const starts = rows.filter((row) => row.appearance.started || row.appearance.squadStatus === 'starter').length
  const subs = rows.filter((row) => row.appearance.squadStatus === 'subbed-in').length
  const yellow = rows.reduce((sum, row) => sum + (row.appearance.yellowCards ?? 0), 0)
  const red = rows.reduce((sum, row) => sum + (row.appearance.redCards ?? 0), 0)

  const headlineStats: NamedStat[] = []
  pushStat(headlineStats, played.length, 'הופעות')
  pushStat(headlineStats, minutes, 'דקות')
  pushStat(headlineStats, goals, 'שערים')
  pushStat(headlineStats, assists, 'בישולים')
  pushStat(headlineStats, starts, 'פתיחות בהרכב')
  pushStat(headlineStats, subs, 'כניסות כמחליף')
  pushStat(headlineStats, yellow, 'כרטיסים צהובים')
  pushStat(headlineStats, red, 'כרטיסים אדומים')

  const windowStats: NamedStat[] = []
  pushStat(windowStats, rows.length, 'משחקים')
  pushStat(windowStats, minutes, 'דקות')
  pushStat(windowStats, starts, 'פתיחות')
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

  return {
    appearances: played.length,
    minutes,
    goals,
    assists,
    starts,
    subs,
    yellow,
    red,
    matches: rows.length,
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
        }
      : undefined,
    recent,
  }
}

export function windowBoardStats(matches: Match[]): NamedStat[] {
  const stats: NamedStat[] = [{ label: 'שחקנים', value: String(players.length) }]
  const minutes = matches.reduce(
    (sum, match) =>
      sum + match.players.reduce((inner, appearance) => inner + (appearance.played ? appearance.minutes ?? 0 : 0), 0),
    0,
  )
  const starts = matches.reduce(
    (sum, match) =>
      sum +
      match.players.filter((appearance) => appearance.started || appearance.squadStatus === 'starter').length,
    0,
  )
  const goals = matches.reduce(
    (sum, match) => sum + match.players.reduce((inner, appearance) => inner + (appearance.goals ?? 0), 0),
    0,
  )
  const assists = matches.reduce(
    (sum, match) => sum + match.players.reduce((inner, appearance) => inner + (appearance.assists ?? 0), 0),
    0,
  )
  pushStat(stats, minutes, 'דקות')
  pushStat(stats, starts, 'הופעות בהרכב')
  pushStat(stats, goals, 'שערים')
  pushStat(stats, assists, 'בישולים')
  return stats
}
