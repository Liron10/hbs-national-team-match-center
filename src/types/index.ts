export type NationalTeamCode =
  | 'ISR'
  | 'ISR-U21'
  | 'PER'
  | 'BGR'
  | 'JAM'

export type CountryCode =
  | NationalTeamCode
  | 'AUT'
  | 'IRL'
  | 'XKX'
  | 'USA'
  | 'MEX'
  | 'CAN'
  | 'COL'
  | 'LUX'
  | 'EST'
  | 'ISL'
  | 'GTM'
  | 'HON'
  | 'SLV'
  | 'SVN'
  | 'NOR'

export type MatchStatus =
  | 'scheduled'
  | 'live'
  | 'halftime'
  | 'finished'
  | 'postponed'
  | 'cancelled'

export type SquadStatus =
  | 'starter'
  | 'bench'
  | 'subbed-in'
  | 'subbed-out'
  | 'unused'
  | 'not-in-squad'
  | 'unknown'

export type MatchFilter = 'all' | 'live' | 'today' | 'upcoming' | 'finished'

export type DerivedMatchBucket = 'live' | 'today' | 'upcoming' | 'finished' | 'other'

export interface NationalTeam {
  code: NationalTeamCode
  nameHe: string
  nameEn: string
  countryCode: Exclude<CountryCode, 'ISR-U21'> | 'ISR'
  ageGroup?: 'senior' | 'u21'
}

export interface TeamSide {
  code: CountryCode
  nameHe: string
  nameEn: string
}

export interface Player {
  id: string
  nameHe: string
  nameEn: string
  searchKeys: string[]
  team: string
  nationalTeam: NationalTeamCode
  nationalTeamCode: NationalTeamCode
  image: string
  imageVerified: boolean
  transfermarktUrl: string
  transfermarktId: string
  fotmobId: string
}

export interface PlayerAppearance {
  playerId: string
  squadStatus: SquadStatus
  started?: boolean
  played?: boolean
  minutes?: number
  goals?: number
  assists?: number
  yellowCards?: number
  redCards?: number
  subbedInMinute?: number
  subbedOutMinute?: number
}

export interface Match {
  id: string
  competition: string
  competitionHe: string
  homeTeam: TeamSide
  awayTeam: TeamSide
  kickoff: string
  status: MatchStatus
  homeScore: number | null
  awayScore: number | null
  clock?: string
  venue?: string
  players: PlayerAppearance[]
  lastUpdated: string
  sources?: string[]
}

export interface MatchDataset {
  meta: {
    source: 'manual' | 'api'
    sourceLabelHe: string
    sourceLabelEn: string
    updatedAt: string
    window: string
    notesHe?: string
  }
  matches: Match[]
}

export interface MatchDataProvider {
  getMatches(): Promise<Match[]>
  getMatch(id: string): Promise<Match | undefined>
  getPlayerAppearance(
    matchId: string,
    playerId: string,
  ): Promise<PlayerAppearance | undefined>
  refresh(): Promise<Match[]>
}
