import type { MatchStatus } from '../types'

export function remainingMs(kickoffIso: string, now = new Date()): number {
  return new Date(kickoffIso).getTime() - now.getTime()
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function countdownParts(ms: number): { daysLabel: string; clock: string } {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3_600)
  const minutes = Math.floor((totalSeconds % 3_600) / 60)
  const seconds = totalSeconds % 60
  const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`

  if (days === 0) return { daysLabel: '', clock }
  if (days === 1) return { daysLabel: 'יום אחד', clock }
  if (days === 2) return { daysLabel: 'יומיים', clock }
  return { daysLabel: `${days} ימים`, clock }
}

export function formatCountdown(ms: number): string {
  const { daysLabel, clock } = countdownParts(ms)
  return daysLabel ? `${daysLabel} ${clock}` : clock
}

export function shouldShowCountdown(status: MatchStatus): boolean {
  return status === 'scheduled'
}
