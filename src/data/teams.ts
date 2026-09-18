import type { CountryCode, NationalTeam, NationalTeamCode, TeamSide } from '../types'

export const nationalTeams: Record<NationalTeamCode, NationalTeam> = {
  ISR: {
    code: 'ISR',
    nameHe: 'ישראל',
    nameEn: 'Israel',
    countryCode: 'ISR',
    ageGroup: 'senior',
  },
  'ISR-U21': {
    code: 'ISR-U21',
    nameHe: 'ישראל עד 21',
    nameEn: 'Israel U21',
    countryCode: 'ISR',
    ageGroup: 'u21',
  },
  PER: {
    code: 'PER',
    nameHe: 'פרו',
    nameEn: 'Peru',
    countryCode: 'PER',
    ageGroup: 'senior',
  },
  BGR: {
    code: 'BGR',
    nameHe: 'בולגריה',
    nameEn: 'Bulgaria',
    countryCode: 'BGR',
    ageGroup: 'senior',
  },
  JAM: {
    code: 'JAM',
    nameHe: 'ג׳מייקה',
    nameEn: 'Jamaica',
    countryCode: 'JAM',
    ageGroup: 'senior',
  },
}

export const teams: Record<CountryCode, TeamSide> = {
  ISR: { code: 'ISR', nameHe: 'ישראל', nameEn: 'Israel' },
  'ISR-U21': { code: 'ISR-U21', nameHe: 'ישראל עד 21', nameEn: 'Israel U21' },
  PER: { code: 'PER', nameHe: 'פרו', nameEn: 'Peru' },
  BGR: { code: 'BGR', nameHe: 'בולגריה', nameEn: 'Bulgaria' },
  JAM: { code: 'JAM', nameHe: 'ג׳מייקה', nameEn: 'Jamaica' },
  AUT: { code: 'AUT', nameHe: 'אוסטריה', nameEn: 'Austria' },
  IRL: { code: 'IRL', nameHe: 'אירלנד', nameEn: 'Republic of Ireland' },
  XKX: { code: 'XKX', nameHe: 'קוסובו', nameEn: 'Kosovo' },
  USA: { code: 'USA', nameHe: 'ארה״ב', nameEn: 'United States' },
  MEX: { code: 'MEX', nameHe: 'מקסיקו', nameEn: 'Mexico' },
  CAN: { code: 'CAN', nameHe: 'קנדה', nameEn: 'Canada' },
  COL: { code: 'COL', nameHe: 'קולומביה', nameEn: 'Colombia' },
  LUX: { code: 'LUX', nameHe: 'לוקסמבורג', nameEn: 'Luxembourg' },
  EST: { code: 'EST', nameHe: 'אסטוניה', nameEn: 'Estonia' },
  ISL: { code: 'ISL', nameHe: 'איסלנד', nameEn: 'Iceland' },
  GTM: { code: 'GTM', nameHe: 'גואטמלה', nameEn: 'Guatemala' },
  HON: { code: 'HON', nameHe: 'הונדורס', nameEn: 'Honduras' },
  SLV: { code: 'SLV', nameHe: 'אל סלוודור', nameEn: 'El Salvador' },
  SVN: { code: 'SVN', nameHe: 'סלובניה עד 21', nameEn: 'Slovenia U21' },
  NOR: { code: 'NOR', nameHe: 'נורווגיה עד 21', nameEn: 'Norway U21' },
}

export function getTeam(code: CountryCode): TeamSide {
  return teams[code]
}
