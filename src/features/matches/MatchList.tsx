import type { Match, MatchFilter } from '../../types'
import { EmptyState } from '../../components/EmptyState'
import { MatchCard } from './MatchCard'

interface MatchListProps {
  matches: Match[]
  filter: MatchFilter
  now: Date
  selectedPlayerId?: string | null
}

const emptyCopy: Record<MatchFilter, string> = {
  all: 'אין משחקים כרגע',
  live: 'אין כרגע משחקים בשידור חי',
  today: 'אין משחקים היום',
  upcoming: 'אין משחקים שטרם התחילו',
  finished: 'אין משחקים שהסתיימו',
}

export function MatchList({ matches, filter, now, selectedPlayerId }: MatchListProps) {
  if (matches.length === 0) {
    return <EmptyState title={emptyCopy[filter]} />
  }

  return (
    <div className="match-list">
      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          now={now}
          selectedPlayerId={selectedPlayerId}
        />
      ))}
    </div>
  )
}
