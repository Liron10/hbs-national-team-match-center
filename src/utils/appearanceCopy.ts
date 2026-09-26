import type { MatchStatus, PlayerAppearance, SquadStatus } from '../types'
import { buildFixedStats } from './providerAppearances'

const squadLabels: Record<SquadStatus, string> = {
  starter: 'פותח בהרכב',
  bench: 'על הספסל',
  'subbed-in': 'נכנס כמחליף',
  'subbed-out': 'הוחלף',
  unused: 'לא שותף',
  'not-in-squad': 'מחוץ לסגל',
  unknown: 'בסגל הנבחרת',
}

export function parseClockMinute(clock?: string): number | null {
  if (!clock) return null
  const plus = clock.match(/(\d+)\s*\+\s*(\d+)/)
  if (plus) return Number(plus[1]) + Number(plus[2])
  const simple = clock.match(/(\d+)/)
  return simple ? Number(simple[1]) : null
}

function isRecentEvent(eventMinute: number | undefined, clock?: string): boolean {
  if (eventMinute == null) return false
  const current = parseClockMinute(clock)
  if (current == null) return false
  const delta = current - eventMinute
  return delta >= 0 && delta <= 4
}

export function isOnThePitch(appearance: PlayerAppearance, matchStatus?: MatchStatus): boolean {
  if (matchStatus !== 'live' && matchStatus !== 'halftime') return false
  if (appearance.squadStatus === 'subbed-out') return false
  if (appearance.squadStatus === 'bench' || appearance.squadStatus === 'unused') return false
  if (appearance.squadStatus === 'not-in-squad' || appearance.squadStatus === 'unknown') return false
  if (appearance.subbedOutMinute != null) return false
  return appearance.squadStatus === 'starter' || appearance.squadStatus === 'subbed-in'
}

export function matchShowsPlayerStats(status: MatchStatus): boolean {
  return status === 'live' || status === 'halftime' || status === 'finished'
}

export function participationLine(
  appearance: PlayerAppearance,
  matchStatus?: MatchStatus,
  clock?: string,
): string {
  const minutes = appearance.minutes ?? 0
  const subIn = appearance.subbedInMinute
  const subOut = appearance.subbedOutMinute
  const live = matchStatus === 'live' || matchStatus === 'halftime'
  const finished = matchStatus === 'finished'

  if (live) {
    if (appearance.squadStatus === 'not-in-squad') return 'כרגע לא במשחק • מחוץ לסגל'
    if (appearance.squadStatus === 'bench' || appearance.squadStatus === 'unused') {
      return 'כרגע לא במשחק • על הספסל'
    }
    if (appearance.squadStatus === 'subbed-out' || (subOut != null && appearance.squadStatus !== 'subbed-in')) {
      if (isRecentEvent(subOut, clock)) return 'הוחלף עכשיו'
      if (subOut != null && (appearance.started || appearance.squadStatus === 'subbed-out')) {
        return `פתח בהרכב והוחלף בדקה ${subOut}`
      }
      return 'כרגע לא במשחק • הוחלף וירד מהדשא'
    }
    if (subOut != null && appearance.squadStatus === 'subbed-in') {
      return isRecentEvent(subOut, clock) ? 'הוחלף עכשיו' : 'כרגע לא במשחק • הוחלף וירד מהדשא'
    }
    if (appearance.squadStatus === 'subbed-in') {
      if (isRecentEvent(subIn, clock)) return 'נכנס עכשיו'
      if (subIn != null && minutes > 0) return `נכנס כמחליף בדקה ${subIn} • ${minutes} דקות`
      if (subIn != null) return `נכנס כמחליף בדקה ${subIn}`
    }
    if (minutes > 0) return `${minutes} דקות על הדשא`
    if (appearance.squadStatus === 'starter') return 'פותח בהרכב'
  }

  if (appearance.squadStatus === 'unknown') {
    return matchStatus === 'scheduled' || matchStatus == null ? 'בסגל הנבחרת' : ''
  }
  if (appearance.squadStatus === 'not-in-squad') return 'מחוץ לסגל'
  if (appearance.squadStatus === 'unused') return 'לא שותף'
  if (appearance.squadStatus === 'bench' && !finished) return 'על הספסל'
  if (!appearance.played && appearance.squadStatus !== 'starter') return 'לא שותף'

  if (subIn != null) {
    if (finished && minutes > 0) return `עלה מהספסל ושיחק ${minutes} דקות`
    if (minutes > 0) return `נכנס כמחליף בדקה ${subIn} • ${minutes} דקות`
    return `נכנס כמחליף בדקה ${subIn}`
  }
  if (minutes >= 90) return 'השלים 90 דקות'
  if (subOut != null) return `פתח בהרכב והוחלף בדקה ${subOut}`
  if (minutes > 0 && (appearance.started || appearance.squadStatus === 'starter')) {
    return `פתח ושיחק ${minutes} דקות`
  }
  if (minutes > 0) return `שיחק ${minutes} דקות`
  if (appearance.squadStatus === 'starter') return 'פותח בהרכב'
  return squadLabels[appearance.squadStatus]
}

