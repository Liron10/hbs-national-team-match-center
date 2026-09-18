import { useMemo, useState } from 'react'
import type { Match, MatchFilter } from '../types'
import { matchInvolvesPlayer } from '../utils/paths'
import { matchesFilter } from '../utils/matchStatus'
import { sortMatches } from '../utils/sortMatches'

export function useMatchBoard(matches: Match[], now: Date) {
  const [filter, setFilter] = useState<MatchFilter>('all')
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  const visible = useMemo(() => {
    const filtered = matches.filter((match) => {
      if (!matchesFilter(match, filter, now)) return false
      if (!selectedPlayerId) return true
      return matchInvolvesPlayer(match, selectedPlayerId)
    })
    return sortMatches(filtered, now)
  }, [filter, matches, now, selectedPlayerId])

  function selectPlayer(id: string) {
    setSelectedPlayerId((current) => (current === id ? null : id))
  }

  return { filter, setFilter, visible, selectedPlayerId, selectPlayer }
}
