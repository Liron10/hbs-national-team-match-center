import type { CountryCode, Match, TeamSide } from '../types'
import { getPlayer } from '../data/players'
import { getTeam } from '../data/teams'

const ISRAEL_SIDES = new Set(['ISR', 'ISR-U21'])

export function lastNameHe(nameHe: string): string {
  const parts = nameHe.trim().split(/\s+/)
  return parts.at(-1) ?? nameHe
}

export function displayTeamName(team: TeamSide): string {
  return team.nameHe.replace(' עד 21', ' U21')
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
  const base = displayTeamName(getTeam(team.code))
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
  const home = getTeam(match.homeTeam.code)
  const away = getTeam(match.awayTeam.code)

  return {
    left: { team: home, label: annotatedTeamLabel(match, home) },
    right: { team: away, label: annotatedTeamLabel(match, away) },
  }
}

export function matchHeadline(match: Match): string {
  const { left, right } = matchLineup(match)
  return `${left.label} – ${right.label}`
}

export function hbsWatermarkCodes(match: Match): CountryCode[] {
  const codes: CountryCode[] = []
  const seen = new Set<string>()
  for (const appearance of match.players) {
    const player = getPlayer(appearance.playerId)
    if (!player) continue
    const code =
      match.homeTeam.code === player.nationalTeamCode
        ? match.homeTeam.code
        : match.awayTeam.code === player.nationalTeamCode
          ? match.awayTeam.code
          : player.nationalTeamCode
    if (seen.has(code)) continue
    seen.add(code)
    codes.push(code)
  }
  return codes
}
