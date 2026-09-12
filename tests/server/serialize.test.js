// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  dealStatus,
  discountLabel,
  expiresIn,
  humanTime,
  merchantName,
  promotionStatus,
  ratingDist,
  toBusinessCard,
  toDealCard,
  toDealDetail,
  toNotification,
  toReview,
} from '../../server/utils/serialize.js'

const day = 86400000
const now = Date.now()

describe('dealStatus', () => {
  it('returns draft for unpublished deals', () => {
    expect(dealStatus({ published: false, start: new Date(now - day), end: new Date(now + day) })).toBe('draft')
  })
  it('returns scheduled before the start date', () => {
    expect(dealStatus({ published: true, start: new Date(now + day), end: new Date(now + 2 * day) })).toBe('scheduled')
  })
  it('returns active inside the window', () => {
    expect(dealStatus({ published: true, start: new Date(now - day), end: new Date(now + day) })).toBe('active')
  })
  it('returns expired after the end date', () => {
    expect(dealStatus({ published: true, start: new Date(now - 2 * day), end: new Date(now - day) })).toBe('expired')
  })
})

describe('expiresIn', () => {
  it('says "Ends today" for a past or ending-now date', () => {
    expect(expiresIn(new Date(now - day))).toBe('Ends today')
  })
  it('says "1 day left" just under one day out', () => {
    expect(expiresIn(new Date(now + day - 1000))).toBe('1 day left')
  })
  it('counts days', () => {
    expect(expiresIn(new Date(now + 3 * day))).toBe('3 days left')
  })
})

describe('discountLabel', () => {
  it('prefers the stored value label', () => {
    expect(discountLabel({ type: 'percent', value: '20% OFF' })).toBe('20% OFF')
  })
  it('falls back per type', () => {
    expect(discountLabel({ type: 'percent', value: '' })).toBe('20% OFF')
    expect(discountLabel({ type: 'bogo', value: '' })).toBe('BOGO')
    expect(discountLabel({ type: 'bundle', value: '' })).toBe('BUNDLE')
    expect(discountLabel({ type: 'amount', value: '' })).toBe('DEAL')
  })
})

describe('merchantName', () => {
  it('prefers businessName over name', () => {
    expect(merchantName({ businessName: 'Bean & Leaf', name: 'Maya' })).toBe('Bean & Leaf')
    expect(merchantName({ name: 'Maya' })).toBe('Maya')
    expect(merchantName(null)).toBe('')
  })
})

describe('ratingDist', () => {
  it('computes percentages per star bucket', () => {
    const reviews = [
      { rating: 5 },
      { rating: 5 },
      { rating: 4 },
      { rating: 2 },
      { rating: 1 },
      { rating: 3 },
      { rating: 4.4 },
      { rating: 5 },
      { rating: 4.4 },
      { rating: 2 },
    ]
    const dist = ratingDist(reviews)
    expect(dist[0]).toEqual({ star: 5, pct: 30 })
    const total = dist.reduce((s, d) => s + d.pct, 0)
    expect(total).toBe(100)
  })
  it('rounds out-of-range ratings', () => {
    const dist = ratingDist([{ rating: 6 }, { rating: 0 }])
    expect(dist.find((d) => d.star === 5)).toEqual({ star: 5, pct: 50 })
    expect(dist.find((d) => d.star === 1)).toEqual({ star: 1, pct: 50 })
  })
})

describe('promotionStatus', () => {
  it('passes through awaiting/declined', () => {
    expect(promotionStatus({ status: 'awaiting' })).toBe('awaiting')
    expect(promotionStatus({ status: 'declined' })).toBe('declined')
  })
  it('treats unknown statuses as pending', () => {
    expect(promotionStatus({ status: 'requested' })).toBe('pending')
  })
  it('derives scheduled/expired/active from accepted dates', () => {
    expect(promotionStatus({ status: 'accepted', start: now + day, end: now + 2 * day })).toBe('scheduled')
    expect(promotionStatus({ status: 'accepted', start: now - 2 * day, end: now - day })).toBe('expired')
    expect(promotionStatus({ status: 'accepted', start: now - day, end: now + day })).toBe('active')
  })
})

describe('toReview', () => {
  it('falls back to a generic user label', () => {
    expect(toReview({ _id: '1', rating: 5, text: 'Nice', createdAt: new Date(now - 60000) }).user).toBe('VendorHive user')
  })
  it('defaults empty fields', () => {
    const r = toReview({ _id: '1', author: { name: 'Aisha' }, rating: 5, createdAt: new Date(now - 60000) })
    expect(r.text).toBe('')
    expect(r.reply).toBeNull()
    expect(r.verified).toBe(true)
  })
})

describe('humanTime', () => {
  it('returns "Just now" for recent timestamps', () => {
    expect(humanTime(new Date(now - 1000))).toBe('Just now')
    expect(humanTime(null)).toBe('')
  })
})

describe('toDealCard / toDealDetail', () => {
  const deal = {
    _id: 'd1',
    merchant: { _id: 'm1', businessName: 'Bean & Leaf', category: 'Cafés' },
    title: 'Two coffees for $8',
    type: 'amount',
    value: '$8 duo',
    views: 10,
    saves: 2,
    start: new Date(now - day),
    end: new Date(now + day),
    published: true,
    desc: 'Any two drinks',
    terms: ['Valid after 2PM'],
    businesses: [{ business: { _id: 'm2', businessName: 'Sunflower', category: 'Bakeries' }, role: 'Partner A' }],
  }
  it('builds the card shape', () => {
    const card = toDealCard(deal)
    expect(card.id).toBe('d1')
    expect(card.merchant).toBe('Bean & Leaf')
    expect(card.tag).toBe('$8 duo')
    expect(card.status).toBe('active')
  })
  it('builds the detail shape with participants', () => {
    const detail = toDealDetail(deal)
    expect(detail.desc).toBe('Any two drinks')
    expect(detail.terms).toEqual(['Valid after 2PM'])
    expect(detail.businesses).toHaveLength(1)
    expect(detail.businesses[0].name).toBe('Sunflower')
    expect(detail.businesses[0].role).toBe('Partner A')
  })
})

describe('toBusinessCard', () => {
  it('maps fields with defaults', () => {
    const card = toBusinessCard(
      { _id: 'm1', businessName: 'Bean & Leaf', category: 'Cafés', rating: 4.8, ratingsCount: 200, verified: true },
      { distance: 1.25, activeDeals: 3 }
    )
    expect(card.name).toBe('Bean & Leaf')
    expect(card.distance).toBe(1.3)
    expect(card.verified).toBe(true)
    expect(card.deals).toBe(3)
    expect(card.openNow).toBe(false)
  })
  it('defaults category to Services', () => {
    const card = toBusinessCard({ _id: 'm1', businessName: 'X' })
    expect(card.category).toBe('Services')
    expect(card.reviews).toBe(0)
  })
})

describe('toNotification', () => {
  it('maps fields and keeps unread state', () => {
    const n = toNotification({ _id: 'n1', type: 'deal', icon: 'i-tag', text: 'New deal', createdAt: new Date(now - 60000), unread: true })
    expect(n.type).toBe('deal')
    expect(n.unread).toBe(true)
  })
})