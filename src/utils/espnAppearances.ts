import type { Match, Player, PlayerAppearance, TeamSide } from '../types'
import { players } from '../data/players'
import { espnDateKeys, espnLeagueForMatch } from './liveScores'
import { buildFixedStats } from './providerAppearances'

const ESPN_WEB = 'https://site.web.api.espn.com/apis/site/v2/sports/soccer'

interface EspnClock {
  displayValue?: string
}

interface EspnAthlete {
  displayName?: string
  fullName?: string
  lastName?: string
  shortName?: string
}

interface EspnKeyEvent {
  type?: { type?: string; text?: string }
  text?: string
  clock?: EspnClock
  participants?: Array<{ athlete?: EspnAthlete }>
}

interface EspnRosterPlayer {
  starter?: boolean
  subbedIn?: boolean
  subbedOut?: boolean
  athlete?: EspnAthlete
}

interface EspnSummary {
  keyEvents?: EspnKeyEvent[]
  commentary?: Array<{ text?: string; play?: EspnKeyEvent }>
  rosters?: Array<{ roster?: EspnRosterPlayer[] }>
}

interface EspnScoreboardEvent {
  id?: string
  name?: string
  shortName?: string
  competitions?: Array<{
    competitors?: Array<{ team?: { displayName?: string; shortDisplayName?: string } }>
  }>
}

function foldName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z]+/g, ' ')
    .trim()
}

function espnLabels(athlete: EspnAthlete | undefined, extra?: string): string[] {
  return [athlete?.displayName, athlete?.fullName, athlete?.lastName, athlete?.shortName, extra]
    .filter((name): name is string => Boolean(name))
    .map(foldName)
}

export function espnNameMatchesPlayer(espnName: string, player: Player): boolean {
  const n = foldName(espnName)
  if (!n) return false
  const aliases = [player.nameEn, ...player.searchKeys].map(foldName).filter(Boolean)
  if (aliases.some((alias) => alias === n || n.includes(alias) || alias.includes(n))) return true
  if (n.includes('abu rumi') && player.id === 'mohammed-abu-rumi') return true
  const last = foldName(player.nameEn.split(' ').slice(-1)[0] ?? '')
  return last.length >= 5 && n.split(' ').includes(last)
}

function labelsMatchPlayer(labels: string[], player: Player): boolean {
  return labels.some((label) => espnNameMatchesPlayer(label, player))
}

export function parseEspnMinute(display?: string): number | null {
  if (!display) return null
  const plus = display.match(/(\d+)\s*'\s*\+\s*'?\s*(\d+)/)
  if (plus) return Number(plus[1])
  const simple = display.match(/(\d+)/)
  return simple ? Number(simple[1]) : null
}

function eventsOf(summary: EspnSummary): EspnKeyEvent[] {
  if ((summary.keyEvents?.length ?? 0) > 0) return summary.keyEvents ?? []
  return (summary.commentary ?? [])
    .map((item) => item.play)
    .filter((item): item is EspnKeyEvent => item != null)
}

function playerFromEvent(event: EspnKeyEvent, extraText?: string): string[] {
  const fromAthletes = (event.participants ?? []).flatMap((item) => espnLabels(item.athlete))
  return [...fromAthletes, ...espnLabels(undefined, extraText ?? event.text)]
}

export function espnFactsForPlayer(summary: EspnSummary, player: Player) {
  let subIn: number | undefined
  let goals = 0
  let onAsSub = false

  for (const roster of summary.rosters ?? []) {
    for (const item of roster.roster ?? []) {
      if (!labelsMatchPlayer(espnLabels(item.athlete), player)) continue
      if (item.subbedIn) onAsSub = true
    }
  }

  for (const event of eventsOf(summary)) {
    const kind = event.type?.type ?? event.type?.text?.toLowerCase()
    const labels = playerFromEvent(event)
    const named = labelsMatchPlayer(labels, player) || (event.text != null && espnNameMatchesPlayer(event.text, player))
    if (!named) continue
    const minute = parseEspnMinute(event.clock?.displayValue)
    if (kind === 'substitution' || event.type?.text === 'Substitution') {
      onAsSub = true
      if (minute != null && subIn == null) subIn = minute
    }
    if (kind === 'goal') goals += 1
  }

  return { subIn, goals, onAsSub }
}

export function subInFitsMinutes(subIn: number, minutes: number): boolean {
  return Math.abs(90 - minutes - subIn) <= 2
}

