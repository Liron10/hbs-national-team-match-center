export interface CatalogPlayer {
  id: string
  nameHe: string
  nameEn: string
  nationalTeam: string
  transfermarktId: string
  transfermarktUrl: string
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
    initials: 'אפ',
  },
  {
    id: 'idan-nachmias',
    nameHe: 'עידן נחמיאס',
    nameEn: 'Idan Nachmias',
    nationalTeam: 'Israel',
    transfermarktId: '408422',
    transfermarktUrl: 'https://www.transfermarkt.com/idan-nachmias/profil/spieler/408422',
    initials: 'ענ',
  },
  {
    id: 'guy-mizrahi',
    nameHe: 'גיא מזרחי',
    nameEn: 'Guy Mizrahi',
    nationalTeam: 'Israel',
    transfermarktId: '704071',
    transfermarktUrl: 'https://www.transfermarkt.com/guy-mizrahi/profil/spieler/704071',
    initials: 'גמ',
  },
  {
    id: 'niv-yehoshua',
    nameHe: 'ניב יהושע',
    nameEn: 'Niv Yehoshua',
    nationalTeam: 'Israel U21',
    transfermarktId: '926457',
    transfermarktUrl: 'https://www.transfermarkt.com/niv-yehoshua/profil/spieler/926457',
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
    initials: 'מא',
  },
  {
    id: 'adrian-ugarriza',
    nameHe: 'אדריאן אוגריסה',
    nameEn: 'Adrián Ugarriza',
    nationalTeam: 'Peru',
    transfermarktId: '325726',
    transfermarktUrl: 'https://www.transfermarkt.com/adrian-ugarriza/profil/spieler/325726',
    initials: 'או',
  },
  {
    id: 'yoan-stoyanov',
    nameHe: 'יואן סטויאנוב',
    nameEn: 'Yoan Stoyanov',
    nationalTeam: 'Bulgaria',
    transfermarktId: '848641',
    transfermarktUrl: 'https://www.transfermarkt.com/yoan-stoyanov/profil/spieler/848641',
    initials: 'יס',
  },
  {
    id: 'javon-east',
    nameHe: 'ג׳בון איסט',
    nameEn: 'Javon East',
    nationalTeam: 'Jamaica',
    transfermarktId: '563479',
    transfermarktUrl: 'https://www.transfermarkt.com/javon-east/profil/spieler/563479',
    initials: 'גי',
  },
]

export function placeholderSvg(initials: string, name: string): string {
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
