import type { Match, MatchStatus, PlayerAppearance, SquadStatus } from '../types'
import { fotmobPlayerId } from '../data/fotmobIds'
import { footballGet } from '../services/football/client'
import { mapFotmobStatus, type FotmobStatus } from '../services/football/fotmob'
import { isInLiveWindow } from './liveScores'

export const FIXED_STAT_LABELS = [
  'דקות משחק',
  'שערים',
  'בישולים',
  'כרטיסים צהובים',
  'כרטיסים אדומים',
  'ציון',
  'מסירות מדויקות',
  'בעיטות',
  'בעיטות למסגרת',
  'תיקולים',
] as const

interface FotmobLinePlayer {
  id?: number | string
  name?: string
  firstName?: string
  lastName?: string
  performance?: {
    rating?: number
    events?: Array<{ type?: string }>
    substitutionEvents?: Array<{ time?: number; type?: string }>
  }
}

interface FotmobStatValue {
  key?: string | null
  stat?: { value?: number; total?: number; type?: string }
}

interface FotmobPlayerStats {
  stats?: Array<{ key?: string; stats?: Record<string, FotmobStatValue> }>
}

interface FotmobMatchEvent {
  type?: string
  ownGoal?: boolean | null
  player?: { id?: number | string; name?: string }
  playerId?: number | string
  nameStr?: string
  fullName?: string
  firstName?: string
  lastName?: string
  assistPlayerId?: number | string
  assistStr?: string
}

interface FotmobMatchDetails {
  header?: {
    teams?: Array<{ score?: number | null }>
    status?: FotmobStatus
  }
  content?: {
    lineup?: {
      homeTeam?: { starters?: FotmobLinePlayer[]; subs?: FotmobLinePlayer[]; unavailable?: FotmobLinePlayer[] }
      awayTeam?: { starters?: FotmobLinePlayer[]; subs?: FotmobLinePlayer[]; unavailable?: FotmobLinePlayer[] }
    }
    playerStats?: Record<string, FotmobPlayerStats> | null
    matchFacts?: { events?: { events?: FotmobMatchEvent[] } }
  }
}

function allStatEntries(
  payload: FotmobPlayerStats | undefined,
): Array<FotmobStatValue & { title: string }> {
  return (
    payload?.stats?.flatMap((group) =>
      Object.entries(group.stats ?? {}).map(([title, entry]) => ({ ...entry, title })),
    ) ?? []
  )
}

function statByKey(payload: FotmobPlayerStats | undefined, key: string): FotmobStatValue | undefined {
  const needle = key.toLowerCase()
  return allStatEntries(payload).find(
    (entry) => entry.key === key || entry.title.toLowerCase() === needle,
  )
}

function statNumber(payload: FotmobPlayerStats | undefined, keys: string | string[]): number {
  for (const key of Array.isArray(keys) ? keys : [keys]) {
    const value = statByKey(payload, key)?.stat?.value
    if (typeof value === 'number' && Number.isFinite(value)) return value
  }
  return 0
}

function statFraction(payload: FotmobPlayerStats | undefined, key: string): string {
  const entry = statByKey(payload, key)
  const value = entry?.stat?.value
  const total = entry?.stat?.total
  if (typeof value !== 'number') return '0'
  if (typeof total === 'number') return `${value}/${total}`
  return String(value)
}

function samePlayerId(player: FotmobLinePlayer | undefined, fotmobId: number): boolean {
  if (player?.id == null) return false
  const id = Number(player.id)
  return Number.isFinite(id) && id === fotmobId
}

function eventsOf(player: FotmobLinePlayer | undefined) {
  const sub = player?.performance?.substitutionEvents ?? []
  const cards = player?.performance?.events ?? []
  return {
    subIn: sub.find((item) => item.type === 'subIn')?.time,
    subOut: sub.find((item) => item.type === 'subOut')?.time,
    yellow: cards.filter((item) => item.type === 'yellowCard').length,
    red: cards.filter((item) => /red/i.test(item.type ?? '')).length,
    rating: player?.performance?.rating,
  }
}

