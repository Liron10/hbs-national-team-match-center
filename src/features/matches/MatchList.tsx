import type { Match, MatchFilter } from '../../types'
import { EmptyState } from '../../components/EmptyState'
import { MatchCard } from './MatchCard'

interface MatchListProps {
  matches: Match[]
  filter: MatchFilter
  now: Date
  empty?: boolean
  nextMatchId?: string
  onOpenPlayer: (playerId: string) => void
}

const emptyCopy: Record<MatchFilter, string> = {
  all: 'אין לנציגי הפועל באר שבע משחקים כרגע',
  live: 'אין כרגע משחקים בשידור חי',
  today: 'אין לנציגי הפועל באר שבע משחקים היום',
  upcoming: 'אין משחקים שטרם התחילו',
  finished: 'אין משחקים שהסתיימו',
}

export function MatchList({ matches, filter, now, empty = true, nextMatchId, onOpenPlayer }: MatchListProps) {
  if (matches.length === 0) {
    return empty ? <EmptyState title={emptyCopy[filter]} /> : null
  }

  return (
    <div className="match-list">
      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          now={now}
          featured={match.id === nextMatchId}
          onOpenPlayer={onOpenPlayer}
        />
      ))}
    </div>
  )
}
