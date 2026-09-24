import type { Match, PlayerAppearance, SquadStatus } from '../types'
import { fotmobPlayerId } from '../data/fotmobIds'
import { footballGet } from '../services/football/client'

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
  id?: number
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

interface FotmobMatchDetails {
  content?: {
    lineup?: {
      homeTeam?: { starters?: FotmobLinePlayer[]; subs?: FotmobLinePlayer[]; unavailable?: FotmobLinePlayer[] }
      awayTeam?: { starters?: FotmobLinePlayer[]; subs?: FotmobLinePlayer[]; unavailable?: FotmobLinePlayer[] }
    }
    playerStats?: Record<string, FotmobPlayerStats>
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

export function appearanceFromFotmob(
  playerId: string,
  fotmobId: number,
  details: FotmobMatchDetails,
  matchFinished: boolean,
): PlayerAppearance {
  const lineup = details.content?.lineup
  const sides = [lineup?.homeTeam, lineup?.awayTeam]
  const starter = sides.flatMap((side) => side?.starters ?? []).find((player) => player.id === fotmobId)
  const sub = sides.flatMap((side) => side?.subs ?? []).find((player) => player.id === fotmobId)
  const unavailable = sides.flatMap((side) => side?.unavailable ?? []).find((player) => player.id === fotmobId)
  const linePlayer = starter ?? sub
  const events = eventsOf(linePlayer)
  const statsPayload = details.content?.playerStats?.[String(fotmobId)]
  const minutes = statNumber(statsPayload, 'minutes_played')
  const goals = statNumber(statsPayload, 'goals')
  const assists = statNumber(statsPayload, 'assists')
  const rating = statByKey(statsPayload, 'rating_title')?.stat?.value ?? events.rating

  let squadStatus: SquadStatus = matchFinished ? 'not-in-squad' : 'unknown'
  if (unavailable && !linePlayer) squadStatus = 'not-in-squad'
  else if (starter) squadStatus = events.subOut != null ? 'subbed-out' : 'starter'
  else if (sub && events.subIn != null) squadStatus = 'subbed-in'
  else if (sub) squadStatus = 'unused'

  const played = minutes > 0 || Boolean(starter) || events.subIn != null

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
  const finished = match.status === 'finished'
  return {
    ...match,
    players: match.players.map((appearance) => {
      const fotmobId = fotmobPlayerId[appearance.playerId]
      if (!fotmobId) return appearance
      return appearanceFromFotmob(appearance.playerId, fotmobId, details, finished)
    }),
  }
}

export async function enrichMatchAppearances(matches: Match[]): Promise<Match[]> {
  return Promise.all(
    matches.map(async (match) => {
      if (match.status === 'scheduled' || match.status === 'postponed' || match.status === 'cancelled') {
        return match
      }
      if (match.fotmobMatchId == null) return match
      try {
        const details = await footballGet<FotmobMatchDetails>(`/data/matchDetails?matchId=${match.fotmobMatchId}`)
        return mergeMatchAppearances(match, details)
      } catch {
        return match
      }
    }),
  )
}
