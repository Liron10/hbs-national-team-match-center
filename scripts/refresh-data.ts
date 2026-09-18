import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { MatchDataset } from '../src/types/index.ts'
import { fetchFootballSnapshots } from '../src/services/football/fotmob.ts'
import { applyLiveSnapshots } from '../src/utils/liveScores.ts'

const target = path.resolve('src/data/matches.json')

async function main() {
  const current = JSON.parse(await readFile(target, 'utf8')) as MatchDataset
  const snapshots = await fetchFootballSnapshots(current.matches)
  const matches = applyLiveSnapshots(current.matches, snapshots)
  const changed = JSON.stringify(matches) !== JSON.stringify(current.matches)

  if (!changed) {
    console.log('No live score changes.')
    return
  }

  const next: MatchDataset = {
    ...current,
    meta: {
      ...current.meta,
      source: 'api',
      sourceLabelHe: 'עדכון חי מ-FotMob',
      sourceLabelEn: 'Live scores from FotMob',
      updatedAt: new Date().toISOString(),
    },
    matches,
  }

  await writeFile(target, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
  console.log(`Updated ${matches.filter((match) => match.status === 'live' || match.status === 'halftime').length} live matches.`)
}

await main()
