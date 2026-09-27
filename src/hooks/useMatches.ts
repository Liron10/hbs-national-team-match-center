import { useCallback, useEffect, useRef, useState } from 'react'
import type { Match } from '../types'
import { canUseFootballApiInBrowser, fetchFootballSnapshots } from '../services/football'
import { fetchEspnLiveSnapshots } from '../services/live/espnScoreboard'
import { createMatchDataProvider } from '../services/matches'
import { usesSharedMatchDataset } from '../services/matches/sharedDataset'
import { applyLiveSnapshots, isInLiveWindow } from '../utils/liveScores'
import { isLiveStatus } from '../utils/matchStatus'
import { enrichMatchAppearances } from '../utils/providerAppearances'

const provider = createMatchDataProvider()
const SCORE_POLL_MS = 8_000
const SHARED_POLL_EVERY = 3

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
  const sharedTickRef = useRef(0)
  matchesRef.current = matches

  const commit = useCallback((next: Match[]) => {
    setMatches((current) => (liveSignature(current) === liveSignature(next) ? current : next))
  }, [])

  const load = useCallback(
    async (silent = false, refreshShared = !silent) => {
      if (silent && inFlightRef.current) return
      inFlightRef.current = true
      if (!silent) {
        setLoading(true)
        setError(null)
      }
      try {
        const skipLive = import.meta.env.DEV && import.meta.env.VITE_USE_DEMO_DATA === 'true'
        const reuseMemory = silent && !refreshShared && matchesRef.current.length > 0
        const base = reuseMemory ? matchesRef.current : await provider.getMatches()
        if (skipLive) {
          commit(base)
          return
        }

        const now = new Date()
        const snapshots = canUseFootballApiInBrowser()
          ? await fetchFootballSnapshots(base, now, silent)
          : await fetchEspnLiveSnapshots(base, now)
        const scored = applyLiveSnapshots(base, snapshots, now)
        commit(scored)

        if (!canUseFootballApiInBrowser()) return

        const next = await enrichMatchAppearances(scored, now, silent)
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
    void load(false, true)
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
          sharedTickRef.current += 1
          const refreshShared = usesSharedMatchDataset() && sharedTickRef.current % SHARED_POLL_EVERY === 0
          void load(true, refreshShared).finally(() => {
            if (!cancelled) tick()
          })
          return
        }
        tick()
      }, SCORE_POLL_MS)
    }

    tick()
    const onVisible = () => {
      if (document.hidden) return
      if (!needsLivePoll(matchesRef.current)) return
      void load(true, usesSharedMatchDataset())
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [load])

  return { matches, loading, error, refresh: () => load(false, true) }
}
