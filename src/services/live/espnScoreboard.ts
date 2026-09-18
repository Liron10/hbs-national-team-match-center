import type { Match } from '../../types'
import {
  espnDateKeys,
  espnLeagueForMatch,
  isInLiveWindow,
  mapEspnStatus,
  type LiveScoreSnapshot,
} from '../../utils/liveScores'

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer'

interface EspnCompetitor {
  homeAway?: string
  score?: string
  team?: { abbreviation?: string }
}

interface EspnEvent {
  date?: string
  competitions?: Array<{
    date?: string
    competitors?: EspnCompetitor[]
    status?: {
      displayClock?: string
      type?: { name?: string; state?: string; completed?: boolean }
    }
  }>
}

interface EspnScoreboard {
  events?: EspnEvent[]
}

function parseScore(value: string | undefined, ready: boolean): number | null {
  if (!ready) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function snapshotsFromBoard(payload: EspnScoreboard): LiveScoreSnapshot[] {
  const snapshots: LiveScoreSnapshot[] = []

  for (const event of payload.events ?? []) {
    const competition = event.competitions?.[0]
    const competitors = competition?.competitors ?? []
    const home = competitors.find((item) => item.homeAway === 'home')
    const away = competitors.find((item) => item.homeAway === 'away')
    if (!home?.team?.abbreviation || !away?.team?.abbreviation) continue

    const mapped = mapEspnStatus(competition?.status?.type ?? {}, competition?.status?.displayClock)
    snapshots.push({
      homeAbbr: home.team.abbreviation,
      awayAbbr: away.team.abbreviation,
      kickoff: competition?.date ?? event.date ?? new Date().toISOString(),
      status: mapped.status,
      homeScore: parseScore(home.score, mapped.scoresReady),
      awayScore: parseScore(away.score, mapped.scoresReady),
      clock: mapped.clock,
    })
  }

  return snapshots
}

export async function fetchEspnLiveSnapshots(matches: Match[], now = new Date()): Promise<LiveScoreSnapshot[]> {
  const targets = matches.filter((match) => isInLiveWindow(match, now))
  const requests = new Map<string, Promise<LiveScoreSnapshot[]>>()

  for (const match of targets) {
    const league = espnLeagueForMatch(match)
    for (const date of espnDateKeys(match.kickoff)) {
      const key = `${league}:${date}`
      if (requests.has(key)) continue
      requests.set(
        key,
        fetch(`${ESPN_BASE}/${league}/scoreboard?dates=${date}&limit=100`)
          .then(async (response) => {
            if (!response.ok) return []
            return snapshotsFromBoard((await response.json()) as EspnScoreboard)
          })
          .catch(() => []),
      )
    }
  }

  const groups = await Promise.all(requests.values())
  return groups.flat()
}
