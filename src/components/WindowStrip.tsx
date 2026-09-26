import { windowBoardStats } from '../utils/playerWindow'
import type { Match } from '../types'

interface WindowStripProps {
  matches: Match[]
}

export function WindowStrip({ matches }: WindowStripProps) {
  const stats = windowBoardStats(matches)
  if (stats.length === 0) return null

  return (
    <section className="window-strip" aria-label="הפגרה במספרים">
      <h2>הפגרה במספרים</h2>
      <ul>
        {stats.map((stat) => (
          <li key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
