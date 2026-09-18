const TIME_ZONE = 'Asia/Jerusalem'

const weekdayFormatter = new Intl.DateTimeFormat('he-IL', {
  weekday: 'long',
  timeZone: TIME_ZONE,
})

const dateFormatter = new Intl.DateTimeFormat('he-IL', {
  day: 'numeric',
  month: 'numeric',
  timeZone: TIME_ZONE,
})

const timeFormatter = new Intl.DateTimeFormat('he-IL', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: TIME_ZONE,
})

const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: TIME_ZONE,
})

export function toJerusalemDate(iso: string | Date): Date {
  return typeof iso === 'string' ? new Date(iso) : iso
}

export function formatMatchDate(iso: string): string {
  const date = toJerusalemDate(iso)
  const weekday = weekdayFormatter.format(date)
  const numeric = dateFormatter.format(date).replaceAll('/', '.')
  return `${weekday} ${numeric}`
}

export function formatMatchTime(iso: string): string {
  return timeFormatter.format(toJerusalemDate(iso))
}

const WEEKDAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'] as const

const WEEKDAY_INDEX: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
}

const jerusalemClockParts = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  weekday: 'short',
  hour: 'numeric',
  minute: 'numeric',
  hourCycle: 'h23',
})

function jerusalemWeekdayAndHour(iso: string): { weekday: number; hour: number } | null {
  const parts = jerusalemClockParts.formatToParts(toJerusalemDate(iso))
  const weekdayKey = parts.find((part) => part.type === 'weekday')?.value.slice(0, 3).toLowerCase()
  const hourValue = parts.find((part) => part.type === 'hour')?.value
  if (!weekdayKey || hourValue == null) return null
  const weekday = WEEKDAY_INDEX[weekdayKey]
  const hour = Number(hourValue)
  if (weekday == null || !Number.isFinite(hour)) return null
  return { weekday, hour }
}

export function formatOvernightContext(iso: string): string | null {
  const clock = jerusalemWeekdayAndHour(iso)
  if (!clock || clock.hour >= 6) return null
  const previous = (clock.weekday + 6) % 7
  return `בלילה שבין ${WEEKDAY_NAMES[previous]} ל${WEEKDAY_NAMES[clock.weekday]}`
}

export function isSameJerusalemDay(a: string | Date, b: string | Date = new Date()): boolean {
  return dayKeyFormatter.format(toJerusalemDate(a)) === dayKeyFormatter.format(toJerusalemDate(b))
}

export function isBeforeJerusalemDay(iso: string, now = new Date()): boolean {
  return dayKeyFormatter.format(toJerusalemDate(iso)) < dayKeyFormatter.format(now)
}

const updatedDateFormatter = new Intl.DateTimeFormat('he-IL', {
  day: 'numeric',
  month: 'numeric',
  year: '2-digit',
  timeZone: TIME_ZONE,
})

export function formatUpdatedAt(iso: string): string {
  const date = toJerusalemDate(iso)
  const day = updatedDateFormatter.format(date).replaceAll('/', '.')
  return `${day} | ${timeFormatter.format(date)}`
}

export function formatWindowLabel(window: string): string {
  const [year, month] = window.split('-').map(Number)
  if (!year || !month) return 'פגרת הנבחרות'
  const label = new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  )
  return `פגרת הנבחרות | ${label}`
}

export function latestUpdateIso(timestamps: string[], fallback: string): string {
  return timestamps.reduce((latest, value) => (value > latest ? value : latest), fallback)
}
