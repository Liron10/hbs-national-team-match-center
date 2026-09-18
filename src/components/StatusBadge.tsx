import type { MatchStatus } from '../types'
import { isLiveStatus } from '../utils/matchStatus'

const labels: Record<MatchStatus | 'today', string> = {
  scheduled: 'קרוב',
  today: 'היום',
  live: 'LIVE',
  halftime: 'מחצית',
  finished: 'הסתיים',
  postponed: 'נדחה',
  cancelled: 'בוטל',
}

interface StatusBadgeProps {
  status: MatchStatus | 'today'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const live = isLiveStatus(status as MatchStatus) || status === 'live'

  return (
    <span className={`status-badge status-badge--${status}`}>
      {live ? <span className="live-dot" aria-hidden="true" /> : null}
      {labels[status]}
    </span>
  )
}