function eventNames(event: FotmobMatchEvent): string[] {
  return [event.player?.name, event.nameStr, event.fullName, [event.firstName, event.lastName].filter(Boolean).join(' ')]
    .map((name) => name?.trim().toLowerCase())
    .filter((name): name is string => Boolean(name))
}

function linePlayerNames(player: FotmobLinePlayer | undefined): string[] {
  if (!player) return []
  return [player.name, [player.firstName, player.lastName].filter(Boolean).join(' ')]
    .map((name) => name?.trim().toLowerCase())
    .filter((name): name is string => Boolean(name))
}

function eventBelongsToPlayer(event: FotmobMatchEvent, fotmobId: number, linePlayer: FotmobLinePlayer | undefined): boolean {
  const rawId = event.player?.id ?? event.playerId
  const id = Number(rawId)
  if (Number.isFinite(id) && id > 0) return id === fotmobId
  const names = new Set(linePlayerNames(linePlayer))
  if (names.size === 0) return false
  return eventNames(event).some((name) => names.has(name))
}

function matchFactTotals(details: FotmobMatchDetails, fotmobId: number, linePlayer: FotmobLinePlayer | undefined) {
  const events = details.content?.matchFacts?.events?.events ?? []
  let goals = 0
  let assists = 0
  for (const event of events) {
    if (event.type === 'Goal' && !event.ownGoal && eventBelongsToPlayer(event, fotmobId, linePlayer)) {
      goals += 1
    }
    const assistId = Number(event.assistPlayerId)
    if (event.type === 'Goal' && Number.isFinite(assistId) && assistId > 0 && assistId === fotmobId) {
      assists += 1
    }
  }
  return { goals, assists }
}

export function buildFixedStats(input: {
  minutes: number
  goals: number
  assists: number
  yellow: number
  red: number
  rating?: number
  passes: string
  shots: number
  shotsOnTarget: number
  tackles: number
}): Array<{ label: string; value: string }> {
  const rating =
    typeof input.rating === 'number' && Number.isFinite(input.rating) ? input.rating.toFixed(2) : '—'
  const values = [
    String(input.minutes),
    String(input.goals),
    String(input.assists),
    String(input.yellow),
    String(input.red),
    rating,
    input.passes,
    String(input.shots),
    String(input.shotsOnTarget),
    String(input.tackles),
  ]
  return FIXED_STAT_LABELS.map((label, index) => ({ label, value: values[index] ?? '0' }))
}

export function appearanceFromProvider(
  playerId: string,
  fotmobId: number,
  details: FotmobMatchDetails,
  matchStatus: MatchStatus,
  previous?: PlayerAppearance,
): PlayerAppearance {
  const lineup = details.content?.lineup
  const sides = [lineup?.homeTeam, lineup?.awayTeam]
  const starter = sides.flatMap((side) => side?.starters ?? []).find((player) => samePlayerId(player, fotmobId))
  const sub = sides.flatMap((side) => side?.subs ?? []).find((player) => samePlayerId(player, fotmobId))
  const unavailable = sides.flatMap((side) => side?.unavailable ?? []).find((player) => samePlayerId(player, fotmobId))
  const linePlayer = starter ?? sub
  const statsPayload = details.content?.playerStats?.[String(fotmobId)]
  const events = eventsOf(linePlayer)
  const facts = matchFactTotals(details, fotmobId, linePlayer)
  let minutes = statNumber(statsPayload, ['minutes_played', 'Minutes played'])
  if (!minutes && events.subOut != null) {
    minutes = events.subIn != null ? Math.max(0, events.subOut - events.subIn) : events.subOut
  }
  const goals = statNumber(statsPayload, 'goals') || facts.goals
  const assists = statNumber(statsPayload, 'assists') || facts.assists
  const rating = statByKey(statsPayload, 'rating_title')?.stat?.value ?? events.rating
  const finished = matchStatus === 'finished'
  const inPlay = matchStatus === 'live' || matchStatus === 'halftime' || finished
  if (!minutes && finished && starter && events.subOut == null) minutes = 90
  if (!minutes && finished && sub && events.subIn != null && events.subOut == null) {
    minutes = Math.max(1, 90 - events.subIn)
  }

  if (!starter && !sub && !unavailable) {
    return previous ?? { playerId, squadStatus: finished ? 'not-in-squad' : 'unknown', stats: [] }
  }

  let squadStatus: SquadStatus = finished ? 'not-in-squad' : 'unknown'
  if (unavailable && !linePlayer) squadStatus = 'not-in-squad'
  else if (starter) squadStatus = events.subOut != null ? 'subbed-out' : 'starter'
  else if (sub && (events.subIn != null || minutes > 0)) squadStatus = 'subbed-in'
  else if (sub) squadStatus = finished ? 'unused' : 'bench'

  const played =
    minutes > 0 ||
    events.subIn != null ||
    (!finished && inPlay && Boolean(starter))

  return {
    playerId,
    squadStatus,
    started: Boolean(starter),
    played,
    minutes,
    goals,
    assists,
    yellowCards: events.yellow,
    redCards: events.red,
    subbedInMinute: events.subIn,
    subbedOutMinute: events.subOut,
    stats: played
      ? buildFixedStats({
          minutes,
          goals,
          assists,
          yellow: events.yellow,
          red: events.red,
          rating: typeof rating === 'number' ? rating : undefined,
          passes: statFraction(statsPayload, 'accurate_passes'),
          shots: statNumber(statsPayload, ['total_shots', 'shots']),
          shotsOnTarget: statNumber(statsPayload, ['ShotsOnTarget', 'shots_on_target', 'on_target']),
          tackles: statNumber(statsPayload, [
            'matchstats.headers.tackles',
            'tackles_succeeded',
            'WonTackle',
            'tackles',
            'won_tackle',
            'Tackles',
          ]),
        })
      : [],
  }
}

