import { useMemo, useState } from 'react'
import type { Match, MatchFilter } from '../types'
import { matchInvolvesPlayer } from '../utils/paths'
import { matchesFilter, splitMatchBoard } from '../utils/matchStatus'
import { sortMatches } from '../utils/sortMatches'

export function useMatchBoard(matches: Match[], now: Date) {
  const [filter, setFilter] = useState<MatchFilter>('all')
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  const { openMatches, finishedMatches } = useMemo(() => {
    const filtered = matches.filter((match) => {
      if (!matchesFilter(match, filter, now)) return false
      if (!selectedPlayerId) return true
      return matchInvolvesPlayer(match, selectedPlayerId)
    })
    const sorted = sortMatches(filtered, now)
    const split = splitMatchBoard(sorted, now)
    return { openMatches: split.open, finishedMatches: split.finished }
  }, [filter, matches, now, selectedPlayerId])

  function selectPlayer(id: string) {
    setSelectedPlayerId((current) => (current === id ? null : id))
  }

  function clearPlayer() {
    setSelectedPlayerId(null)
  }

  return { filter, setFilter, openMatches, finishedMatches, selectedPlayerId, selectPlayer, clearPlayer }
}
