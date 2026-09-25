import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { MatchDataset } from '../src/types/index.ts'
import { fetchFootballSnapshots } from '../src/services/football/fotmob.ts'
import { applyLiveSnapshots } from '../src/utils/liveScores.ts'
import { enrichMatchAppearances } from '../src/utils/fotmobAppearances.ts'

const target = path.resolve('src/data/matches.json')

async function main() {
  const current = JSON.parse(await readFile(target, 'utf8')) as MatchDataset
  const snapshots = await fetchFootballSnapshots(current.matches)
  const scored = applyLiveSnapshots(current.matches, snapshots)
  const matches = await enrichMatchAppearances(scored)
  const changed = JSON.stringify(matches) !== JSON.stringify(current.matches)

  if (!changed) {
    console.log('No live score changes.')
    return
  }

  const next: MatchDataset = {
    ...current,
    meta: {
      ...current.meta,
      source: 'manual',
      sourceLabelHe: 'הנתונים מוזנים ידנית על ידי מנהל הדף',
      sourceLabelEn: 'Entered by the page administrator',
      updatedAt: new Date().toISOString(),
    },
    matches,
  }

  await writeFile(target, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
  console.log(
    `Updated scores and appearances for ${matches.filter((match) => match.status !== 'scheduled').length} matches.`,
  )
}

await main()
