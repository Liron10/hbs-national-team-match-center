/**
 * Official football-data.org client for the refresh job.
 * The GitHub Pages bundle cannot hold this key.
 */
export class FootballDataProvider {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async ping(): Promise<boolean> {
    const response = await fetch('https://api.football-data.org/v4/competitions', {
      headers: { 'X-Auth-Token': this.apiKey },
    })
    return response.ok
  }
}