function chooseSubInMinute(
  existing: number | undefined,
  espn: number | undefined,
  minutes: number,
): number | undefined {
  const derived = minutes > 0 ? Math.max(1, 90 - minutes) : undefined
  if (existing != null && (minutes === 0 || subInFitsMinutes(existing, minutes))) return existing
  if (espn != null && (minutes === 0 || subInFitsMinutes(espn, minutes))) return espn
  return derived ?? existing ?? espn
}

function patchAppearance(appearance: PlayerAppearance, facts: ReturnType<typeof espnFactsForPlayer>): PlayerAppearance {
  let minutes = appearance.minutes ?? 0
  const existingGoals = appearance.goals ?? 0
  let goals = existingGoals > 0 ? existingGoals : facts.goals
  let squadStatus = appearance.squadStatus
  let played = Boolean(appearance.played)
  let subbedInMinute = appearance.subbedInMinute
  const started = appearance.started

  if (facts.onAsSub && !started) {
    squadStatus = 'subbed-in'
    played = true
    subbedInMinute = chooseSubInMinute(appearance.subbedInMinute, facts.subIn, minutes)
    if (!minutes && subbedInMinute != null) minutes = Math.max(1, 90 - subbedInMinute)
  } else if (minutes > 0 && subbedInMinute != null && !subInFitsMinutes(subbedInMinute, minutes)) {
    subbedInMinute = Math.max(1, 90 - minutes)
  }
  if (facts.goals > 0 && existingGoals === 0) played = true

  if (!played && minutes === 0 && goals === 0 && subbedInMinute == null) return appearance

  return {
    ...appearance,
    squadStatus,
    played,
    minutes,
    goals,
    subbedInMinute,
    stats: played
      ? buildFixedStats({
          minutes,
          goals,
          assists: appearance.assists ?? 0,
          yellow: appearance.yellowCards ?? 0,
          red: appearance.redCards ?? 0,
          passes: appearance.stats?.find((stat) => stat.label === 'מסירות מדויקות')?.value ?? '0',
          shots: Number(appearance.stats?.find((stat) => stat.label === 'בעיטות')?.value ?? 0),
          shotsOnTarget: Number(appearance.stats?.find((stat) => stat.label === 'בעיטות למסגרת')?.value ?? 0),
          tackles: Number(appearance.stats?.find((stat) => stat.label === 'תיקולים')?.value ?? 0),
        })
      : appearance.stats ?? [],
  }
}

export function mergeEspnSummary(match: Match, summary: EspnSummary): Match {
  return {
    ...match,
    players: match.players.map((appearance) => {
      const player = players.find((item) => item.id === appearance.playerId)
      if (!player) return appearance
      return patchAppearance(appearance, espnFactsForPlayer(summary, player))
    }),
  }
}

function eventFitsMatch(match: Match, event: EspnScoreboardEvent): boolean {
  const names = (event.competitions?.[0]?.competitors ?? [])
    .flatMap((item) => [item.team?.displayName, item.team?.shortDisplayName])
    .filter((name): name is string => Boolean(name))
    .map(foldName)
  const blob = foldName([event.name, event.shortName, ...names].filter(Boolean).join(' '))
  const mentions = (side: TeamSide) => blob.includes(foldName(side.nameEn))
  return mentions(match.homeTeam) && mentions(match.awayTeam)
}

async function espnGet<T>(url: string): Promise<T | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 12_000)
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    clearTimeout(timer)
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

export async function overlayEspnAppearances(matches: Match[]): Promise<Match[]> {
  const targets = matches.filter(
    (match) => match.status === 'finished' || match.status === 'live' || match.status === 'halftime',
  )
  if (targets.length === 0) return matches

  const boards = new Map<string, Promise<EspnScoreboardEvent[] | null>>()
  function board(match: Match): Promise<EspnScoreboardEvent[] | null> {
    const league = espnLeagueForMatch(match)
    const date = espnDateKeys(match.kickoff)[0]
    const key = `${league}:${date}`
    const pending = boards.get(key)
    if (pending) return pending
    const request = espnGet<{ events?: EspnScoreboardEvent[] }>(
      `${ESPN_WEB}/${league}/scoreboard?dates=${date}&limit=100`,
    ).then((payload) => payload?.events ?? [])
    boards.set(key, request)
    return request
  }

  const overlays = await Promise.all(
    targets.map(async (match) => {
      const events = await board(match)
      const event = events?.find((item) => eventFitsMatch(match, item) && item.id)
      if (!event?.id) return match
      const summary = await espnGet<EspnSummary>(
        `${ESPN_WEB}/${espnLeagueForMatch(match)}/summary?event=${event.id}`,
      )
      return summary ? mergeEspnSummary(match, summary) : match
    }),
  )

  const byId = new Map(overlays.map((match) => [match.id, match]))
  return matches.map((match) => byId.get(match.id) ?? match)
}
