import assert from 'node:assert/strict'
import test from 'node:test'
import { formatMatchDate, formatMatchTime } from './datetime.ts'

test('formats weekday and date without a comma', () => {
  const label = formatMatchDate('2026-09-30T18:45:00.000Z')
  assert.equal(label.includes(','), false)
  assert.match(label, /30\.9/)
})

test('formats Israel time with DST awareness', () => {
  const time = formatMatchTime('2026-09-24T18:45:00.000Z')
  assert.equal(time, '21:45')
})
