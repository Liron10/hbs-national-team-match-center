import assert from 'node:assert/strict'
import test from 'node:test'
import {
  formatFanKickoff,
  formatMatchDate,
  formatMatchTime,
  formatOvernightContext,
  formatUpdatedAt,
  formatWindowLabel,
} from './datetime.ts'

test('formats weekday and date without a comma', () => {
  const label = formatMatchDate('2026-09-30T18:45:00.000Z')
  assert.equal(label.includes(','), false)
  assert.match(label, /30\.9/)
})

test('formats Israel time with DST awareness', () => {
  const time = formatMatchTime('2026-09-24T18:45:00.000Z')
  assert.equal(time, '21:45')
})

test('formats a public last-updated stamp in Israel time', () => {
  assert.equal(formatUpdatedAt('2026-09-18T09:30:00.000Z'), '18.9.26 | 12:30')
})

test('uses fan-facing kickoff labels', () => {
  const today = formatFanKickoff('2026-09-18T18:45:00.000Z', new Date('2026-09-18T10:00:00.000Z'))
  assert.equal(today.primary, 'היום • 21:45')
  const tomorrow = formatFanKickoff('2026-09-19T16:00:00.000Z', new Date('2026-09-18T10:00:00.000Z'))
  assert.equal(tomorrow.primary, 'מחר • 19:00')
  const night = formatFanKickoff('2026-09-26T00:00:00.000Z', new Date('2026-09-25T10:00:00.000Z'))
  assert.equal(night.primary, 'הלילה • 03:00')
})

test('formats the international window without a season code', () => {
  assert.equal(formatWindowLabel('2026-09'), 'פגרת הנבחרות | ספטמבר 2026')
})

test('explains late-night kickoffs after converting to Asia/Jerusalem', () => {
  assert.equal(formatOvernightContext('2026-09-26T00:00:00.000Z'), 'בלילה שבין שישי לשבת')
  assert.equal(formatOvernightContext('2026-09-26T23:00:00.000Z'), 'בלילה שבין שבת לראשון')
  assert.equal(formatOvernightContext('2026-09-28T02:59:00.000Z'), 'בלילה שבין ראשון לשני')
  assert.equal(formatOvernightContext('2026-09-28T03:00:00.000Z'), null)
  assert.equal(formatOvernightContext('2026-09-26T18:00:00.000Z'), null)
})

test('does not use UTC hour for the overnight window', () => {
  assert.equal(formatOvernightContext('2026-09-26T03:00:00.000Z'), null)
})
