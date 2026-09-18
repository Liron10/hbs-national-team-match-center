import { useState } from 'react'
import type { Player } from '../types'
import { playerImages } from '../data/playerImages'
import { assetUrl } from '../utils/paths'

interface PlayerPortraitProps {
  player: Player
  className?: string
}

export function PlayerPortrait({ player, className = '' }: PlayerPortraitProps) {
  const [failed, setFailed] = useState(false)
  const meta = playerImages[player.id]
  const src = assetUrl(player.image, `${meta?.source ?? 'squad'}-20260918`)

  if (failed) {
    return (
      <div className={`portrait portrait--fallback ${className}`.trim()} aria-hidden="true">
        {player.nameHe.slice(0, 1)}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={player.nameHe}
      className={`portrait ${className}`.trim()}
      onError={() => setFailed(true)}
    />
  )
}
