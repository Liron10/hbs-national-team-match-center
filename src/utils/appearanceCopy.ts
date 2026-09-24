import type { MatchStatus, PlayerAppearance, SquadStatus } from '../types'
import { buildFixedStats } from './fotmobAppearances'

const squadLabels: Record<SquadStatus, string> = {
  starter: 'פתח בהרכב',
  bench: 'ספסל',
  'subbed-in': 'נכנס כמחליף',
  'subbed-out': 'הוחלף',
  unused: 'לא שותף',
  'not-in-squad': 'לא שיחק',
  unknown: '',
}

export function matchShowsPlayerStats(status: MatchStatus): boolean {
  return status === 'live' || status === 'halftime' || status === 'finished'
}

export function participationLine(appearance: PlayerAppearance): string {
  const minutes = appearance.minutes ?? 0
  const subIn = appearance.subbedInMinute
  const subOut = appearance.subbedOutMinute

  if (appearance.squadStatus === 'unknown') return ''
  if (appearance.squadStatus === 'not-in-squad') return 'לא שיחק'
  if (appearance.squadStatus === 'unused' || appearance.squadStatus === 'bench' || !appearance.played) {
    return 'לא שותף'
  }

  if (subIn != null && subOut != null) {
    return `נכנס בדקה ${subIn}' והוחלף בדקה ${subOut}'`
  }
  if (subOut != null) return `הוחלף בדקה ${subOut}'`
  if (subIn != null) return `נכנס בדקה ${subIn}'`
  if (minutes >= 90) return `שותף משחק מלא ${minutes} דקות`
  if (minutes > 0) return `שותף ${minutes} דקות`
  return squadLabels[appearance.squadStatus]
}

export function squadStatusLabel(status: SquadStatus): string {
  return squadLabels[status]
}

export interface AppearanceStat {
  label: string
  value: string
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
