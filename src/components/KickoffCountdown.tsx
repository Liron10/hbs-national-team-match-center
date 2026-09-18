import { useEffect, useState } from 'react'
import type { MatchStatus } from '../types'
import { countdownParts, remainingMs, shouldShowCountdown } from '../utils/countdown'

interface KickoffCountdownProps {
  kickoff: string
  status: MatchStatus
}

export function KickoffCountdown({ kickoff, status }: KickoffCountdownProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (!shouldShowCountdown(status)) return undefined

    let intervalId = 0
    const timeoutId = window.setTimeout(() => {
      setNow(new Date())
      intervalId = window.setInterval(() => setNow(new Date()), 1000)
    }, 1000 - (Date.now() % 1000))

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [status])

  if (!shouldShowCountdown(status)) return null

  const remaining = remainingMs(kickoff, now)
  if (remaining <= 0) {
    return (
      <p className="countdown" role="timer">
        ממתין לשריקה
      </p>
    )
  }

  const { daysLabel, clock } = countdownParts(remaining)

  return (
    <p className="countdown" role="timer" aria-live="off" aria-label={`עוד ${daysLabel} ${clock} לשריקה`}>
      <span>עוד</span>
      {daysLabel ? <span>{daysLabel}</span> : null}
      <span className="countdown__time">{clock}</span>
    </p>
  )
}
