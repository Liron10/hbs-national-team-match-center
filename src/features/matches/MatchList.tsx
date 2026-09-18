import { CalendarOff, Radio, Shield } from 'lucide-react'
import type { Match, MatchFilter } from '../../types'
import { EmptyState } from '../../components/EmptyState'
import { MatchCard } from './MatchCard'

interface MatchListProps {
  matches: Match[]
  filter: MatchFilter
  now: Date
}

const emptyCopy: Record<
  MatchFilter,
  { title: string; description: string; icon: 'radio' | 'calendar' | 'shield' }
> = {
  all: {
    title: 'אין משחקים להצגה',
    description: 'כשיתווסף משחק לקובץ הנתונים הוא יופיע כאן.',
    icon: 'shield',
  },
  live: {
    title: 'אין כרגע משחקים LIVE',
    description: 'לא מסמנים משחק כחי בלי עדכון אמיתי.',
    icon: 'radio',
  },
  today: {
    title: 'אין משחקים היום',
    description: 'בדקו את לשונית המשחקים הקרובים.',
    icon: 'calendar',
  },
  upcoming: {
    title: 'אין משחקים קרובים',
    description: 'הלוח יתעדכן כשייכנסו משחקים חדשים.',
    icon: 'calendar',
  },
  finished: {
    title: 'אין משחקים שהסתיימו',
    description: 'תוצאות יופיעו רק אחרי עדכון מאומת.',
    icon: 'shield',
  },
}

function EmptyIcon({ name }: { name: 'radio' | 'calendar' | 'shield' }) {
  const props = { size: 28, 'aria-hidden': true as const }
  if (name === 'radio') return <Radio {...props} />
  if (name === 'calendar') return <CalendarOff {...props} />
  return <Shield {...props} />
}

export function MatchList({ matches, filter, now }: MatchListProps) {
  if (matches.length === 0) {
    const copy = emptyCopy[filter]
    return (
      <EmptyState
        title={copy.title}
        description={copy.description}
        icon={<EmptyIcon name={copy.icon} />}
      />
    )
  }

  return (
    <div className="match-list">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} now={now} />
      ))}
    </div>
  )
}
