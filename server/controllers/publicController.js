import User from '../models/User.js'
import Deal from '../models/Deal.js'
import Review from '../models/Review.js'
import HelpfulVote from '../models/HelpfulVote.js'
import Follow from '../models/Follow.js'
import ContactMessage from '../models/ContactMessage.js'
import asyncHandler from '../middlewares/asyncHandler.js'
import { AppError } from '../middlewares/error.js'
import {
  CATEGORIES,
  toBusinessCard,
  toDealCard,
  toDealDetail,
  toReview,
} from '../utils/serialize.js'
import { haversine } from '../utils/geo.js'
import { recommendDeals, recordInteraction } from '../utils/recommend.js'

// --------------------------------------------------------------------------
// Categories (constant list + live merchant counts)
// --------------------------------------------------------------------------
export const getCategories = asyncHandler(async (req, res) => {
  const counts = await User.aggregate([
    { $match: { role: 'merchant', status: 'live' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ])
  const byCat = Object.fromEntries(counts.map((c) => [c._id, c.count]))
  const data = CATEGORIES.map((name) => ({ name, count: byCat[name] || 0 }))
  res.json({ success: true, data })
})

// --------------------------------------------------------------------------
// Business listing with geo + filter + sort support
// --------------------------------------------------------------------------
export const getBusinesses = asyncHandler(async (req, res) => {
  const {
    cat,
    q,
    dist,
    lat,
    lng,
    openNow,
    dealsOnly,
    featured,
    limit = 24,
    sort = 'relevance',
  } = req.query

  const now = new Date()
  const base = { role: 'merchant', status: 'live' }
  if (cat && cat !== 'All') base.category = cat
  if (q) {
    const rx = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    base.$or = [{ businessName: rx }, { name: rx }, { address: rx }, { category: rx }, { tags: rx }]
  }

  const radiusMeters = dist && dist !== 'any' ? Math.max(1, Number(dist) * 1609.34) : null

  let merchants
  if (radiusMeters && lat && lng) {
    // Geospatial query: only candidates inside the radius ball, with distance
    // returned in MILES via distanceMultiplier (geoNear reports meters by default).
    const geo = await User.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          distanceField: 'geoDistance',
          distanceMultiplier: 0.0006213712,
          maxDistance: radiusMeters,
          spherical: true,
          query: base,
        },
      },
      { $sort: { geoDistance: 1 } },
    ])
    merchants = geo
  } else {
    merchants = await User.find(base).lean()
    if (sort === 'nearest' && lat && lng) {
      const clat = Number(lat)
      const clng = Number(lng)
      for (const m of merchants) {
        const c = m.location?.coordinates
        m.geoDistance = c ? haversine(clat, clng, c[1], c[0]) || null : null
      }
    }
  }

  // Active deal counts per merchant (derived from dates — no status field)
  const activeAgg = await Deal.aggregate([
    { $match: { published: true, start: { $lte: now }, end: { $gte: now } } },
    { $group: { _id: '$merchant', count: { $sum: 1 } } },
  ])
  const activeMap = Object.fromEntries(activeAgg.map((a) => [a._id.toString(), a.count]))

  let list = merchants.filter((b) => {
    if (openNow === 'true' && !isOpenNowLocal(b.hours)) return false
    if (dealsOnly === 'true' && !activeMap[b._id.toString()]) return false
    return true
  })

  const sorters = {
    rating: (a, b) => (b.rating || 0) - (a.rating || 0),
    reviews: (a, b) => (b.ratingsCount || 0) - (a.ratingsCount || 0),
    nearest: (a, b) => (a.geoDistance ?? Infinity) - (b.geoDistance ?? Infinity),
    relevance: (a, b) => Number(b.verified || false) - Number(a.verified || false) || (b.rating || 0) - (a.rating || 0),
  }
  list.sort(sorters[sort] || sorters.relevance)

  const useDist = lat && lng
  const ups = list.slice(0, featured === 'true' ? 6 : Number(limit))
  const data = ups.map((b) => {
    const distance = useDist ? (b.geoDistance ?? null) : null
    return toBusinessCard(b, { distance, activeDeals: activeMap[b._id.toString()] || 0 })
  })
  res.json({ success: true, data, count: list.length })
})

function isOpenNowLocal(hours) {
  if (!hours) return false
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const text = hours[names[new Date().getDay()]]
  if (!text || text === 'Closed' || !text.includes('–')) return false
  const [openRaw, closeRaw] = text.split('–')
  const toMin = (s) => {
    const m = s.trim().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
    if (!m) return null
    let h = Number(m[1])
    const minutes = Number(m[2] || 0)
    const ampm = (m[3] || '').toLowerCase()
    if (ampm === 'pm' && h !== 12) h += 12
    if (ampm === 'am' && h === 12) h = 0
    return h * 60 + minutes
  }
  const open = toMin(openRaw)
  const close = toMin(closeRaw)
  if (open == null || close == null) return false
  const now = new Date().getHours() * 60 + new Date().getMinutes()
  return now >= open && now <= close
}

