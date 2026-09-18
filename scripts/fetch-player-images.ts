import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

interface CatalogPlayer {
  id: string
  nameHe: string
  nameEn: string
  nationalTeam: string
  transfermarktId: string
  transfermarktUrl: string
  wikipediaTitle?: string
  initials: string
}

export const PLAYER_IMAGE_CATALOG: CatalogPlayer[] = [
  {
    id: 'eliel-peretz',
    nameHe: 'אליאל פרץ',
    nameEn: 'Eliel Peretz',
    nationalTeam: 'Israel',
    transfermarktId: '444018',
    transfermarktUrl: 'https://www.transfermarkt.com/eliel-peretz/profil/spieler/444018',
    wikipediaTitle: 'Eliel Peretz',
    initials: 'אפ',
  },
  {
    id: 'idan-nachmias',
    nameHe: 'עידן נחמיאס',
    nameEn: 'Idan Nachmias',
    nationalTeam: 'Israel',
    transfermarktId: '408422',
    transfermarktUrl: 'https://www.transfermarkt.com/idan-nachmias/profil/spieler/408422',
    wikipediaTitle: 'Idan Nachmias',
    initials: 'ענ',
  },
  {
    id: 'guy-mizrahi',
    nameHe: 'גיא מזרחי',
    nameEn: 'Guy Mizrahi',
    nationalTeam: 'Israel',
    transfermarktId: '704071',
    transfermarktUrl: 'https://www.transfermarkt.com/guy-mizrahi/profil/spieler/704071',
    wikipediaTitle: 'Guy Mizrahi',
    initials: 'גמ',
  },
  {
    id: 'niv-yehoshua',
    nameHe: 'ניב יהושע',
    nameEn: 'Niv Yehoshua',
    nationalTeam: 'Israel U21',
    transfermarktId: '926457',
    transfermarktUrl: 'https://www.transfermarkt.com/niv-yehoshua/profil/spieler/926457',
    wikipediaTitle: 'Niv Yehoshua',
    initials: 'ני',
  },
  {
    id: 'mohammed-abu-rumi',
    nameHe: 'מוחמד אבו רומי',
    nameEn: 'Muhammad Abu Rumi',
    nationalTeam: 'Israel U21',
    transfermarktId: '1078063',
    transfermarktUrl:
      'https://www.transfermarkt.com/muhammad-abu-rumi/profil/spieler/1078063',
    wikipediaTitle: 'Muhammad Abu Rumi',
    initials: 'מא',
  },
  {
    id: 'adrian-ugarriza',
    nameHe: 'אדריאן אוגריסה',
    nameEn: 'Adrián Ugarriza',
    nationalTeam: 'Peru',
    transfermarktId: '325726',
    transfermarktUrl: 'https://www.transfermarkt.com/adrian-ugarriza/profil/spieler/325726',
    wikipediaTitle: 'Adrián Ugarriza',
    initials: 'או',
  },
  {
    id: 'yoan-stoyanov',
    nameHe: 'יואן סטויאנוב',
    nameEn: 'Yoan Stoyanov',
    nationalTeam: 'Bulgaria',
    transfermarktId: '848641',
    transfermarktUrl: 'https://www.transfermarkt.com/yoan-stoyanov/profil/spieler/848641',
    wikipediaTitle: 'Yoni Stoyanov',
    initials: 'יס',
  },
  {
    id: 'javon-east',
    nameHe: 'ג׳בון איסט',
    nameEn: 'Javon East',
    nationalTeam: 'Jamaica',
    transfermarktId: '563479',
    transfermarktUrl: 'https://www.transfermarkt.com/javon-east/profil/spieler/563479',
    wikipediaTitle: 'Javon East',
    initials: 'גי',
  },
]

function placeholderSvg(initials: string, name: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="${name}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2a1114"/>
      <stop offset="1" stop-color="#14161d"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" fill="url(#g)"/>
  <circle cx="128" cy="96" r="42" fill="#3a181c"/>
  <ellipse cx="128" cy="210" rx="78" ry="54" fill="#3a181c"/>
  <text x="128" y="112" text-anchor="middle" fill="#ffd3d0" font-size="42" font-family="Arial, sans-serif">${initials}</text>
</svg>
`
}

async function tryFetch(url: string): Promise<{ ok: boolean; blocked: boolean; bytes?: Uint8Array; contentType?: string }> {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        Accept: 'image/*,application/json;q=0.9,*/*;q=0.1',
        'User-Agent': 'HBSMatchCenter/1.0 (educational local asset fetch; +https://github.com/)',
      },
    })
    const status = response.status
    if (status === 403 || status === 429 || status === 503) {
      return { ok: false, blocked: true }
    }
    if (!response.ok) return { ok: false, blocked: false }
    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('text/html')) return { ok: false, blocked: true }
    const bytes = new Uint8Array(await response.arrayBuffer())
    if (bytes.byteLength < 800) return { ok: false, blocked: false }
    return { ok: true, blocked: false, bytes, contentType }
  } catch {
    return { ok: false, blocked: false }
  }
}

function extensionFor(contentType: string, url: string): string {
  if (contentType.includes('webp') || url.endsWith('.webp')) return 'webp'
  if (contentType.includes('png') || url.endsWith('.png')) return 'png'
  if (contentType.includes('jpeg') || contentType.includes('jpg') || url.endsWith('.jpg')) {
    return 'jpg'
  }
  return 'img'
}

async function main() {
  const outDir = path.resolve('public/players')
  await mkdir(outDir, { recursive: true })
  const report: string[] = ['# Player image fetch report', '']
  let blocked = false
  const imageMap: Record<string, { file: string; verified: boolean; source?: string }> = {}

  for (const player of PLAYER_IMAGE_CATALOG) {
    await writeFile(
      path.join(outDir, `${player.id}.svg`),
      placeholderSvg(player.initials, player.nameHe),
      'utf8',
    )
    imageMap[player.id] = { file: `players/${player.id}.svg`, verified: false }

    const candidates = [
      `https://img.a.transfermarkt.technology/portrait/header/${player.transfermarktId}.jpg`,
      `https://tmssl.akamaized.net/images/portrait/header/${player.transfermarktId}.jpg`,
    ]

    let saved = false
    for (const url of candidates) {
      const result = await tryFetch(url)
      if (result.blocked) {
        blocked = true
        report.push(`- ${player.nameEn}: blocked by remote protection, left placeholder.`)
        saved = true
        break
      }
      if (result.ok && result.bytes && result.contentType) {
        const ext = extensionFor(result.contentType, url)
        const file = `${player.id}.${ext}`
        await writeFile(path.join(outDir, file), result.bytes)
        imageMap[player.id] = {
          file: `players/${file}`,
          verified: true,
          source: 'transfermarkt-cdn',
        }
        report.push(`- ${player.nameEn}: saved public/players/${file}`)
        saved = true
        break
      }
    }
    if (!saved) {
      report.push(`- ${player.nameEn}: no public image downloaded, placeholder kept.`)
    }
    await new Promise((resolve) => setTimeout(resolve, 400))
  }

  report.push('')
  report.push(blocked ? 'Stopped additional Transfermarkt scraping after protection signals.' : '')
  await writeFile(path.resolve('public/players/FETCH-REPORT.md'), report.join('\n'), 'utf8')
  const serialized = JSON.stringify(imageMap, null, 2)
  await writeFile(
    path.resolve('src/data/playerImages.ts'),
    `export const playerImages: Record<
  string,
  { file: string; verified: boolean; source?: string }
> = ${serialized}
`,
    'utf8',
  )
  console.log(report.join('\n'))
}

await main()
