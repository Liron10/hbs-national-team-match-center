import { useState } from 'react'
import type { Player } from '../types'
import { assetUrl } from '../utils/paths'

interface PlayerPortraitProps {
  player: Player
  className?: string
}

export function PlayerPortrait({ player, className = '' }: PlayerPortraitProps) {
  const [failed, setFailed] = useState(false)
  const src = assetUrl(player.image)

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
