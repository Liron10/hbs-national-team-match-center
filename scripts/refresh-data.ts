import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * Optional Football-Data.org refresh.
 * API keys must stay on the machine / GitHub Action secret, never in the frontend bundle.
 */
const API_BASE = 'https://api.football-data.org/v4'

async function main() {
  const target = path.resolve('src/data/matches.json')
  const current = await readFile(target, 'utf8')
  const key = process.env.FOOTBALL_DATA_API_KEY

  if (!key) {
    console.log('No FOOTBALL_DATA_API_KEY. Keeping existing src/data/matches.json (manual provider).')
    return
  }

  const response = await fetch(`${API_BASE}/matches`, {
    headers: { 'X-Auth-Token': key },
  })

  if (!response.ok) {
    console.error(`Football-Data.org returned ${response.status}. Existing matches.json was not overwritten.`)
    process.exitCode = 1
    return
  }

  const payload = (await response.json()) as { matches?: unknown[] }
  const count = payload.matches?.length ?? 0
  console.log(`Football-Data.org reachable (${count} raw matches).`)
  console.log('No automatic overwrite: map API payloads in this script before enabling writes.')
  await writeFile(target, current, 'utf8')
}

await main()
