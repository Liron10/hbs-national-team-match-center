import type { Match, PlayerAppearance, SquadStatus } from '../types'
import { fotmobPlayerId } from '../data/fotmobIds'
import { footballGet } from '../services/football/client'

const MAX_STATS = 10

const STAT_LABELS: Record<string, string> = {
  minutes_played: 'דקות',
  rating_title: 'דירוג',
  goals: 'שערים',
  assists: 'בישולים',
  accurate_passes: 'מסירות מדויקות',
  chances_created: 'הזדמנויות שנוצרו',
  total_shots: 'בעיטות',
  ShotsOnTarget: 'בעיטות לשער',
  ShotsOffTarget: 'בעיטות מחוץ למסגרת',
  blocked_shots: 'בעיטות שנחסמו',
  defensive_actions: 'פעולות הגנה',
  touches: 'נגיעות',
  expected_goals: 'xG',
  expected_assists: 'xA',
  xg_and_xa: 'xG+xA',
  conceded_penalties: 'פנדל שספג',
  dribbles_succeeded: 'כדרורים מוצלחים',
  long_balls_accurate: 'כדורים ארוכים',
  passes_into_final_third: 'מסירות לשליש האחרון',
  touches_opp_box: 'נגיעות ברחבה',
  'FotMob rating': 'דירוג',
  'Minutes played': 'דקות',
  Goals: 'שערים',
  Assists: 'בישולים',
  'Accurate passes': 'מסירות מדויקות',
  'Chances created': 'הזדמנויות שנוצרו',
  'Total shots': 'בעיטות',
  'Shots on target': 'בעיטות לשער',
  'Defensive actions': 'פעולות הגנה',
  Touches: 'נגיעות',
}

const PREFERRED_KEYS = [
  'minutes_played',
  'rating_title',
  'goals',
  'assists',
  'accurate_passes',
  'total_shots',
  'ShotsOnTarget',
  'chances_created',
  'defensive_actions',
  'touches',
  'expected_goals',
  'expected_assists',
]

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
  hideInPopupCard?: boolean
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

function formatStat(entry: FotmobStatValue): string | null {
  const value = entry.stat?.value
  if (value == null || !Number.isFinite(value)) return null
  if (entry.stat?.type === 'boolean') return null
  if (entry.stat?.type === 'fractionWithPercentage' && entry.stat.total != null) {
    return `${value}/${entry.stat.total}`
  }
  if (entry.stat?.type === 'double') return value.toFixed(2)
  return String(value)
}

export function collectPlayerStats(
  payload: FotmobPlayerStats | undefined,
  extras: Array<{ label: string; value: string }>,
): Array<{ label: string; value: string }> {
  const collected: Array<{ label: string; value: string; key: string }> = extras.map((item) => ({
    ...item,
    key: item.label,
  }))

  const groups = payload?.stats ?? []
  const top = groups.find((group) => group.key === 'top_stats') ?? groups[0]
  const rest = groups.filter((group) => group !== top)
  const bags = [top, ...rest]

  for (const bag of bags) {
    const stats = bag?.stats ?? {}
    for (const [title, entry] of Object.entries(stats)) {
      if (entry.hideInPopupCard) continue
      const key = entry.key || title
      if (!key || key === 'null') continue
      if (collected.some((item) => item.key === key || item.label === (STAT_LABELS[key] ?? STAT_LABELS[title]))) {
        continue
      }
      const value = formatStat(entry)
      if (value == null) continue
      const label = STAT_LABELS[key] ?? STAT_LABELS[title]
      if (!label) continue
      collected.push({ key, label, value })
    }
  }

  const preferred = PREFERRED_KEYS.map((key) => collected.find((item) => item.key === key)).filter(
    (item): item is { label: string; value: string; key: string } => item != null,
  )
  const others = collected.filter((item) => !PREFERRED_KEYS.includes(item.key))
  return [...preferred, ...others].slice(0, MAX_STATS).map(({ label, value }) => ({ label, value }))
}

function eventsOf(player: FotmobLinePlayer | undefined) {
  const sub = player?.performance?.substitutionEvents ?? []
  const cards = player?.performance?.events ?? []
  return {
    subIn: sub.find((item) => item.type === 'subIn')?.time,
    subOut: sub.find((item) => item.type === 'subOut')?.time,
    yellow: cards.filter((item) => item.type === 'yellowCard').length,
    red: cards.filter((item) => /red/i.test(item.type ?? '')).length,
  }
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
  const minutesEntry = statsPayload?.stats
    ?.flatMap((group) => Object.values(group.stats ?? {}))
    .find((entry) => entry.key === 'minutes_played')
  const minutes = minutesEntry?.stat?.value
  const goals = statsPayload?.stats
    ?.flatMap((group) => Object.values(group.stats ?? {}))
    .find((entry) => entry.key === 'goals')?.stat?.value
  const assists = statsPayload?.stats
    ?.flatMap((group) => Object.values(group.stats ?? {}))
    .find((entry) => entry.key === 'assists')?.stat?.value

  let squadStatus: SquadStatus = matchFinished ? 'not-in-squad' : 'unknown'
  if (unavailable && !linePlayer) squadStatus = 'not-in-squad'
  else if (starter) squadStatus = events.subOut != null ? 'subbed-out' : 'starter'
  else if (sub && events.subIn != null) squadStatus = 'subbed-in'
  else if (sub) squadStatus = 'unused'

  const extras: Array<{ label: string; value: string }> = []
  if (events.yellow) extras.push({ label: events.yellow === 1 ? 'כרטיס צהוב' : 'כרטיסים צהובים', value: String(events.yellow) })
  if (events.red) extras.push({ label: events.red === 1 ? 'כרטיס אדום' : 'כרטיסים אדומים', value: String(events.red) })

  const played = typeof minutes === 'number' ? minutes > 0 : Boolean(starter || events.subIn != null)

  return {
    playerId,
    squadStatus,
    started: Boolean(starter),
    played,
    minutes: typeof minutes === 'number' ? minutes : undefined,
    goals: typeof goals === 'number' ? goals : undefined,
    assists: typeof assists === 'number' ? assists : undefined,
    yellowCards: events.yellow || undefined,
    redCards: events.red || undefined,
    subbedInMinute: events.subIn,
    subbedOutMinute: events.subOut,
    stats: collectPlayerStats(statsPayload, extras),
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
