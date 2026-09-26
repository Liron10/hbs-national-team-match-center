import type { MatchStatus } from '../types'

export function remainingMs(kickoffIso: string, now = new Date()): number {
  return new Date(kickoffIso).getTime() - now.getTime()
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export interface CountdownUnit {
  key: 'hours' | 'minutes' | 'seconds'
  value: string
  label: string
}

export function countdownUnits(ms: number): CountdownUnit[] {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3_600)
  const minutes = Math.floor((totalSeconds % 3_600) / 60)
  const seconds = totalSeconds % 60

  return [
    { key: 'hours', value: pad(hours), label: 'שעות' },
    { key: 'minutes', value: pad(minutes), label: 'דקות' },
    { key: 'seconds', value: pad(seconds), label: 'שניות' },
  ]
}

export function formatStartPhrase(kickoffIso: string, now = new Date()): string | null {
  const remaining = remainingMs(kickoffIso, now)
  if (remaining <= 0) return 'ממתין לשריקה'
  const minutes = Math.ceil(remaining / 60_000)
  const hours = Math.ceil(remaining / 3_600_000)
  const days = Math.ceil(remaining / 86_400_000)

  if (minutes <= 15) return `מתחיל בעוד ${minutes} דקות`
  if (minutes <= 60) return 'מתחיל בקרוב'
  if (hours < 24) return hours === 1 ? 'בעוד שעה' : `בעוד ${hours} שעות`
  if (days === 1) return 'בעוד יום'
  return `בעוד ${days} ימים`
}

export function isStartingSoon(kickoffIso: string, now = new Date()): boolean {
  const remaining = remainingMs(kickoffIso, now)
  return remaining > 0 && remaining <= 60 * 60 * 1000
}

export function shouldShowCountdown(status: MatchStatus): boolean {
  return status === 'scheduled'
}
