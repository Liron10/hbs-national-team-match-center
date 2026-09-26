import type { MatchStatus, PlayerAppearance, SquadStatus } from '../types'
import { buildFixedStats } from './fotmobAppearances'

const squadLabels: Record<SquadStatus, string> = {
  starter: 'פותח בהרכב',
  bench: 'על הספסל',
  'subbed-in': 'נכנס כמחליף',
  'subbed-out': 'הוחלף',
  unused: 'לא שותף',
  'not-in-squad': 'לא בסגל',
  unknown: 'בסגל הנבחרת',
}

export function matchShowsPlayerStats(status: MatchStatus): boolean {
  return status === 'live' || status === 'halftime' || status === 'finished'
}

export function participationLine(appearance: PlayerAppearance, matchStatus?: MatchStatus): string {
  const minutes = appearance.minutes ?? 0
  const subIn = appearance.subbedInMinute
  const subOut = appearance.subbedOutMinute

  if (appearance.squadStatus === 'unknown') {
    return matchStatus === 'scheduled' || matchStatus == null ? 'בסגל הנבחרת' : ''
  }
  if (appearance.squadStatus === 'not-in-squad') return 'לא בסגל'
  if (appearance.squadStatus === 'unused') return 'לא שותף'
  if (appearance.squadStatus === 'bench') return 'על הספסל'
  if (!appearance.played && appearance.squadStatus !== 'starter') return 'לא שותף'

  if (subIn != null) return `נכנס בדקה ${subIn}'`
  if (subOut != null) return `הוחלף בדקה ${subOut}'`
  if (matchStatus === 'live' || matchStatus === 'halftime') {
    if (appearance.squadStatus === 'starter' && minutes > 0) {
      return `פותח בהרכב • ${minutes} דקות`
    }
    if (minutes > 0) return `${minutes} דקות`
  }
  if (minutes >= 90) return `שיחק ${minutes} דקות`
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
  kind: 'status' | 'goal' | 'assist' | 'yellow' | 'red' | 'stat'
  label: string
}

export function playerChips(appearance: PlayerAppearance, matchStatus: MatchStatus): PlayerChip[] {
  const chips: PlayerChip[] = []
  const line = participationLine(appearance, matchStatus)
  if (line) chips.push({ kind: 'status', label: line })

  const goals = appearance.goals ?? 0
  const assists = appearance.assists ?? 0
  const yellow = appearance.yellowCards ?? 0
  const red = appearance.redCards ?? 0
  if (goals > 0) chips.push({ kind: 'goal', label: goals === 1 ? 'שער' : `${goals} שערים` })
  if (assists > 0) chips.push({ kind: 'assist', label: assists === 1 ? 'בישול' : `${assists} בישולים` })
  if (yellow > 0) chips.push({ kind: 'yellow', label: yellow === 1 ? 'צהוב' : `${yellow} צהובים` })
  if (red > 0) chips.push({ kind: 'red', label: red === 1 ? 'אדום' : `${red} אדומים` })
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

export function appearanceStats(appearance: PlayerAppearance): AppearanceStat[] {
  if (!appearance.played) return []
  if (appearance.stats?.length === 10) return appearance.stats

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
