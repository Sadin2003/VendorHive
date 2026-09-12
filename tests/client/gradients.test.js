import { describe, expect, it } from 'vitest'
import { gradientFor, hashStr, initials, toneFor } from '../../src/utils/gradients.js'

const GRADS = [
  'linear-gradient(135deg,#3c6b4f 0%,#5d8a6f 55%,#8fae97 100%)',
  'linear-gradient(135deg,#294637 0%,#4c7662 60%,#7aa58a 100%)',
  'linear-gradient(135deg,#5f5344 0%,#9a8264 60%,#c6ab84 100%)',
  'linear-gradient(135deg,#4878a8 0%,#6fa3c9 100%)',
  'linear-gradient(135deg,#a35a3c 0%,#d9a878 100%)',
  'linear-gradient(135deg,#6d5a8f 0%,#a98fd0 100%)',
  'linear-gradient(135deg,#3f6b5a 0%,#62a18a 100%)',
  'linear-gradient(135deg,#8a6a3c 0%,#d0b078 100%)',
  'linear-gradient(135deg,#b0563f 0%,#d98a6a 100%)',
  'linear-gradient(135deg,#33617c 0%,#5f9bbf 100%)',
]

describe('hashStr', () => {
  it('is deterministic', () => {
    expect(hashStr('Bean & Leaf')).toBe(hashStr('Bean & Leaf'))
  })
  it('returns a non-negative integer', () => {
    expect(hashStr('anything')).toBeGreaterThanOrEqual(0)
    expect(Number.isInteger(hashStr('anything'))).toBe(true)
  })
  it('handles empty input', () => {
    expect(hashStr('')).toBe(0)
  })
})

describe('gradientFor', () => {
  it('always returns one of the known gradients', () => {
    for (const name of ['Bean & Leaf', 'Sunflower', 'Golden Bear', 'Nok Pizza']) {
      expect(GRADS).toContain(gradientFor(name))
    }
  })
  it('is stable per name', () => {
    expect(gradientFor('Nok Pizza')).toBe(gradientFor('Nok Pizza'))
  })
})

describe('toneFor', () => {
  it('returns a hex color', () => {
    expect(toneFor('Bean & Leaf')).toMatch(/^#[0-9a-f]{6}$/)
  })
})

describe('initials', () => {
  it('builds initials from the first two words', () => {
    expect(initials('Bean And Leaf')).toBe('BA')
    expect(initials('Bean And Leaf')).toHaveLength(2)
  })
  it('splits on hyphens', () => {
    expect(initials('La-Croix')).toBe('LC')
  })
  it('falls back to VH', () => {
    expect(initials('')).toBe('VH')
    expect(initials('   ')).toBe('VH')
  })
  it('uppercases single names', () => {
    expect(initials('maya')).toBe('M')
  })
})