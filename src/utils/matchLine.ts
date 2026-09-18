import type { Match, TeamSide } from '../types'
import { getPlayer } from '../data/players'
import { getTeam } from '../data/teams'

const ISRAEL_SIDES = new Set(['ISR', 'ISR-U21'])

export function lastNameHe(nameHe: string): string {
  const parts = nameHe.trim().split(/\s+/)
  return parts.at(-1) ?? nameHe
}

export function isIsraelNationalSide(code: TeamSide['code']): boolean {
  return ISRAEL_SIDES.has(code)
}

export function ourNationalSide(match: Match): TeamSide {
  for (const appearance of match.players) {
    const player = getPlayer(appearance.playerId)
    if (!player) continue
    if (match.homeTeam.code === player.nationalTeamCode) return getTeam(match.homeTeam.code)
    if (match.awayTeam.code === player.nationalTeamCode) return getTeam(match.awayTeam.code)
  }
  return getTeam(match.homeTeam.code)
}

export function opponentNationalSide(match: Match): TeamSide {
  const ours = ourNationalSide(match)
  const other = match.homeTeam.code === ours.code ? match.awayTeam : match.homeTeam
  return getTeam(other.code)
}

export function annotatedTeamLabel(match: Match, team: TeamSide): string {
  const base = getTeam(team.code).nameHe
  if (isIsraelNationalSide(team.code)) return base

  const names = [
    ...new Set(
      match.players
        .map((appearance) => getPlayer(appearance.playerId))
        .filter((player) => player?.nationalTeamCode === team.code)
        .map((player) => lastNameHe(player!.nameHe)),
    ),
  ]

  return names.length > 0 ? `${base} (${names.join(', ')})` : base
}

export function matchLineup(match: Match): {
  left: { team: TeamSide; label: string }
  right: { team: TeamSide; label: string }
} {
  const ours = ourNationalSide(match)
  if (!isIsraelNationalSide(ours.code)) {
    const opponent = opponentNationalSide(match)
    return {
      left: { team: ours, label: annotatedTeamLabel(match, ours) },
      right: { team: opponent, label: getTeam(opponent.code).nameHe },
    }
  }

  return {
    left: {
      team: getTeam(match.homeTeam.code),
      label: getTeam(match.homeTeam.code).nameHe,
    },
    right: {
      team: getTeam(match.awayTeam.code),
      label: getTeam(match.awayTeam.code).nameHe,
    },
  }
}

export function matchHeadline(match: Match): string {
  const { left, right } = matchLineup(match)
  return `${left.label} – ${right.label}`
}

export function hasVerifiedAppearance(match: Match): boolean {
  return match.players.some((appearance) => appearance.squadStatus !== 'unknown')
}
