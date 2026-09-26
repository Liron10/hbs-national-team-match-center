import { useCallback, useEffect, useRef, useState } from 'react'
import type { Match } from '../types'
import { fetchFootballSnapshots } from '../services/football'
import { createMatchDataProvider } from '../services/matches'
import { applyLiveSnapshots, isInLiveWindow } from '../utils/liveScores'
import { enrichMatchAppearances } from '../utils/providerAppearances'

const provider = createMatchDataProvider()
const LIVE_POLL_MS = 30_000

function liveSignature(matches: Match[]): string {
  return matches
    .map((match) => {
      const players = match.players
        .map(
          (appearance) =>
            `${appearance.playerId}:${appearance.squadStatus}:${appearance.minutes ?? ''}:${JSON.stringify(appearance.stats ?? [])}`,
        )
        .join(',')
      return `${match.id}:${match.status}:${match.homeScore}:${match.awayScore}:${match.clock ?? ''}:${players}`
    })
    .join('|')
}

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const matchesRef = useRef(matches)
  matchesRef.current = matches

  const load = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true)
      setError(null)
    }
    try {
      const base = await provider.getMatches()
      const skipLive = import.meta.env.DEV && import.meta.env.VITE_USE_DEMO_DATA === 'true'
      const scored = skipLive ? base : applyLiveSnapshots(base, await fetchFootballSnapshots(base, new Date(), silent))
      const next = skipLive ? scored : await enrichMatchAppearances(scored)
      setMatches((current) => (liveSignature(current) === liveSignature(next) ? current : next))
    } catch {
      if (!silent) setError('לא ניתן להציג את המשחקים כרגע.')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(false)
  }, [load])

  useEffect(() => {
    const skipLive = import.meta.env.DEV && import.meta.env.VITE_USE_DEMO_DATA === 'true'
    if (skipLive) return undefined

    const tick = () => {
      if (document.hidden) return
      if (!matchesRef.current.some((match) => isInLiveWindow(match))) return
      void load(true)
    }

    const id = window.setInterval(tick, LIVE_POLL_MS)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [load])

  return { matches, loading, error, refresh: () => load(false) }
}
