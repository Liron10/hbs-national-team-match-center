import { fotmobTeamId } from '../data/fotmobIds'
import type { CountryCode, Match, MatchStatus } from '../types'

export const liveTeamAbbr: Record<CountryCode, string> = {
  ISR: 'ISR',
  'ISR-U21': 'ISR',
  AUT: 'AUT',
  BGR: 'BUL',
  IRL: 'IRL',
  XKX: 'KOS',
  LUX: 'LUX',
  EST: 'EST',
  ISL: 'ISL',
  PER: 'PER',
  JAM: 'JAM',
  GTM: 'GUA',
  HON: 'HON',
  SLV: 'SLV',
  USA: 'USA',
  MEX: 'MEX',
  CAN: 'CAN',
  COL: 'COL',
  SVN: 'SVN',
  NOR: 'NOR',
}

export interface LiveScoreSnapshot {
  homeAbbr: string
  awayAbbr: string
  homeTeamId?: number
  awayTeamId?: number
  sourceMatchId?: number
  kickoff: string
  status: MatchStatus
  homeScore: number | null
  awayScore: number | null
  clock?: string
}

const LIVE_WINDOW_BEFORE_MS = 90 * 60 * 1000
const LIVE_WINDOW_AFTER_MS = 3.5 * 60 * 60 * 1000

export const espnAbbreviation = liveTeamAbbr

export function mapApiFootballStatus(
  short: string,
  elapsed?: number | null,
): { status: MatchStatus; clock?: string; scoresReady: boolean } {
  const code = short.toUpperCase()
  if (code === 'PST') return { status: 'postponed', scoresReady: false }
  if (code === 'CANC' || code === 'ABD' || code === 'AWD' || code === 'WO') {
    return { status: 'cancelled', scoresReady: false }
  }
  if (code === 'FT' || code === 'AET' || code === 'PEN') {
    return { status: 'finished', scoresReady: true }
  }
  if (code === 'HT') {
    return { status: 'halftime', clock: 'HT', scoresReady: true }
  }
  if (['1H', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT', 'BREAK'].includes(code)) {
    return {
      status: 'live',
      clock: elapsed != null ? `${elapsed}'` : undefined,
      scoresReady: true,
    }
  }
  return { status: 'scheduled', scoresReady: false }
}

export function mapFootballDataStatus(
  status: string,
  minute?: number | null,
): { status: MatchStatus; clock?: string; scoresReady: boolean } {
  const code = status.toUpperCase()
  if (code === 'POSTPONED') return { status: 'postponed', scoresReady: false }
  if (code === 'CANCELLED' || code === 'SUSPENDED') return { status: 'cancelled', scoresReady: false }
  if (code === 'FINISHED' || code === 'AWARDED') return { status: 'finished', scoresReady: true }
  if (code === 'PAUSED') return { status: 'halftime', clock: 'HT', scoresReady: true }
  if (code === 'IN_PLAY' || code === 'LIVE' || code === 'EXTRA_TIME' || code === 'PENALTY_SHOOTOUT') {
    return {
      status: 'live',
      clock: minute != null ? `${minute}'` : undefined,
      scoresReady: true,
    }
  }
  return { status: 'scheduled', scoresReady: false }
}

export function espnLeagueForMatch(match: Match): string {
  if (match.homeTeam.code === 'ISR-U21' || match.awayTeam.code === 'ISR-U21') {
    return 'uefa.euro_u21_qual'
  }
  if (match.competitionHe.includes('קונקקאף')) return 'concacaf.nations.league'
  if (match.competitionHe.includes('ידידות')) return 'fifa.friendly'
  return 'uefa.nations'
}

export function espnDateKeys(iso: string): string[] {
  const utc = iso.slice(0, 10).replaceAll('-', '')
  const jerusalem = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(new Date(iso))
    .replaceAll('-', '')
  return [...new Set([utc, jerusalem])]
}

export function isoDateKeys(iso: string): string[] {
  return espnDateKeys(iso).map((key) => `${key.slice(0, 4)}-${key.slice(4, 6)}-${key.slice(6, 8)}`)
}

export function isInLiveWindow(match: Match, now = new Date()): boolean {
  if (match.status === 'postponed' || match.status === 'cancelled') return false
  if (match.status === 'live' || match.status === 'halftime') return true
  const kickoff = new Date(match.kickoff).getTime()
  const t = now.getTime()
  return t >= kickoff - LIVE_WINDOW_BEFORE_MS && t <= kickoff + LIVE_WINDOW_AFTER_MS
}

export function mapEspnStatus(
  type: { name?: string; state?: string; completed?: boolean },
  displayClock?: string,
): { status: MatchStatus; clock?: string; scoresReady: boolean } {
  const name = type.name ?? ''
  const state = type.state ?? 'pre'
  if (/POSTPONE/i.test(name)) return { status: 'postponed', scoresReady: false }
  if (/CANCEL/i.test(name)) return { status: 'cancelled', scoresReady: false }
  if (type.completed || state === 'post') {
    return { status: 'finished', scoresReady: true }
  }
  if (state === 'in' || /IN_PROGRESS|FIRST_HALF|SECOND_HALF|HALFTIME|EXTRA/i.test(name)) {
    const halftime = /HALFTIME/i.test(name)
    return {
      status: halftime ? 'halftime' : 'live',
      clock: displayClock && displayClock !== "0'" ? displayClock : undefined,
      scoresReady: true,
    }
  }
  return { status: 'scheduled', scoresReady: false }
}

export function snapshotMatchesFixture(match: Match, snapshot: LiveScoreSnapshot): boolean {
  const homeId = fotmobTeamId[match.homeTeam.code]
  const awayId = fotmobTeamId[match.awayTeam.code]
  if (snapshot.homeTeamId != null && snapshot.awayTeamId != null && homeId && awayId) {
    if (snapshot.homeTeamId !== homeId || snapshot.awayTeamId !== awayId) return false
  } else {
    const home = liveTeamAbbr[match.homeTeam.code]
    const away = liveTeamAbbr[match.awayTeam.code]
    if (snapshot.homeAbbr !== home || snapshot.awayAbbr !== away) return false
  }
  const delta = Math.abs(new Date(snapshot.kickoff).getTime() - new Date(match.kickoff).getTime())
  return delta <= 36 * 60 * 60 * 1000
}

export function applyLiveSnapshots(matches: Match[], snapshots: LiveScoreSnapshot[], now = new Date()): Match[] {
  if (snapshots.length === 0) return matches
  const stamp = now.toISOString()

  return matches.map((match) => {
    const snapshot = snapshots.find((item) => snapshotMatchesFixture(match, item))
    if (!snapshot) return match

    const withId =
      snapshot.sourceMatchId != null ? { ...match, providerMatchId: snapshot.sourceMatchId } : match

    if (snapshot.status === 'scheduled') return withId

    return {
      ...withId,
      status: snapshot.status,
      homeScore: snapshot.homeScore,
      awayScore: snapshot.awayScore,
      clock: snapshot.clock,
      lastUpdated: stamp,
    }
  })
}
