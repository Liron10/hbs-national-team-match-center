import { useState } from 'react'
import type { Player } from '../types'
import { playerImages } from '../data/playerImages'
import { assetUrl } from '../utils/paths'

interface PlayerPortraitProps {
  player: Player
  className?: string
}

function initials(nameHe: string): string {
  return nameHe
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('.')
}

export function PlayerPortrait({ player, className = '' }: PlayerPortraitProps) {
  const [failed, setFailed] = useState(false)
  const meta = playerImages[player.id]
  const src = assetUrl(player.image, `${meta?.source ?? 'squad'}-20260918`)

  if (failed) {
    return (
      <div className={`portrait portrait--fallback ${className}`.trim()} aria-hidden="true">
        {initials(player.nameHe)}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={player.nameHe}
      width={56}
      height={56}
      loading="lazy"
      decoding="async"
      className={`portrait ${className}`.trim()}
      onError={() => setFailed(true)}
    />
  )
}
