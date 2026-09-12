// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { haversine, posFromLatLng, toRad } from '../../server/utils/geo.js'

describe('haversine', () => {
  it('returns null for missing coordinates', () => {
    expect(haversine(null, null, null, null)).toBeNull()
    expect(haversine(34, -118, null, -118)).toBeNull()
  })
  it('returns 0 for the same point', () => {
    expect(haversine(34.05, -118.25, 34.05, -118.25)).toBe(0)
  })
  it('matches known distances', () => {
    const d = haversine(0, 0, 1, 0)
    expect(d).toBeGreaterThan(68.5)
    expect(d).toBeLessThan(69.7)
  })
  it('is symmetric', () => {
    const a = haversine(34.05, -118.25, 40.71, -74.0)
    const b = haversine(40.71, -74.0, 34.05, -118.25)
    expect(a).toBeCloseTo(b, 6)
  })
  it('round-trips through toRad for axis conversions', () => {
    expect(toRad(180)).toBeCloseTo(Math.PI, 10)
  })
})

describe('posFromLatLng', () => {
  it('defaults to center for missing location', () => {
    expect(posFromLatLng(null)).toEqual({ x: 50, y: 50 })
    expect(posFromLatLng({ coordinates: [] })).toEqual({ x: 50, y: 50 })
  })
  it('clamps to the 8..92 pin box inside the bounding box', () => {
    const p = posFromLatLng({ coordinates: [-118.26, 34.06] })
    expect(p.x).toBeGreaterThanOrEqual(8)
    expect(p.x).toBeLessThanOrEqual(92)
    expect(p.y).toBeGreaterThanOrEqual(8)
    expect(p.y).toBeLessThanOrEqual(92)
  })
  it('clamps out-of-range coordinates to the box edges', () => {
    const p = posFromLatLng({ coordinates: [-200, 100] })
    expect(p.x).toBe(8)
    expect(p.y).toBe(8)
  })
  it('returns rounded integers', () => {
    const p = posFromLatLng({ coordinates: [-118.25, 34.07] })
    expect(Number.isInteger(p.x)).toBe(true)
    expect(Number.isInteger(p.y)).toBe(true)
  })
})