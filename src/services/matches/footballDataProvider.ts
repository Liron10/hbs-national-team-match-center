/**
 * Ready-to-wire Football-Data.org provider.
 * Not used by the GitHub Pages UI because the API key cannot be kept secret in the browser.
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
