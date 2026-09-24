import type { Match, MatchFilter } from '../../types'
import { EmptyState } from '../../components/EmptyState'
import { MatchCard } from './MatchCard'

interface MatchListProps {
  matches: Match[]
  filter: MatchFilter
  now: Date
  empty?: boolean
}

const emptyCopy: Record<MatchFilter, string> = {
  all: 'אין משחקים כרגע',
  live: 'אין כרגע משחקים בשידור חי',
  today: 'אין משחקים היום',
  upcoming: 'אין משחקים שטרם התחילו',
  finished: 'אין משחקים שהסתיימו',
}

export function MatchList({ matches, filter, now, empty = true }: MatchListProps) {
  if (matches.length === 0) {
    return empty ? <EmptyState title={emptyCopy[filter]} /> : null
  }

  return (
    <div className="match-list">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} now={now} />
      ))}
    </div>
  )
}
