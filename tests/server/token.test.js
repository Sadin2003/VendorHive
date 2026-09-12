// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { sanitizeUser } from '../../server/utils/token.js'

describe('sanitizeUser', () => {
  it('keeps only safe fields for customers', () => {
    const u = sanitizeUser({ _id: 'u1', role: 'customer', status: 'active', name: 'Aisha', email: 'a@x.co', password: 'secret' })
    expect(u).toEqual({ id: 'u1', role: 'customer', status: 'active', name: 'Aisha', email: 'a@x.co' })
  })
  it('prefers businessName for merchants, falling back to owner/name', () => {
    expect(sanitizeUser({ _id: 'm1', role: 'merchant', name: 'Tom', businessName: 'Bean & Leaf' }).name).toBe('Bean & Leaf')
    expect(sanitizeUser({ _id: 'm1', role: 'merchant', name: 'Tom', owner: 'Tom Reed' }).name).toBe('Tom Reed')
    expect(sanitizeUser({ _id: 'm1', role: 'merchant', name: 'Tom' }).name).toBe('Tom')
  })
})