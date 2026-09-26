import { windowBoardView } from '../utils/playerWindow'
import type { Match } from '../types'

interface WindowStripProps {
  matches: Match[]
}

export function WindowStrip({ matches }: WindowStripProps) {
  const view = windowBoardView(matches)
  if (view.stats.length === 0) return null

  return (
    <section className="window-strip" aria-label={view.closed ? 'סיכום הפגרה' : 'הפגרה במספרים'}>
      <h2>{view.closed ? 'סיכום הפגרה' : 'הפגרה במספרים'}</h2>
      <ul>
        {view.stats.map((stat) => (
          <li key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </li>
        ))}
      </ul>
      {view.teamLine ? <p className="window-strip__teams">{view.teamLine}</p> : null}
      {view.notes.map((note) => (
        <p key={note} className="window-strip__note">
          {note}
        </p>
      ))}
    </section>
  )
}
