// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { moderateText } from '../../server/utils/moderation.js'

describe('moderateText', () => {
  it('passes clean feedback', () => {
    expect(moderateText('Great coffee and friendly staff!')).toEqual({
      flagged: false,
      risk: 'low',
      reason: '',
    })
  })
  it('flags a single high-severity keyword', () => {
    const r = moderateText('This place is a total scam, do not trust it')
    expect(r.flagged).toBe(true)
    expect(r.risk).toBe('high')
  })
  it('flags repeated medium keywords', () => {
    const r = moderateText('Service was terrible and the staff were unprofessional')
    expect(r.flagged).toBe(true)
    expect(r.risk).toBe('med')
  })
  it('leaves a single medium keyword unflagged', () => {
    const r = moderateText('The wifi was terrible')
    expect(r.flagged).toBe(false)
  })
  it('ignores negated claims', () => {
    expect(moderateText('Not a scam at all — highly recommended').flagged).toBe(false)
    expect(moderateText('is never a rip-off, just expensive').flagged).toBe(false)
  })
  it('handles empty input', () => {
    expect(moderateText('').flagged).toBe(false)
    expect(moderateText(undefined)).toEqual({ flagged: false, risk: 'low', reason: '' })
  })
})