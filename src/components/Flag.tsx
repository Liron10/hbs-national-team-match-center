import type { CountryCode } from '../types'

interface FlagProps {
  code: CountryCode
  title: string
  className?: string
}

const flagSvgs: Record<CountryCode, string> = {
  ISR: `<rect width="220" height="154" fill="#fff"/><rect y="22" width="220" height="22" fill="#0038b8"/><rect y="110" width="220" height="22" fill="#0038b8"/><path fill="none" stroke="#0038b8" stroke-width="5.2" stroke-linejoin="miter" d="M110 49 L137 96 H83 Z"/><path fill="none" stroke="#0038b8" stroke-width="5.2" stroke-linejoin="miter" d="M110 105 L83 58 H137 Z"/>`,
  'ISR-U21': `<rect width="220" height="154" fill="#fff"/><rect y="22" width="220" height="22" fill="#0038b8"/><rect y="110" width="220" height="22" fill="#0038b8"/><path fill="none" stroke="#0038b8" stroke-width="5.2" stroke-linejoin="miter" d="M110 49 L137 96 H83 Z"/><path fill="none" stroke="#0038b8" stroke-width="5.2" stroke-linejoin="miter" d="M110 105 L83 58 H137 Z"/>`,
  PER: `<rect width="20" height="42" fill="#d91023"/><rect x="20" width="20" height="42" fill="#fff"/><rect x="40" width="20" height="42" fill="#d91023"/>`,
  BGR: `<rect width="60" height="14" fill="#fff"/><rect y="14" width="60" height="14" fill="#00966e"/><rect y="28" width="60" height="14" fill="#d62612"/>`,
  JAM: `<polygon points="0,0 60,0 30,21" fill="#000"/><polygon points="0,42 60,42 30,21" fill="#000"/><polygon points="0,0 0,42 30,21" fill="#009b3a"/><polygon points="60,0 60,42 30,21" fill="#009b3a"/><polygon points="0,0 60,42 56,42 0,4" fill="#fed100"/><polygon points="60,0 4,42 0,42 56,0" fill="#fed100"/>`,
  AUT: `<rect width="60" height="14" fill="#ed2939"/><rect y="14" width="60" height="14" fill="#fff"/><rect y="28" width="60" height="14" fill="#ed2939"/>`,
  IRL: `<rect width="20" height="42" fill="#169b62"/><rect x="20" width="20" height="42" fill="#fff"/><rect x="40" width="20" height="42" fill="#ff883e"/>`,
  XKX: `<rect width="60" height="42" fill="#244aa5"/><polygon points="30,8 32,14 38,14 33,18 35,24 30,20 25,24 27,18 22,14 28,14" fill="#d0a650"/>`,
  USA: `<rect width="60" height="42" fill="#bf0a30"/><rect y="3.2" width="60" height="3.2" fill="#fff"/><rect y="9.6" width="60" height="3.2" fill="#fff"/><rect y="16" width="60" height="3.2" fill="#fff"/><rect y="22.4" width="60" height="3.2" fill="#fff"/><rect y="28.8" width="60" height="3.2" fill="#fff"/><rect y="35.2" width="60" height="3.2" fill="#fff"/><rect width="26" height="22.4" fill="#002868"/>`,
  MEX: `<rect width="20" height="42" fill="#006847"/><rect x="20" width="20" height="42" fill="#fff"/><rect x="40" width="20" height="42" fill="#ce1126"/>`,
  CAN: `<rect width="15" height="42" fill="#ff0000"/><rect x="15" width="30" height="42" fill="#fff"/><rect x="45" width="15" height="42" fill="#ff0000"/><polygon points="30,10 33,18 41,18 35,23 37,32 30,26 23,32 25,23 19,18 27,18" fill="#ff0000"/>`,
  COL: `<rect width="60" height="21" fill="#fcd116"/><rect y="21" width="60" height="10.5" fill="#003893"/><rect y="31.5" width="60" height="10.5" fill="#ce1126"/>`,
  LUX: `<rect width="60" height="14" fill="#ed2939"/><rect y="14" width="60" height="14" fill="#fff"/><rect y="28" width="60" height="14" fill="#00a1de"/>`,
  EST: `<rect width="60" height="14" fill="#0072ce"/><rect y="14" width="60" height="14" fill="#000"/><rect y="28" width="60" height="14" fill="#fff"/>`,
  ISL: `<rect width="60" height="42" fill="#02529c"/><rect x="16" width="8" height="42" fill="#fff"/><rect y="17" width="60" height="8" fill="#fff"/><rect x="18" width="4" height="42" fill="#dc1e35"/><rect y="19" width="60" height="4" fill="#dc1e35"/>`,
  GTM: `<rect width="20" height="42" fill="#4997d0"/><rect x="20" width="20" height="42" fill="#fff"/><rect x="40" width="20" height="42" fill="#4997d0"/>`,
  HON: `<rect width="60" height="14" fill="#00bce4"/><rect y="14" width="60" height="14" fill="#fff"/><rect y="28" width="60" height="14" fill="#00bce4"/>`,
  SLV: `<rect width="60" height="14" fill="#0047ab"/><rect y="14" width="60" height="14" fill="#fff"/><rect y="28" width="60" height="14" fill="#0047ab"/>`,
  SVN: `<rect width="60" height="14" fill="#fff"/><rect y="14" width="60" height="14" fill="#003da5"/><rect y="28" width="60" height="14" fill="#ed1c24"/>`,
  NOR: `<rect width="60" height="42" fill="#ef2b2d"/><rect x="16" width="8" height="42" fill="#fff"/><rect y="17" width="60" height="8" fill="#fff"/><rect x="18" width="4" height="42" fill="#002868"/><rect y="19" width="60" height="4" fill="#002868"/>`,
}

export function Flag({ code, title, className = '' }: FlagProps) {
  const israel = code === 'ISR' || code === 'ISR-U21'
  return (
    <span className={`flag ${className}`.trim()} title={title}>
      <svg
        viewBox={israel ? '0 0 220 154' : '0 0 60 42'}
        role="img"
        aria-label={title}
        className="h-full w-full rounded-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
      >
        <title>{title}</title>
        <g dangerouslySetInnerHTML={{ __html: flagSvgs[code] }} />
      </svg>
    </span>
  )
}
