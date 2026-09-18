import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'

const PLAYERS = [
  {
    id: 'eliel-peretz',
    nameHe: 'אליאל פרץ',
    page: 'https://hbsfc.co.il/team-squad/%d7%90%d7%9c%d7%99%d7%90%d7%9c-%d7%a4%d7%a8%d7%a5/',
  },
  {
    id: 'idan-nachmias',
    nameHe: 'עידן נחמיאס',
    page: 'https://hbsfc.co.il/team-squad/%d7%a2%d7%99%d7%93%d7%9f-%d7%a0%d7%97%d7%9e%d7%99%d7%90%d7%a1/',
  },
  {
    id: 'guy-mizrahi',
    nameHe: 'גיא מזרחי',
    page: 'https://hbsfc.co.il/team-squad/%d7%92%d7%99%d7%90-%d7%9e%d7%96%d7%a8%d7%97%d7%99/',
  },
  {
    id: 'niv-yehoshua',
    nameHe: 'ניב יהושע',
    page: 'https://hbsfc.co.il/team-squad/%d7%a0%d7%99%d7%91-%d7%99%d7%94%d7%95%d7%a9%d7%a2/',
  },
  {
    id: 'mohammed-abu-rumi',
    nameHe: 'מוחמד אבו רומי',
    page: 'https://hbsfc.co.il/team-squad/%d7%9e%d7%95%d7%97%d7%9e%d7%93-%d7%90%d7%91%d7%95-%d7%a8%d7%95%d7%9e%d7%99/',
  },
  {
    id: 'yoan-stoyanov',
    nameHe: 'יואן סטויאנוב',
    page: 'https://hbsfc.co.il/team-squad/%d7%99%d7%95%d7%90%d7%9f-%d7%a1%d7%98%d7%95%d7%99%d7%90%d7%a0%d7%95%d7%91/',
  },
  {
    id: 'javon-east',
    nameHe: "ג'בון איסט",
    page: 'https://hbsfc.co.il/team-squad/%d7%92%d7%91%d7%95%d7%9f-%d7%90%d7%99%d7%a1%d7%98/',
  },
]

function extensionFor(contentType, url) {
  if (contentType.includes('png') || url.includes('.png')) return 'png'
  if (contentType.includes('jpeg') || contentType.includes('jpg') || url.includes('.jpg')) return 'jpg'
  return 'webp'
}

function extractPortrait(html) {
  const tags = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0])
  for (const tag of tags) {
    const src = tag.match(/\ssrc="(https?:\/\/[^"]+)"/i)?.[1]
    if (!src) continue
    if (!/wp-content\/uploads/i.test(src)) continue
    if (/\.svg($|\?)/i.test(src) || /hbs-logo|sponsors/i.test(src)) continue
    if (/\.(webp|png|jpe?g)($|\?)/i.test(src)) return src
  }
  return undefined
}

async function download(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'image/webp,image/png,image/jpeg,image/*,*/*;q=0.8',
      'User-Agent': UA,
      Referer: 'https://hbsfc.co.il/team-squad/',
    },
  })
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  const bytes = new Uint8Array(await response.arrayBuffer())
  return { bytes, contentType: response.headers.get('content-type') ?? '', finalUrl: response.url }
}

const outDir = path.resolve('public/players')
await mkdir(outDir, { recursive: true })

const imageMap = {}
const report = ['# Club squad portraits', '']

const picturesDir = path.resolve('Pictures')
const localUgarriza = existsSync(picturesDir)
  ? (await import('node:fs')).readdirSync(picturesDir).find((name) => name.includes('אוגריסה'))
  : undefined

if (localUgarriza) {
  const dest = path.join(outDir, 'adrian-ugarriza.png')
  await copyFile(path.join(picturesDir, localUgarriza), dest)
  imageMap['adrian-ugarriza'] = {
    file: 'players/adrian-ugarriza.png',
    verified: true,
    source: 'local-project',
  }
  report.push(`- Adrián Ugarriza: copied Pictures/${localUgarriza}`)
} else {
  report.push('- Adrián Ugarriza: local file missing')
}

for (const player of PLAYERS) {
  const page = await fetch(player.page, {
    headers: { Accept: 'text/html', 'User-Agent': UA, Referer: 'https://hbsfc.co.il/team-squad/' },
  })
  if (!page.ok) {
    report.push(`- ${player.nameHe}: profile HTTP ${page.status}`)
    continue
  }
  const html = await page.text()
  const src = extractPortrait(html)
  if (!src) {
    report.push(`- ${player.nameHe}: no attachment-full image`)
    continue
  }
  const image = await download(src)
  const ext = extensionFor(image.contentType, image.finalUrl)
  const file = `${player.id}.${ext}`
  await writeFile(path.join(outDir, file), image.bytes)
  imageMap[player.id] = {
    file: `players/${file}`,
    verified: true,
    source: 'hbsfc.co.il',
  }
  report.push(`- ${player.nameHe}: ${file} (${image.bytes.byteLength} bytes)`)
}

const ts =
  'export const playerImages: Record<\n' +
  '  string,\n' +
  '  { file: string; verified: boolean; source?: string }\n' +
  '> = ' +
  JSON.stringify(imageMap, null, 2) +
  '\n'

await writeFile(path.resolve('src/data/playerImages.ts'), ts)
await writeFile(path.resolve('public/players/FETCH-REPORT.md'), report.join('\n') + '\n')
console.log(report.join('\n'))
console.log(JSON.stringify(imageMap, null, 2))
