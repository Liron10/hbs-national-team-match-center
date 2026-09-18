import type { Match } from '../../types'
import {
  isInLiveWindow,
  isoDateKeys,
  mapFootballDataStatus,
  type LiveScoreSnapshot,
} from '../../utils/liveScores'

const FOOTBALL_DATA_BASE = 'https://api.football-data.org/v4'

interface FootballDataMatch {
  utcDate?: string
  status?: string
  minute?: number | null
  homeTeam?: { tla?: string }
  awayTeam?: { tla?: string }
  score?: { fullTime?: { home?: number | null; away?: number | null } }
}

interface FootballDataResponse {
  matches?: FootballDataMatch[]
}

function parseScore(value: number | null | undefined, ready: boolean): number | null {
  if (!ready || value == null || !Number.isFinite(value)) return null
  return value
}

export function snapshotsFromFootballData(payload: FootballDataResponse): LiveScoreSnapshot[] {
  const snapshots: LiveScoreSnapshot[] = []

  for (const item of payload.matches ?? []) {
    const home = item.homeTeam?.tla
    const away = item.awayTeam?.tla
    if (!home || !away) continue

    const mapped = mapFootballDataStatus(item.status ?? 'TIMED', item.minute)
    snapshots.push({
      homeAbbr: home,
      awayAbbr: away,
      kickoff: item.utcDate ?? new Date().toISOString(),
      status: mapped.status,
      homeScore: parseScore(item.score?.fullTime?.home, mapped.scoresReady),
      awayScore: parseScore(item.score?.fullTime?.away, mapped.scoresReady),
      clock: mapped.clock,
    })
  }

  return snapshots
}

export async function fetchFootballDataSnapshots(
  matches: Match[],
  apiKey: string,
  now = new Date(),
): Promise<LiveScoreSnapshot[]> {
  const targets = matches.filter((match) => isInLiveWindow(match, now))
  if (targets.length === 0) return []

  const dates = [...new Set(targets.flatMap((match) => isoDateKeys(match.kickoff)))].sort()
  const response = await fetch(
    `${FOOTBALL_DATA_BASE}/matches?dateFrom=${dates[0]}&dateTo=${dates.at(-1)}`,
    { headers: { 'X-Auth-Token': apiKey } },
  )
  if (!response.ok) return []
  return snapshotsFromFootballData((await response.json()) as FootballDataResponse)
}
