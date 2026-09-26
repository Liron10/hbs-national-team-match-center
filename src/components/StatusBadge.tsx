import type { MatchStatus } from '../types'
import { isLiveStatus } from '../utils/matchStatus'

const labels: Record<MatchStatus | 'today' | 'tomorrow' | 'soon', string> = {
  scheduled: 'בקרוב',
  today: 'היום',
  tomorrow: 'מחר',
  soon: 'מתחיל בקרוב',
  live: 'LIVE',
  halftime: 'מחצית',
  finished: 'הסתיים',
  postponed: 'נדחה',
  cancelled: 'בוטל',
}

interface StatusBadgeProps {
  status: MatchStatus | 'today' | 'tomorrow' | 'soon'
  clock?: string
}

export function StatusBadge({ status, clock }: StatusBadgeProps) {
  const live = isLiveStatus(status as MatchStatus) || status === 'live'

  return (
    <span className={`status-badge status-badge--${status}`}>
      {live ? <span className="live-dot" aria-hidden="true" /> : null}
      {labels[status]}
      {live && clock ? <span className="status-badge__clock">{clock}</span> : null}
    </span>
  )
}
