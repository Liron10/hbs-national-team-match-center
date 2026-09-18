import type { CountryCode, NationalTeamCode } from '../types'

/**
 * FotMob IDs resolved from live search/suggest and match lists on 2026-09-18.
 * Do not invent IDs; add a team only after FotMob returns it.
 */
export const fotmobTeamId: Record<CountryCode, number> = {
  ISR: 8567,
  'ISR-U21': 5828,
  PER: 5798,
  BGR: 10150,
  JAM: 5806,
  AUT: 8255,
  IRL: 5791,
  XKX: 430156,
  USA: 6713,
  MEX: 6710,
  CAN: 5810,
  COL: 8258,
  LUX: 5792,
  EST: 8261,
  ISL: 8536,
  GTM: 5858,
  HON: 5808,
  SLV: 6327,
  SVN: 5827,
  NOR: 5830,
}

export const trackedFotmobTeamIds: Record<NationalTeamCode, number> = {
  ISR: fotmobTeamId.ISR,
  'ISR-U21': fotmobTeamId['ISR-U21'],
  PER: fotmobTeamId.PER,
  BGR: fotmobTeamId.BGR,
  JAM: fotmobTeamId.JAM,
}

export const fotmobPlayerId: Record<string, number> = {
  'eliel-peretz': 763312,
  'idan-nachmias': 899188,
  'guy-mizrahi': 1238236,
  'niv-yehoshua': 1605895,
  'mohammed-abu-rumi': 1497826,
  'adrian-ugarriza': 547722,
  'yoan-stoyanov': 1308396,
  'javon-east': 919525,
}

export const countryByFotmobTeamId: Record<number, CountryCode> = Object.fromEntries(
  Object.entries(fotmobTeamId).map(([code, id]) => [id, code as CountryCode]),
) as Record<number, CountryCode>
