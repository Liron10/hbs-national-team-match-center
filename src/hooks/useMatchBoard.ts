import { useMemo, useState } from 'react'
import type { Match, MatchFilter } from '../types'
import { matchesFilter } from '../utils/matchStatus'
import { matchInvolvesPlayer } from '../utils/paths'
import { sortMatches } from '../utils/sortMatches'

export function useMatchBoard(matches: Match[], now: Date) {
  const [filter, setFilter] = useState<MatchFilter>('all')
  const [playerId, setPlayerId] = useState<string | null>(null)

  const visible = useMemo(() => {
    const scoped = playerId
      ? matches.filter((match) => matchInvolvesPlayer(match, playerId))
      : matches
    const filtered = scoped.filter((match) => matchesFilter(match, filter, now))
    return sortMatches(filtered, now)
  }, [filter, matches, now, playerId])

  function togglePlayer(id: string) {
    setPlayerId((current) => (current === id ? null : id))
  }

  return { filter, setFilter, playerId, setPlayerId, togglePlayer, visible }
}
