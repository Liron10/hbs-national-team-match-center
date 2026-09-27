import type { Match } from '../../types'
import { fetchFootballSnapshots } from '../football'
import { fetchEspnLiveSnapshots } from './espnScoreboard'
import type { LiveScoreSnapshot } from '../../utils/liveScores'

export async function fetchLiveSnapshots(
  matches: Match[],
  now = new Date(),
  liveWindowOnly = false,
): Promise<LiveScoreSnapshot[]> {
  const fotmob = await fetchFootballSnapshots(matches, now, liveWindowOnly)
  if (fotmob.length > 0) return fotmob
  return fetchEspnLiveSnapshots(matches, now)
}
