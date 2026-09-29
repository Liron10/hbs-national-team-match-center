import { useCallback, useEffect, useRef, useState } from 'react'
import type { Match } from '../types'
import { fetchLiveSnapshots } from '../services/live/snapshots'
import { createMatchDataProvider } from '../services/matches'
import { applyLiveSnapshots, isInLiveWindow } from '../utils/liveScores'
import { isLiveStatus } from '../utils/matchStatus'
import { enrichMatchAppearances } from '../utils/providerAppearances'

const provider = createMatchDataProvider()
const LIVE_POLL_MS = 5_000

function liveSignature(matches: Match[]): string {
  return matches
    .map((match) => {
      const players = match.players
        .map(
          (appearance) =>
            `${appearance.playerId}:${appearance.squadStatus}:${appearance.minutes ?? ''}:${appearance.subbedInMinute ?? ''}:${appearance.subbedOutMinute ?? ''}:${JSON.stringify(appearance.stats ?? [])}`,
        )
        .join(',')
      return `${match.id}:${match.status}:${match.homeScore}:${match.awayScore}:${match.clock ?? ''}:${players}`
    })
    .join('|')
}

function needsLivePoll(matches: Match[]): boolean {
  return matches.some((match) => isLiveStatus(match.status) || isInLiveWindow(match))
}

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const matchesRef = useRef(matches)
  const inFlightRef = useRef(false)
  matchesRef.current = matches

  const commit = useCallback((next: Match[]) => {
    setMatches((current) => (liveSignature(current) === liveSignature(next) ? current : next))
  }, [])

  const load = useCallback(
    async (silent = false) => {
      if (silent && inFlightRef.current) return
      inFlightRef.current = true
      if (!silent) {
        setLoading(true)
        setError(null)
      }
      try {
        const skipLive = import.meta.env.DEV && import.meta.env.VITE_USE_DEMO_DATA === 'true'
        const base =
          silent && matchesRef.current.length > 0 ? matchesRef.current : await provider.getMatches()
        if (skipLive) {
          commit(base)
          return
        }

        const now = new Date()
        const scored = applyLiveSnapshots(base, await fetchLiveSnapshots(base, now, silent), now)
        commit(scored)

        const next = await enrichMatchAppearances(scored, now, false)
        commit(next)
      } catch {
        if (!silent) setError('לא ניתן להציג את המשחקים כרגע.')
      } finally {
        inFlightRef.current = false
        if (!silent) setLoading(false)
      }
    },
    [commit],
  )

  useEffect(() => {
    void load(false)
  }, [load])

  useEffect(() => {
    const skipLive = import.meta.env.DEV && import.meta.env.VITE_USE_DEMO_DATA === 'true'
    if (skipLive) return undefined

    let timer = 0
    let cancelled = false

    const tick = () => {
      if (cancelled) return
      timer = window.setTimeout(() => {
        if (!document.hidden && needsLivePoll(matchesRef.current)) {
          void load(true).finally(() => {
            if (!cancelled) tick()
          })
          return
        }
        tick()
      }, LIVE_POLL_MS)
    }

    tick()
    const onVisible = () => {
      if (document.hidden) return
      if (!needsLivePoll(matchesRef.current)) return
      void load(true)
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [load])

  return { matches, loading, error, refresh: () => load(false) }
}
