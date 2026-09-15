import { posFromLatLng } from './geo.js'

// Canonical category list — the Explore page renders pills for exactly these.
export const CATEGORIES = [
  'Restaurants',
  'Cafés',
  'Bakeries',
  'Clothing',
  'Electronics',
  'Services',
  'Health & Beauty',
  'Gifts & Local',
]

const DAY = 86400000

export function humanTime(date) {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  if (d < 30) return `${Math.floor(d / 7)}w ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function fmtDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Deal status is DERIVED from the published flag + start/end dates (no cron).
export function dealStatus(deal) {
  if (!deal.published) return 'draft'
  const now = Date.now()
  if (now < new Date(deal.start).getTime()) return 'scheduled'
  if (now > new Date(deal.end).getTime()) return 'expired'
  return 'active'
}

export function expiresIn(end) {
  const days = Math.ceil((new Date(end).getTime() - Date.now()) / DAY)
  if (days <= 0) return 'Ends today'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

// Short tag shown on the deal cover. Merchants write these as a human label
// (e.g. '20% OFF', 'BOGO', '$8 duo'), so we surface the stored value as-is.
export function discountLabel(deal) {
  if (deal.value) return deal.value
  switch (deal.type) {
    case 'percent':
      return '20% OFF'
    case 'bogo':
      return 'BOGO'
    case 'bundle':
      return 'BUNDLE'
    default:
      return 'DEAL'
  }
}

export function merchantName(m) {
  if (!m) return ''
  return m.businessName || m.name || ''
}

export function merchantAvatar(m) {
  return m?.logo || undefined
}

// "Open now" check against the merchant's { Mon..Sun } hour strings.
export function isOpenNow(hours) {
  if (!hours) return false
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const day = names[new Date().getDay()]
  const text = hours[day]
  if (!text || text === 'Closed' || !text.includes('–')) return false
  const strip = (s) => s.trim().toLowerCase()
  const [openRaw, closeRaw] = text.split('–')
  const toMin = (s) => {
    const m = s.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/)
    if (!m) return null
    let h = Number(m[1])
    const minutes = Number(m[2] || 0)
    const ampm = m[3]
    if (ampm === 'pm' && h !== 12) h += 12
    if (ampm === 'am' && h === 12) h = 0
    return h * 60 + minutes
  }
  const open = toMin(openRaw)
  const close = toMin(strip(closeRaw))
  if (open == null || close == null) return false
  const now = new Date().getHours() * 60 + new Date().getMinutes()
  return now >= open && now <= close
}

// --- Business ---------------------------------------------------------------

// The Explore list + Home cards expect exactly this shape.
export function toBusinessCard(b, opts = {}) {
  const distance = opts.distance != null ? opts.distance : null
  const rating = Number(b.rating || 0)
  const reviews = Number(b.ratingsCount || 0)
  return {
    id: b._id,
    name: merchantName(b),
    category: b.category || 'Services',
    address: b.address || '',
    distance: distance == null ? 0 : Number(distance.toFixed(1)),
    rating,
    reviews,
    openNow: isOpenNow(b.hours),
    deals: opts.activeDeals || 0,
    pos: posFromLatLng(b.location),
    verified: !!b.verified,
    emoji: b.emoji || '🏪',
    tags: b.tags || [],
    followers: b.followersCount || 0,
  }
}

// Rating distribution ([{ star, pct }]) for the business detail sidebar.
export function ratingDist(reviews) {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const r of reviews) {
    const s = Math.min(5, Math.max(1, Math.round(r.rating)))
    dist[s] += 1
  }
  const total = reviews.length || 1
  return [5, 4, 3, 2, 1].map((star) => ({
    star,
    pct: Math.round((dist[star] / total) * 100),
  }))
}

// --- Deals ------------------------------------------------------------------

export function toDealCard(deal) {
  const m = deal.merchant
  return {
    id: deal._id,
    merchant: merchantName(m),
    category: m?.category || '',
    title: deal.title,
    tag: discountLabel(deal),
    discount: discountLabel(deal),
    views: deal.views,
    saves: deal.saves,
    expiresIn: expiresIn(deal.end),
    coverKey: deal.coverKey || undefined,
    status: dealStatus(deal),
    start: deal.start,
    end: deal.end,
    value: deal.value,
  }
}

// DealDetails needs the richer shape (starts/ends/desc/terms/businesses).
export function toDealDetail(deal) {
  const participants = (deal.businesses || []).map((p) => {
    const b = p.business
    return {
      id: b?._id,
      name: merchantName(b),
      category: b?.category || '',
      addr: b?.address || '',
      rating: Number(b?.rating || 0),
      reviews: Number(b?.ratingsCount || 0),
      role: p.role,
    }
  })
  if (!participants.length && deal.merchant) {
    participants.push({
      id: deal.merchant._id,
      name: merchantName(deal.merchant),
      category: deal.merchant.category || '',
      addr: deal.merchant.address || '',
      rating: Number(deal.merchant.rating || 0),
      reviews: Number(deal.merchant.ratingsCount || 0),
      role: 'Host',
    })
  }
  return {
    ...toDealCard(deal),
    starts: deal.start,
    ends: deal.end,
    desc: deal.desc || '',
    terms: deal.terms || [],
    businesses: participants,
  }
}

// --- Reviews ----------------------------------------------------------------

export function toReview(r) {
  return {
    id: r._id,
    user: r.author?.name || 'VendorHive user',
    rating: r.rating,
    date: humanTime(r.createdAt),
    text: r.text || '',
    verified: true,
    helpful: r.helpful || 0,
    unhelpful: r.unhelpful || 0,
    helpfulVoted: !!r._helpfulVoted,
    unhelpfulVoted: !!r._unhelpfulVoted,
    reply: r.reply || null,
  }
}

// --- Notifications ----------------------------------------------------------

export function toNotification(n) {
  return {
    id: n._id,
    type: n.type,
    icon: n.icon,
    text: n.text,
    time: humanTime(n.createdAt),
    unread: n.unread,
  }
}

// --- Cross promotions -------------------------------------------------------

// Derived status for the frontend: pending/active/scheduled/expired/declined.
export function promotionStatus(p) {
  if (p.status === 'declined') return 'declined'
  if (p.status === 'awaiting') return 'awaiting'
  if (p.status !== 'accepted') return 'pending'
  const now = Date.now()
  if (now < new Date(p.start).getTime()) return 'scheduled'
  if (now > new Date(p.end).getTime()) return 'expired'
  return 'active'
}

export function toPromotion(p) {
  const a = p.businessA
  const b = p.businessB
  return {
    id: p._id,
    partnerA: merchantName(a),
    partnerB: merchantName(b),
    partnerBCategory: b?.category || '',
    offer: p.offer,
    status: promotionStatus(p),
    dates: `${fmtDate(p.start)} → ${fmtDate(p.end)}`,
    views: p.views,
    saves: p.saves,
    start: p.start,
    end: p.end,
    bundleDeal: p.bundleDeal || null,
  }
}