// --------------------------------------------------------------------------
// Business detail (deals + approved reviews + follow/save state)
// --------------------------------------------------------------------------
export const getBusinessById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const business = await User.findOne({ _id: id, role: 'merchant' })
  if (!business || business.status !== 'live') throw new AppError('Business not found', 404)

  const now = new Date()
  const [deals, reviewDocs, following, followersCount] = await Promise.all([
    Deal.find({
      merchant: business._id,
      published: true,
      start: { $lte: now },
      end: { $gte: now },
    })
      .populate('merchant')
      .sort({ createdAt: -1 })
      .lean(),
    Review.find({ business: business._id, moderation: 'kept' })
      .populate({ path: 'author', select: 'name' })
      .sort({ createdAt: -1 })
      .lean(),
    req.user ? Follow.exists({ user: req.user._id, business: business._id }) : Promise.resolve(false),
    Follow.countDocuments({ business: business._id }),
  ])

  let votedSet = {}
  if (req.user && reviewDocs.length) {
    const votes = await HelpfulVote.find({
      user: req.user._id,
      review: { $in: reviewDocs.map((r) => r._id) },
    }).lean()
    votedSet = Object.fromEntries(
      votes.map((v) => [
        v.review.toString(),
        v.value === 1 ? 'helpful' : 'unhelpful',
      ])
    )
  }

  if (req.user && !req.user._id.equals(business._id)) {
    await recordInteraction(req.user._id, 'view_business', { business, category: business.category })
  }

  res.json({
    success: true,
    data: {
      id: business._id,
      name: business.businessName || business.name,
      category: business.category,
      tags: business.tags || [],
      address: business.address,
      phone: business.phone,
      email: business.email,
      about: business.about,
      hours: business.hours || {},
      rating: business.rating || 0,
      reviewCount: business.ratingsCount || 0,
      verified: !!business.verified,
      followers: followersCount,
      emoji: business.emoji || '🏪',
      following: !!following,
      deals: deals.map(toDealCard),
      reviews: reviewDocs.map((r) =>
        toReview({
          ...r,
          _helpfulVoted: votedSet[r._id.toString()] === 'helpful',
          _unhelpfulVoted: votedSet[r._id.toString()] === 'unhelpful',
        }),
      ),
    },
  })
})

// --------------------------------------------------------------------------
// Deals feed (newest / views / saves / expiring / recommended)
// --------------------------------------------------------------------------
export const getDeals = asyncHandler(async (req, res) => {
  const { q, cat, sort = 'newest', feed, lat, lng, limit = 20 } = req.query

  const nowArr = new Date()
  let deals = await Deal.find({ published: true, start: { $lte: nowArr }, end: { $gte: nowArr } })
    .populate('merchant')
    .sort({ createdAt: -1 })
    .lean()

  if (q) {
    const rx = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    deals = deals.filter((d) => rx.test(d.title) || rx.test(d.desc || '') || rx.test(d.merchant?.businessName || d.merchant?.name || ''))
  }
  if (cat && cat !== 'all') {
    deals = deals.filter((d) => d.merchant?.category === cat)
  }

  if (feed === 'recommended' && req.user) {
    deals = await recommendDeals(req.user._id, deals, {
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
    })
  } else {
    const now = Date.now()
    const sorters = {
      views: (a, b) => (b.views || 0) - (a.views || 0),
      saves: (a, b) => (b.saves || 0) - (a.saves || 0),
      expiring: (a, b) => {
        const ae = new Date(a.end).getTime()
        const be = new Date(b.end).getTime()
        if (ae < now && be >= now) return 1
        if (be < now && ae >= now) return -1
        return ae - be
      },
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    }
    deals = deals.sort(sorters[sort] || sorters.newest)
  }

  res.json({
    success: true,
    data: deals.slice(0, Number(limit)).map(toDealCard),
    count: deals.length,
  })
})

// --------------------------------------------------------------------------
// Single deal + related
// --------------------------------------------------------------------------
export const getDealById = asyncHandler(async (req, res) => {
  const deal = await Deal.findOne({ _id: req.params.id, published: true })
    .populate('merchant')
    .populate('businesses.business')

  if (!deal) throw new AppError('Deal not found', 404)

  deal.views = (deal.views || 0) + 1
  await deal.save()

  const dO = deal.toObject()
  if (req.user) {
    await recordInteraction(req.user._id, 'view_deal', {
      deal,
      business: deal.merchant,
      category: deal.merchant?.category,
    })
  }

  res.json({ success: true, data: toDealDetail(dO) })
})

export const getRelatedDeals = asyncHandler(async (req, res) => {
  const deal = await Deal.findOne({ _id: req.params.id, published: true }).populate('merchant').lean()
  if (!deal) throw new AppError('Deal not found', 404)

  const cat = deal.merchant?.category
  const now = new Date()
  const pool = await Deal.find({
    published: true,
    start: { $lte: now },
    end: { $gte: now },
    _id: { $ne: deal._id },
  })
    .populate('merchant')
    .sort({ 'saves': -1 })
    .limit(24)
    .lean()

  const sameCat = pool.filter((d) => d.merchant?.category === cat && cat)
  const others = pool.filter((d) => d.merchant?.category !== cat || !cat)
  const data = [...sameCat.slice(0, 4), ...others].slice(0, 4).map(toDealCard)
  res.json({ success: true, data })
})

// --------------------------------------------------------------------------
// Contact form (rate-limited via contactLimiter on the route)
// --------------------------------------------------------------------------
export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body
  const userId = req.user?._id
  await ContactMessage.create({ user: userId, name, email, message })
  res.status(201).json({ success: true, message: 'Message sent — we will get back to you soon.' })
})