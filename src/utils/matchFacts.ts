import type { Match, PlayerAppearance } from '../types'
import { getPlayer } from '../data/players'
import { displayTeamName, ourNationalSide } from './matchLine'

function resultClause(match: Match): string {
  const ours = ourNationalSide(match)
  if (match.homeScore == null || match.awayScore == null) return ''
  const ourScore = match.homeTeam.code === ours.code ? match.homeScore : match.awayScore
  const theirScore = match.homeTeam.code === ours.code ? match.awayScore : match.homeScore
  const team = displayTeamName(ours)
  if (ourScore > theirScore) return ` בניצחון ${team}`
  if (ourScore < theirScore) return ` בהפסד ${team}`
  return ' בתיקו'
}

function highlightScore(appearance: PlayerAppearance): number {
  if ((appearance.goals ?? 0) > 0) return 300 + (appearance.goals ?? 0)
  if ((appearance.assists ?? 0) > 0) return 200 + (appearance.assists ?? 0)
  if (appearance.played && (appearance.minutes ?? 0) >= 90) return 120
  if (appearance.played) return appearance.minutes ?? 1
  return 0
}

function appearanceSentence(name: string, appearance: PlayerAppearance, result: string): string | null {
  const minutes = appearance.minutes ?? 0
  const goals = appearance.goals ?? 0
  const subIn = appearance.subbedInMinute
  if (!appearance.played) return null
  if (subIn != null) {
    const played = minutes > 0 ? ` ושיחק ${minutes} דקות` : ''
    return `${name} עלה מהספסל בדקה ${subIn}${played}.`
  }
  if (minutes >= 90 && goals > 0) return `${name} השלים 90 דקות וכבש${result}.`
  if (minutes >= 90) return `${name} השלים 90 דקות${result}.`
  if (goals > 0) return `${name} כבש${result}.`
  if (minutes > 0) return `${name} שיחק ${minutes} דקות.`
  return null
}

export function matchFactLine(match: Match): string | null {
  if (match.status !== 'finished') return null
  const ranked = [...match.players].sort((a, b) => highlightScore(b) - highlightScore(a))
  const top = ranked[0]
  if (!top) return null
  const player = getPlayer(top.playerId)
  if (!player) return null
  return appearanceSentence(player.nameHe, top, resultClause(match))
}
