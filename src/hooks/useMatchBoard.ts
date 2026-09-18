import { useMemo, useState } from 'react'
import type { Match, MatchFilter } from '../types'
import { matchesFilter } from '../utils/matchStatus'
import { sortMatches } from '../utils/sortMatches'

export function useMatchBoard(matches: Match[], now: Date) {
  const [filter, setFilter] = useState<MatchFilter>('all')

  const visible = useMemo(() => {
    const filtered = matches.filter((match) => matchesFilter(match, filter, now))
    return sortMatches(filtered, now)
  }, [filter, matches, now])

  return { filter, setFilter, visible }
}
