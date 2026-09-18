import { assetUrl } from '../utils/paths'

interface ClubLogoProps {
  className?: string
}

export function ClubLogo({ className = '' }: ClubLogoProps) {
  return (
    <img
      src={assetUrl('hbs-crest.png')}
      alt="הפועל באר שבע"
      className={`club-logo ${className}`.trim()}
    />
  )
}
