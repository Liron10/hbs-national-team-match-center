import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { PLAYER_IMAGE_CATALOG, placeholderSvg } from './player-catalog.ts'

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'

interface FetchResult {
  ok: boolean
  blocked: boolean
  status?: number
  bytes?: Uint8Array
  contentType?: string
  text?: string
}

async function request(url: string, accept: string): Promise<FetchResult> {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        Accept: accept,
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': BROWSER_UA,
        Referer: 'https://www.transfermarkt.com/',
      },
    })
    const status = response.status
    if (status === 403 || status === 429 || status === 503) {
      return { ok: false, blocked: true, status }
    }
    if (!response.ok) return { ok: false, blocked: false, status }
    const contentType = response.headers.get('content-type') ?? ''
    const bytes = new Uint8Array(await response.arrayBuffer())
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
    return { ok: true, blocked: false, status, bytes, contentType, text }
  } catch {
    return { ok: false, blocked: false }
  }
}

function looksProtected(html: string): boolean {
  return /just a moment|cf-browser-verification|attention required|access denied|captcha/i.test(
    html,
  )
}

function extractOgImage(html: string): string | undefined {
  const patterns = [
    /property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
  ]
  for (const pattern of patterns) {
    const match = html.replaceAll('\n', ' ').match(pattern)
    if (match?.[1]) return match[1]
  }
  return undefined
}

function isPlayerPortrait(url: string, transfermarktId: string): boolean {
  const lower = url.toLowerCase()
  if (!lower.includes('transfermarkt.technology/portrait/')) return false
  if (lower.includes('default') || lower.includes('placeholder') || lower.includes('kplacehalter')) {
    return false
  }
  return lower.includes(`/${transfermarktId}-`) || lower.includes(`/${transfermarktId}.`)
}

function extensionFor(contentType: string, url: string): string {
  if (contentType.includes('webp') || url.includes('.webp')) return 'webp'
  if (contentType.includes('png') || url.includes('.png')) return 'png'
  return 'jpg'
}

async function main() {
  const outDir = path.resolve('public/players')
  await mkdir(outDir, { recursive: true })
  const report: string[] = ['# Player image fetch report', '']
  const imageMap: Record<string, { file: string; verified: boolean; source?: string }> = {}

  for (const player of PLAYER_IMAGE_CATALOG) {
    await writeFile(
      path.join(outDir, `${player.id}.svg`),
      placeholderSvg(player.initials, player.nameHe),
      'utf8',
    )
    imageMap[player.id] = { file: `players/${player.id}.svg`, verified: false }

    const page = await request(player.transfermarktUrl, 'text/html,application/xhtml+xml')
    if (page.blocked || (page.text && looksProtected(page.text))) {
      report.push(`- ${player.nameEn}: Transfermarkt blocked the request. Placeholder kept.`)
      continue
    }
    if (!page.ok || !page.text) {
      report.push(`- ${player.nameEn}: profile page was not readable. Placeholder kept.`)
      continue
    }

    const ogImage = extractOgImage(page.text)
    if (!ogImage || !isPlayerPortrait(ogImage, player.transfermarktId)) {
      report.push(
        `- ${player.nameEn}: no verified portrait URL for ID ${player.transfermarktId}. Placeholder kept.`,
      )
      continue
    }

    const image = await request(ogImage, 'image/jpeg,image/webp,image/png,image/*')
    if (image.blocked) {
      report.push(`- ${player.nameEn}: image CDN blocked the request. Placeholder kept.`)
      continue
    }
    if (
      !image.ok ||
      !image.bytes ||
      (image.contentType && image.contentType.includes('text/html')) ||
      image.bytes.byteLength < 1500
    ) {
      report.push(`- ${player.nameEn}: portrait download failed. Placeholder kept.`)
      continue
    }

    const ext = extensionFor(image.contentType ?? '', ogImage)
    const file = `${player.id}.${ext}`
    await writeFile(path.join(outDir, file), image.bytes)
    imageMap[player.id] = {
      file: `players/${file}`,
      verified: true,
      source: 'transfermarkt',
    }
    report.push(`- ${player.nameEn}: saved public/players/${file}`)
    await new Promise((resolve) => setTimeout(resolve, 900))
  }

  await writeFile(path.resolve('public/players/FETCH-REPORT.md'), `${report.join('\n')}\n`, 'utf8')
  await writeFile(
    path.resolve('src/data/playerImages.ts'),
    `export const playerImages: Record<
  string,
  { file: string; verified: boolean; source?: string }
> = ${JSON.stringify(imageMap, null, 2)}
`,
    'utf8',
  )
  console.log(report.join('\n'))
}

await main()
