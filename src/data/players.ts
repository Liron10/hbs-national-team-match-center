import type { Player } from '../types'
import { fotmobPlayerId } from './fotmobIds'
import { playerImages } from './playerImages'

const basePlayers: Omit<Player, 'image' | 'imageVerified' | 'fotmobId'>[] = [
  {
    id: 'eliel-peretz',
    nameHe: 'אליאל פרץ',
    nameEn: 'Eliel Peretz',
    searchKeys: ['Eliel Peretz'],
    team: 'הפועל באר שבע',
    nationalTeam: 'ISR',
    nationalTeamCode: 'ISR',
    transfermarktUrl: 'https://www.transfermarkt.com/eliel-peretz/profil/spieler/444018',
    transfermarktId: '444018',
  },
  {
    id: 'idan-nachmias',
    nameHe: 'עידן נחמיאס',
    nameEn: 'Idan Nachmias',
    searchKeys: ['Idan Nachmias'],
    team: 'הפועל באר שבע',
    nationalTeam: 'ISR',
    nationalTeamCode: 'ISR',
    transfermarktUrl: 'https://www.transfermarkt.com/idan-nachmias/profil/spieler/408422',
    transfermarktId: '408422',
  },
  {
    id: 'guy-mizrahi',
    nameHe: 'גיא מזרחי',
    nameEn: 'Guy Mizrahi',
    searchKeys: ['Guy Mizrahi'],
    team: 'הפועל באר שבע',
    nationalTeam: 'ISR',
    nationalTeamCode: 'ISR',
    transfermarktUrl: 'https://www.transfermarkt.com/guy-mizrahi/profil/spieler/704071',
    transfermarktId: '704071',
  },
  {
    id: 'niv-yehoshua',
    nameHe: 'ניב יהושע',
    nameEn: 'Niv Yehoshua',
    searchKeys: ['Niv Yehoshua'],
    team: 'הפועל באר שבע',
    nationalTeam: 'ISR-U21',
    nationalTeamCode: 'ISR-U21',
    transfermarktUrl: 'https://www.transfermarkt.com/niv-yehoshua/profil/spieler/926457',
    transfermarktId: '926457',
  },
  {
    id: 'mohammed-abu-rumi',
    nameHe: 'מוחמד אבו רומי',
    nameEn: 'Muhammad Abu Rumi',
    searchKeys: ['Mohammed Abu Rumi', 'Muhammad Abu Rumi', 'Mohamad Abu Rumi'],
    team: 'הפועל באר שבע',
    nationalTeam: 'ISR-U21',
    nationalTeamCode: 'ISR-U21',
    transfermarktUrl:
      'https://www.transfermarkt.com/muhammad-abu-rumi/profil/spieler/1078063',
    transfermarktId: '1078063',
  },
  {
    id: 'adrian-ugarriza',
    nameHe: 'אדריאן אוגריסה',
    nameEn: 'Adrián Ugarriza',
    searchKeys: ['Adrian Ugarriza', 'Adrián Ugarriza'],
    team: 'הפועל באר שבע',
    nationalTeam: 'PER',
    nationalTeamCode: 'PER',
    transfermarktUrl: 'https://www.transfermarkt.com/adrian-ugarriza/profil/spieler/325726',
    transfermarktId: '325726',
  },
  {
    id: 'yoan-stoyanov',
    nameHe: 'יואן סטויאנוב',
    nameEn: 'Yoan Stoyanov',
    searchKeys: ['Yoan Stoyanov', 'Yoni Stoyanov'],
    team: 'הפועל באר שבע',
    nationalTeam: 'BGR',
    nationalTeamCode: 'BGR',
    transfermarktUrl: 'https://www.transfermarkt.com/yoan-stoyanov/profil/spieler/848641',
    transfermarktId: '848641',
  },
  {
    id: 'javon-east',
    nameHe: 'ג׳בון איסט',
    nameEn: 'Javon East',
    searchKeys: ['Javon East', 'Javon Romario East'],
    team: 'הפועל באר שבע',
    nationalTeam: 'JAM',
    nationalTeamCode: 'JAM',
    transfermarktUrl: 'https://www.transfermarkt.com/javon-east/profil/spieler/563479',
    transfermarktId: '563479',
  },
]

export const players: Player[] = basePlayers.map((player) => ({
  ...player,
  fotmobId: String(fotmobPlayerId[player.id]),
  image: playerImages[player.id]?.file ?? `players/${player.id}.svg`,
  imageVerified: playerImages[player.id]?.verified ?? false,
}))

export const playersById = Object.fromEntries(players.map((player) => [player.id, player]))

export function getPlayer(id: string): Player | undefined {
  return playersById[id]
}

export function getPlayersByNationalTeam(code: Player['nationalTeamCode']): Player[] {
  return players.filter((player) => player.nationalTeamCode === code)
}
