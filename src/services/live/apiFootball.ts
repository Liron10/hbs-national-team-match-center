import type { Match } from '../../types'
import {
  isInLiveWindow,
  isoDateKeys,
  mapApiFootballStatus,
  type LiveScoreSnapshot,
} from '../../utils/liveScores'

const API_FOOTBALL_BASE = 'https://v3.football.api-sports.io'

interface ApiFootballFixture {
  fixture?: {
    date?: string
    status?: { short?: string; elapsed?: number | null }
  }
  teams?: {
    home?: { code?: string | null }
    away?: { code?: string | null }
  }
  goals?: { home?: number | null; away?: number | null }
}

interface ApiFootballResponse {
  response?: ApiFootballFixture[]
}

function parseScore(value: number | null | undefined, ready: boolean): number | null {
  if (!ready || value == null || !Number.isFinite(value)) return null
  return value
}

export function snapshotsFromApiFootball(payload: ApiFootballResponse): LiveScoreSnapshot[] {
  const snapshots: LiveScoreSnapshot[] = []

  for (const item of payload.response ?? []) {
    const home = item.teams?.home?.code
    const away = item.teams?.away?.code
    if (!home || !away) continue

    const mapped = mapApiFootballStatus(item.fixture?.status?.short ?? 'NS', item.fixture?.status?.elapsed)
    snapshots.push({
      homeAbbr: home,
      awayAbbr: away,
      kickoff: item.fixture?.date ?? new Date().toISOString(),
      status: mapped.status,
      homeScore: parseScore(item.goals?.home, mapped.scoresReady),
      awayScore: parseScore(item.goals?.away, mapped.scoresReady),
      clock: mapped.clock,
    })
  }

  return snapshots
}

export async function fetchApiFootballSnapshots(
  matches: Match[],
  apiKey: string,
  now = new Date(),
): Promise<LiveScoreSnapshot[]> {
  const targets = matches.filter((match) => isInLiveWindow(match, now))
  if (targets.length === 0) return []

  const dates = [...new Set(targets.flatMap((match) => isoDateKeys(match.kickoff)))]
  const groups = await Promise.all(
    dates.map(async (date) => {
      const response = await fetch(`${API_FOOTBALL_BASE}/fixtures?date=${date}`, {
        headers: { 'x-apisports-key': apiKey },
      })
      if (!response.ok) return []
      return snapshotsFromApiFootball((await response.json()) as ApiFootballResponse)
    }),
  )

  return groups.flat()
}