export function squadStatusLabel(status: SquadStatus): string {
  return squadLabels[status]
}

export interface AppearanceStat {
  label: string
  value: string
}

export interface PlayerChip {
  kind: 'status' | 'out' | 'goal' | 'assist' | 'yellow' | 'red' | 'stat' | 'fresh'
  label: string
}

export function playerChips(
  appearance: PlayerAppearance,
  matchStatus: MatchStatus,
  clock?: string,
): PlayerChip[] {
  const chips: PlayerChip[] = []
  const line = participationLine(appearance, matchStatus, clock)
  if (line) {
    const fresh = line === 'נכנס עכשיו' || line === 'הוחלף עכשיו'
    const offPitch = line.startsWith('כרגע לא במשחק')
    chips.push({ kind: fresh ? 'fresh' : offPitch ? 'out' : 'status', label: line })
  }

  const goals = appearance.goals ?? 0
  const assists = appearance.assists ?? 0
  const yellow = appearance.yellowCards ?? 0
  const red = appearance.redCards ?? 0
  const live = matchStatus === 'live' || matchStatus === 'halftime'
  if (goals > 0 && assists > 0) {
    chips.push({ kind: 'goal', label: 'שער ובישול' })
  } else if (goals > 0) {
    chips.push({
      kind: 'goal',
      label: live ? (goals === 1 ? 'כבש' : `${goals} שערים`) : goals === 1 ? 'שער אחד' : `${goals} שערים`,
    })
  } else if (assists > 0) {
    chips.push({ kind: 'assist', label: assists === 1 ? 'בישול אחד' : `${assists} בישולים` })
  }
  if (yellow > 0) chips.push({ kind: 'yellow', label: yellow === 1 ? 'כרטיס צהוב' : `${yellow} צהובים` })
  if (red > 0) chips.push({ kind: 'red', label: red === 1 ? 'כרטיס אדום' : `${red} אדומים` })
  return chips
}

export function compactHighlights(appearance: PlayerAppearance): AppearanceStat[] {
  if (!appearance.played) return []
  const stats = appearance.stats ?? []
  const pick = (label: string) => stats.find((item) => item.label === label)
  const highlights: AppearanceStat[] = []
  if (typeof appearance.minutes === 'number' && appearance.minutes > 0) {
    highlights.push({ label: 'דק׳', value: String(appearance.minutes) })
  }
  const goals = appearance.goals ?? Number(pick('שערים')?.value ?? 0)
  if (goals > 0) highlights.push({ label: 'שערים', value: String(goals) })
  const shots = pick('בעיטות')
  if (shots && shots.value !== '0') highlights.push({ label: 'בעיטות', value: shots.value })
  const onTarget = pick('בעיטות למסגרת')
  if (onTarget && onTarget.value !== '0') highlights.push({ label: 'למסגרת', value: onTarget.value })
  return highlights.slice(0, 4)
}

export interface TimelineEvent {
  minute: number
  label: string
  kind: 'in' | 'out' | 'goal' | 'assist' | 'yellow' | 'red'
}

export function playerTimeline(appearance: PlayerAppearance): TimelineEvent[] {
  const events: TimelineEvent[] = []
  if (appearance.subbedInMinute != null) {
    events.push({ minute: appearance.subbedInMinute, label: 'נכנס', kind: 'in' })
  }
  if (appearance.subbedOutMinute != null) {
    events.push({ minute: appearance.subbedOutMinute, label: 'הוחלף', kind: 'out' })
  }
  return events.sort((a, b) => a.minute - b.minute)
}

export function appearanceStats(appearance: PlayerAppearance, matchStatus?: MatchStatus): AppearanceStat[] {
  if (matchStatus && !matchShowsPlayerStats(matchStatus)) return []
  if (!appearance.played) return []
  if (appearance.stats && appearance.stats.length > 0) return appearance.stats

  return buildFixedStats({
    minutes: appearance.minutes ?? 0,
    goals: appearance.goals ?? 0,
    assists: appearance.assists ?? 0,
    yellow: appearance.yellowCards ?? 0,
    red: appearance.redCards ?? 0,
    passes: '0',
    shots: 0,
    shotsOnTarget: 0,
    tackles: 0,
  })
}
