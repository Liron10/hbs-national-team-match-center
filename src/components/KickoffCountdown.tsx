import { useEffect, useState } from 'react'
import type { MatchStatus } from '../types'
import { countdownUnits, formatStartPhrase, remainingMs, shouldShowCountdown } from '../utils/countdown'

interface KickoffCountdownProps {
  kickoff: string
  status: MatchStatus
  featured?: boolean
}

export function KickoffCountdown({ kickoff, status, featured = false }: KickoffCountdownProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (!featured || !shouldShowCountdown(status)) return undefined

    let intervalId = 0
    const timeoutId = window.setTimeout(() => {
      setNow(new Date())
      intervalId = window.setInterval(() => setNow(new Date()), 1000)
    }, 1000 - (Date.now() % 1000))

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [featured, status])

  if (!featured || !shouldShowCountdown(status)) return null

  const remaining = remainingMs(kickoff, now)
  const phrase = formatStartPhrase(kickoff, now)
  if (remaining <= 0) {
    return (
      <p className="countdown countdown--waiting" role="timer">
        ממתין לשריקה
      </p>
    )
  }

  const showClock = remaining <= 2 * 60 * 60 * 1000
  const units = countdownUnits(remaining)

  return (
    <div className="countdown-block">
      {phrase ? <p className="countdown-phrase">{phrase}</p> : null}
      {showClock ? (
        <div
          className={`countdown countdown--${units.length}`}
          role="timer"
          aria-live="off"
          aria-label={units.map((unit) => `${unit.value} ${unit.label}`).join(', ')}
        >
          {units.map((unit) => (
            <div key={unit.key} className="countdown__unit">
              <span className="countdown__value">{unit.value}</span>
              <span className="countdown__label">{unit.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