export function mergeMatchAppearances(match: Match, details: FotmobMatchDetails): Match {
  return {
    ...match,
    players: match.players.map((appearance) => {
      const fotmobId = fotmobPlayerId[appearance.playerId]
      if (!fotmobId) return appearance
      return appearanceFromProvider(appearance.playerId, fotmobId, details, match.status, appearance)
    }),
  }
}

export function applyMatchDetailsOverlay(match: Match, details: FotmobMatchDetails, now = new Date()): Match {
  const mapped = details.header?.status ? mapFotmobStatus(details.header.status) : null
  const homeScore = details.header?.teams?.[0]?.score
  const awayScore = details.header?.teams?.[1]?.score
  const withStatus =
    mapped && mapped.status !== 'scheduled'
      ? {
          ...match,
          status: mapped.status,
          homeScore: mapped.scoresReady && typeof homeScore === 'number' ? homeScore : match.homeScore,
          awayScore: mapped.scoresReady && typeof awayScore === 'number' ? awayScore : match.awayScore,
          clock: mapped.clock ?? match.clock,
          lastUpdated: now.toISOString(),
        }
      : match

  const merged = mergeMatchAppearances(withStatus, details)
  if (JSON.stringify(merged.players) === JSON.stringify(match.players) && merged.status === match.status) {
    return merged
  }
  return { ...merged, lastUpdated: now.toISOString() }
}

export function shouldEnrichAppearances(
  match: Match,
  now = new Date(),
  inPlayOnly = false,
): boolean {
  if (match.providerMatchId == null) return false
  if (match.status === 'postponed' || match.status === 'cancelled') return false
  if (match.status === 'live' || match.status === 'halftime') return true
  if (inPlayOnly) return match.status === 'scheduled' && isInLiveWindow(match, now)
  if (match.status === 'finished') return true
  return match.status === 'scheduled' && isInLiveWindow(match, now)
}

export async function enrichMatchAppearances(
  matches: Match[],
  now = new Date(),
  inPlayOnly = false,
): Promise<Match[]> {
  return Promise.all(
    matches.map(async (match) => {
      if (!shouldEnrichAppearances(match, now, inPlayOnly)) return match
      try {
        const details = await footballGet<FotmobMatchDetails>(
          `/data/matchDetails?matchId=${match.providerMatchId}`,
        )
        return applyMatchDetailsOverlay(match, details, now)
      } catch {
        return match
      }
    }),
  )
}
