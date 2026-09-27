import type { Match, MatchDataProvider, PlayerAppearance } from '../../types'
import { bundledMatches, fetchSharedMatches } from './sharedDataset'

export class ManualDataProvider implements MatchDataProvider {
  private matches: Match[]

  constructor(matches: Match[] = bundledMatches()) {
    this.matches = matches
  }

  async getMatches(): Promise<Match[]> {
    if (import.meta.env.DEV && import.meta.env.VITE_USE_DEMO_DATA === 'true') {
      const { createDemoMatches } = await import('./demoData')
      return [...createDemoMatches(), ...this.matches]
    }
    return fetchSharedMatches(this.matches)
  }

  async getMatch(id: string): Promise<Match | undefined> {
    const matches = await this.getMatches()
    return matches.find((match) => match.id === id)
  }

  async getPlayerAppearance(
    matchId: string,
    playerId: string,
  ): Promise<PlayerAppearance | undefined> {
    const match = await this.getMatch(matchId)
    return match?.players.find((appearance) => appearance.playerId === playerId)
  }

  async refresh(): Promise<Match[]> {
    return this.getMatches()
  }
}

export function createMatchDataProvider(): MatchDataProvider {
  return new ManualDataProvider()
}
