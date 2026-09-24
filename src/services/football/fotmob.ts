import type { Match, MatchStatus } from '../../types'
import { fotmobTeamId } from '../../data/fotmobIds'
import { espnDateKeys, isInLiveWindow, type LiveScoreSnapshot } from '../../utils/liveScores'
import { footballGet } from './client'

interface FotmobTeam {
  id?: number
  score?: number | null
  name?: string
}

interface FotmobStatus {
  utcTime?: string
  started?: boolean
  finished?: boolean
  cancelled?: boolean
  awarded?: boolean
  ongoing?: boolean
  scoreStr?: string
  liveTime?: { short?: string; long?: string }
  reason?: { short?: string; long?: string }
}

interface FotmobMatch {
  id?: number
  home?: FotmobTeam
  away?: FotmobTeam
  status?: FotmobStatus
}

interface FotmobMatchesResponse {
  leagues?: Array<{ matches?: FotmobMatch[] }>
}

export function mapFotmobStatus(
  status: FotmobStatus | undefined,
): { status: MatchStatus; clock?: string; scoresReady: boolean } {
  if (!status) return { status: 'scheduled', scoresReady: false }
  if (status.cancelled) return { status: 'cancelled', scoresReady: false }

  const reason = (status.reason?.short ?? '').toUpperCase()
  const liveShort = status.liveTime?.short?.trim()
  const clock = liveShort && liveShort !== "0'" ? liveShort : undefined

  if (status.finished || reason === 'FT' || reason === 'AET' || reason === 'PEN') {
    return { status: 'finished', scoresReady: true }
  }
  if (reason === 'PST' || reason === 'PP') return { status: 'postponed', scoresReady: false }

  const inPlay = Boolean(status.ongoing) || Boolean(status.started)

  if (inPlay && (reason === 'HT' || liveShort === 'HT')) {
    return { status: 'halftime', clock: 'HT', scoresReady: true }
  }
  if (inPlay) {
    return { status: 'live', clock: clock ?? (reason || undefined), scoresReady: true }
  }
  return { status: 'scheduled', scoresReady: false }
}

function parseScore(value: number | null | undefined, ready: boolean): number | null {
  if (!ready || value == null || !Number.isFinite(value)) return null
  return value
}

export function snapshotsFromFotmobMatches(payload: FotmobMatchesResponse): LiveScoreSnapshot[] {
  const snapshots: LiveScoreSnapshot[] = []

  for (const league of payload.leagues ?? []) {
    for (const item of league.matches ?? []) {
      const homeId = item.home?.id
      const awayId = item.away?.id
      if (homeId == null || awayId == null) continue

      const mapped = mapFotmobStatus(item.status)
      snapshots.push({
        homeAbbr: '',
        awayAbbr: '',
        homeTeamId: homeId,
        awayTeamId: awayId,
        sourceMatchId: item.id,
        kickoff: item.status?.utcTime ?? new Date().toISOString(),
        status: mapped.status,
        homeScore: parseScore(item.home?.score, mapped.scoresReady),
        awayScore: parseScore(item.away?.score, mapped.scoresReady),
        clock: mapped.clock,
      })
    }
  }

  return snapshots
}

function dateKeysFor(matches: Match[], liveWindowOnly: boolean, now: Date): string[] {
  const targets = liveWindowOnly ? matches.filter((match) => isInLiveWindow(match, now)) : matches
  return [...new Set(targets.flatMap((match) => espnDateKeys(match.kickoff)))]
}

export async function fetchFootballSnapshots(
  matches: Match[],
  now = new Date(),
  liveWindowOnly = false,
): Promise<LiveScoreSnapshot[]> {
  const dates = dateKeysFor(matches, liveWindowOnly, now)
  if (dates.length === 0) return []

  const groups = await Promise.all(
    dates.map(async (date) => {
      try {
        const payload = await footballGet<FotmobMatchesResponse>(
          `/data/matches?date=${date}&timezone=${encodeURIComponent('Asia/Jerusalem')}&ccode3=ISR`,
        )
        return snapshotsFromFotmobMatches(payload).filter((snapshot) => {
          const home = snapshot.homeTeamId
          const away = snapshot.awayTeamId
          if (home == null || away == null) return false
          return matches.some((match) => {
            return fotmobTeamId[match.homeTeam.code] === home && fotmobTeamId[match.awayTeam.code] === away
          })
        })
      } catch {
        return []
      }
    }),
  )

  return groups.flat()
}
