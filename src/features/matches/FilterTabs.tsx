import type { MatchFilter } from '../../types'

const tabs: { id: MatchFilter; label: string }[] = [
  { id: 'all', label: 'הכול' },
  { id: 'live', label: 'LIVE' },
  { id: 'today', label: 'היום' },
  { id: 'upcoming', label: 'קרובים' },
  { id: 'finished', label: 'הסתיימו' },
]

interface FilterTabsProps {
  value: MatchFilter
  onChange: (value: MatchFilter) => void
  liveAvailable: boolean
}

export function FilterTabs({ value, onChange, liveAvailable }: FilterTabsProps) {
  return (
    <div className="filter-tabs" role="tablist" aria-label="סינון משחקים">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          className={value === tab.id ? 'filter-tabs__btn is-active' : 'filter-tabs__btn'}
          onClick={() => onChange(tab.id)}
        >
          {tab.id === 'live' && liveAvailable ? (
            <span className="live-dot" aria-hidden="true" />
          ) : null}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
