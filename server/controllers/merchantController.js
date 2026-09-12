import User from '../models/User.js'
import Deal from '../models/Deal.js'
import Review from '../models/Review.js'
import Follow from '../models/Follow.js'
import CrossPromotion from '../models/CrossPromotion.js'
import asyncHandler from '../middlewares/asyncHandler.js'
import { AppError } from '../middlewares/error.js'
import { sanitizeUser } from '../utils/token.js'
import { dealStatus, humanTime, merchantName } from '../utils/serialize.js'
import { createNotification, notifyFollowers } from '../utils/notify.js'

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------
function merchantDealRow(d) {
  return {
    id: d._id,
    title: d.title,
    status: dealStatus(d),
    views: d.views,
    saves: d.saves,
    end: new Date(d.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    type: d.type,
    value: d.value,
    published: d.published,
  }
}

function merchantReviewRow(r) {
  return {
    id: r._id,
    user: r.author?.name || 'Anonymous',
    rating: r.rating,
    date: humanTime(r.createdAt),
    text: r.text || '',
    reply: r.reply || null,
    moderation: r.moderation || 'kept',
    helpful: r.helpful || 0,
  }
}

function promoRow(p, userId) {
  const a = p.businessA
  const b = p.businessB
  const now = Date.now()
  let derived = p.status
  if (p.status === 'accepted') {
    if (now < new Date(p.start).getTime()) derived = 'scheduled'
    else if (now > new Date(p.end).getTime()) derived = 'expired'
    else derived = 'active'
  }
  return {
    id: p._id,
    partnerA: merchantName(a),
    partnerB: merchantName(b),
    partnerBCategory: b?.category || '',
    offer: p.offer,
    status: derived,
    rawStatus: p.status,
    mine: userId ? p.createdBy?.equals(userId) : false,
    dates: `${fmtShort(p.start)} → ${fmtShort(p.end)}`,
    views: p.views,
    saves: p.saves,
  }
}

function fmtShort(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// --------------------------------------------------------------------------
// Dashboard
// --------------------------------------------------------------------------
export const getMerchantDashboard = asyncHandler(async (req, res) => {
  const me = req.user

  const [deals, reviewDocs, followersCount, allDeals] = await Promise.all([
    Deal.find({ merchant: me._id }).sort({ createdAt: -1 }).limit(10).lean(),
    Review.find({ business: me._id, moderation: 'kept' })
      .populate({ path: 'author', select: 'name' })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Follow.countDocuments({ business: me._id }),
    Deal.find({ merchant: me._id }).lean(),
  ])

  const now = new Date()
  const views30d = allDeals.reduce((s, d) => s + (d.views || 0), 0)
  const saves30d = allDeals.reduce((s, d) => s + (d.saves || 0), 0)
  const activeDeals = allDeals.filter((d) => {
    if (!d.published) return false
    const t = now.getTime()
    return t >= new Date(d.start).getTime() && t <= new Date(d.end).getTime()
  }).length

  const pendingPromotions = await CrossPromotion.countDocuments({ businessA: me._id, status: 'awaiting' })

  res.json({
    success: true,
    data: {
      user: { name: me.businessName || me.name, category: me.category, emoji: me.emoji || '🏪' },
      stats: {
        views30d,
        saves30d,
        activeDeals,
        avgRating: me.rating || 0,
        reviewsCount: me.ratingsCount || 0,
        followersCount,
        pendingPromotions,
      },
      deals: deals.map(merchantDealRow),
      reviews: reviewDocs.map(merchantReviewRow),
    },
  })
})

// --------------------------------------------------------------------------
// Business profile
// --------------------------------------------------------------------------
export const getMerchantProfile = asyncHandler(async (req, res) => {
  const u = req.user
  res.json({
    success: true,
    data: {
      id: u._id,
      businessName: u.businessName || '',
      tagline: u.tagline || '',
      category: u.category || '',
      phone: u.phone || '',
      email: u.email,
      address: u.address || '',
      about: u.about || '',
      emoji: u.emoji || '🏪',
      hours: u.hours || {},
      gallery: u.gallery || [],
      cover: u.cover || '',
      location: u.location,
    },
  })
})

export const updateMerchantProfile = asyncHandler(async (req, res) => {
  const u = req.user
  const { businessName, tagline, category, phone, email, address, about, hours, emoji, location } = req.body

  if (businessName !== undefined) u.businessName = String(businessName).trim()
  if (tagline !== undefined) u.tagline = String(tagline).trim()
  if (category !== undefined) u.category = String(category).trim()
  if (phone !== undefined) u.phone = String(phone).trim()
  if (email !== undefined && email !== u.email) {
    const exists = await User.findOne({ email: String(email).toLowerCase() })
    if (exists) throw new AppError('That email is already in use', 400)
    u.email = String(email).toLowerCase()
  }
  if (address !== undefined) u.address = String(address).trim()
  if (about !== undefined) u.about = String(about).trim()
  if (hours !== undefined) u.hours = hours
  if (emoji !== undefined) u.emoji = String(emoji).trim()
  if (location !== undefined) u.location = location

  await u.save()
  res.json({ success: true, message: 'Profile updated', data: { ...sanitizeUser(u), ...u.toObject() } })
})

export const updateCover = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400)
  req.user.cover = `/uploads/${req.file.filename}`
  await req.user.save()
  res.json({ success: true, message: 'Cover updated', cover: req.user.cover })
})

export const updateGallery = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw new AppError('No files uploaded', 400)
  const urls = req.files.map((f) => `/uploads/${f.filename}`)
  req.user.gallery = [...(req.user.gallery || []), ...urls].slice(0, 20)
  await req.user.save()
  res.json({ success: true, message: 'Gallery updated', gallery: req.user.gallery })
})

// --------------------------------------------------------------------------
// Deals CRUD
// --------------------------------------------------------------------------
export const getMerchantDeals = asyncHandler(async (req, res) => {
  const deals = await Deal.find({ merchant: req.user._id })
    .sort({ createdAt: -1 })
    .lean()
  res.json({ success: true, data: deals.map(merchantDealRow) })
})

export const getMerchantDealById = asyncHandler(async (req, res) => {
  const deal = await Deal.findOne({ _id: req.params.id, merchant: req.user._id })
    .populate('businesses.business')
    .lean()
  if (!deal) throw new AppError('Deal not found', 404)
  res.json({
    success: true,
    data: {
      ...merchantDealRow(deal),
      desc: deal.desc || '',
      terms: deal.terms || [],
      start: deal.start,
      end: deal.end,
      businesses: (deal.businesses || []).map((p) => ({
        id: p.business?._id,
        name: merchantName(p.business),
        category: p.business?.category || '',
        role: p.role,
      })),
    },
  })
})

export const createDeal = asyncHandler(async (req, res) => {
  const { title, type, value, desc, terms, start, end, published, businesses } = req.body
  if (!title || !start || !end) throw new AppError('Title, start, and end are required', 400)
  const s = new Date(start)
  const e = new Date(end)
  if (e <= s) throw new AppError('End date must be after start date', 400)

  const businessesArr = Array.isArray(businesses) && businesses.length
    ? businesses.map((b, i) => ({
        business: b.business || b.id || req.user._id,
        role: i === 0 ? 'Host' : b.role || 'Partner A',
      }))
    : [{ business: req.user._id, role: 'Host' }]

  const deal = await Deal.create({
    merchant: req.user._id,
    title: String(title).trim(),
    type: type || 'percent',
    value: String(value || '').trim(),
    desc: String(desc || '').trim(),
    terms: Array.isArray(terms) ? terms.map(String) : [],
    start: s,
    end: e,
    published: !!published,
    businesses: businessesArr,
  })

  if (deal.published) {
    await User.updateOne({ _id: req.user._id }, { $inc: { dealsCount: 1 } })
    await notifyFollowers(
      req.user._id,
      'deal',
      `<b>${merchantName(req.user)}</b> just posted a new deal: <b>${deal.title}</b>.`,
      'i-tag'
    )
  }

  res.status(201).json({ success: true, message: 'Deal created', data: merchantDealRow(deal) })
})

export const updateDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findOne({ _id: req.params.id, merchant: req.user._id })
  if (!deal) throw new AppError('Deal not found', 404)

  const { title, type, value, desc, terms, start, end, published, businesses } = req.body
  if (title !== undefined) deal.title = String(title).trim()
  if (type !== undefined) deal.type = type
  if (value !== undefined) deal.value = String(value).trim()
  if (desc !== undefined) deal.desc = String(desc).trim()
  if (terms !== undefined) deal.terms = Array.isArray(terms) ? terms.map(String) : []
  if (start !== undefined) deal.start = new Date(start)
  if (end !== undefined) deal.end = new Date(end)
  if (published !== undefined && published && !deal.published) {
    await notifyFollowers(
      req.user._id,
      'deal',
      `<b>${merchantName(req.user)}</b> just posted a new deal: <b>${deal.title}</b>.`,
      'i-tag'
    )
  }
  if (published !== undefined) deal.published = !!published
  if (Array.isArray(businesses) && businesses.length) {
    deal.businesses = businesses.map((b, i) => ({
      business: b.business || b.id || req.user._id,
      role: i === 0 ? 'Host' : b.role || 'Partner A',
    }))
  }

  await deal.save()
  res.json({ success: true, message: 'Deal updated', data: merchantDealRow(deal) })
})

export const deleteDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findOneAndDelete({ _id: req.params.id, merchant: req.user._id })
  if (!deal) throw new AppError('Deal not found', 404)
  res.json({ success: true, message: 'Deal deleted' })
})

// --------------------------------------------------------------------------
// Reviews (received by this merchant)
// --------------------------------------------------------------------------
export const getMerchantReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ business: req.user._id, moderation: { $ne: 'removed' } })
    .populate({ path: 'author', select: 'name' })
    .sort({ createdAt: -1 })
    .lean()

  res.json({ success: true, data: reviews.map(merchantReviewRow) })
})

export const flagReview = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const review = await Review.findOne({ _id: req.params.id, business: req.user._id })
  if (!review) throw new AppError('Review not found', 404)

  review.moderation = 'escalated'
  review.flagged = true
  review.flagReason = String(reason || 'Reported by merchant')
  await review.save()

  await createNotification(
    req.user._id,
    'system',
    'You flagged a customer review for admin moderation.',
    'i-alert-triangle'
  )
  res.json({ success: true, message: 'Review flagged for moderation' })
})

export const replyToReview = asyncHandler(async (req, res) => {
  const { text } = req.body
  if (!text || !String(text).trim()) throw new AppError('Reply text is required', 400)
  const review = await Review.findOne({ _id: req.params.id, business: req.user._id })
  if (!review) throw new AppError('Review not found', 404)

  review.reply = String(text).trim()
  await review.save()

  if (review.author && !review.author.equals(req.user._id)) {
    await createNotification(
      review.author,
      'review',
      `<b>${merchantName(req.user)}</b> replied to your review.`,
      'i-message'
    )
  }
  res.json({ success: true, message: 'Reply saved', data: { reply: review.reply } })
})

// --------------------------------------------------------------------------
// Cross-promotions
// --------------------------------------------------------------------------
export const getMerchantPromotions = asyncHandler(async (req, res) => {
  const promos = await CrossPromotion.find({
    $or: [{ businessA: req.user._id }, { businessB: req.user._id }],
  })
    .populate('businessA', 'businessName category')
    .populate('businessB', 'businessName category')
    .sort({ createdAt: -1 })
    .lean()

  res.json({ success: true, data: promos.map((p) => promoRow(p, req.user._id)) })
})

export const getMerchantPartners = asyncHandler(async (req, res) => {
  const partners = await User.find({ role: 'merchant', status: 'live', _id: { $ne: req.user._id } })
    .select('businessName category address rating')
    .lean()

  res.json({
    success: true,
    data: partners.map((p) => ({
      id: p._id,
      name: merchantName(p),
      category: p.category || '',
      addr: p.address || '',
      rating: p.rating || 0,
    })),
  })
})

export const createPromotion = asyncHandler(async (req, res) => {
  const { partnerId, offer, terms, start, end } = req.body
  if (!partnerId || !offer || !start || !end) throw new AppError('Partner, offer, start, and end are required', 400)
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (endDate <= startDate) throw new AppError('End date must be after start date', 400)
  const partner = await User.findOne({ _id: partnerId, role: 'merchant', status: 'live' })
  if (!partner) throw new AppError('Partner not found', 404)
  if (partnerId === req.user._id.toString()) throw new AppError('Cannot partner with yourself', 400)

  const existing = await CrossPromotion.findOne({
    $or: [
      { businessA: req.user._id, businessB: partnerId, status: 'awaiting' },
      { businessA: partnerId, businessB: req.user._id, status: 'awaiting' },
    ],
  })
  if (existing) throw new AppError('There is already a pending request with this partner', 400)

  const promo = await CrossPromotion.create({
    createdBy: req.user._id,
    businessA: req.user._id,
    businessB: partnerId,
    offer: String(offer).trim(),
    terms: Array.isArray(terms) ? terms.map(String) : [],
    start: startDate,
    end: endDate,
    status: 'awaiting',
  })

  await createNotification(
    partnerId,
    'promotion',
    `<b>${merchantName(req.user)}</b> wants to run a cross-promotion with you.`,
    'i-megaphone'
  )

  res.status(201).json({ success: true, message: 'Promotion request sent', data: { id: promo._id } })
})

export const acceptPromotion = asyncHandler(async (req, res) => {
  const promo = await CrossPromotion.findOne({ _id: req.params.id, businessB: req.user._id, status: 'awaiting' })
    .populate('businessA', 'businessName name')
  if (!promo) throw new AppError('Pending promotion not found', 404)

  promo.status = 'accepted'
  await promo.save()

  // Create a bundle deal for the accepted cross-promotion
  const deal = await Deal.create({
    merchant: promo.businessA._id,
    title: promo.offer,
    type: 'bundle',
    value: 'BUNDLE',
    desc: promo.terms?.[0] || promo.offer,
    terms: promo.terms || [],
    start: promo.start,
    end: promo.end,
    published: true,
    views: 0,
    saves: 0,
    businesses: [
      { business: promo.businessA._id, role: 'Host' },
      { business: req.user._id, role: 'Partner A' },
    ],
  })

  // Accepting merchant notifies creator
  await createNotification(
    promo.createdBy,
    'promotion',
    `<b>${merchantName(req.user)}</b> accepted your cross-promotion request.`,
    'i-check-circle'
  )
  await notifyFollowers(
    promo.businessA._id,
    'promotion',
    `<b>${merchantName(promo.businessA)}</b> launched a new cross-promotion with <b>${merchantName(req.user)}</b>.`,
    'i-megaphone'
  )

  res.json({ success: true, message: 'Promotion accepted', dealId: deal._id })
})

export const declinePromotion = asyncHandler(async (req, res) => {
  const promo = await CrossPromotion.findOne({ _id: req.params.id, businessB: req.user._id, status: 'awaiting' })
  if (!promo) throw new AppError('Pending promotion not found', 404)

  promo.status = 'declined'
  await promo.save()

  await createNotification(
    promo.createdBy,
    'system',
    `<b>${merchantName(req.user)}</b> declined your cross-promotion request.`,
    'i-x-circle'
  )

  res.json({ success: true, message: 'Promotion declined' })
})

export const deletePromotion = asyncHandler(async (req, res) => {
  const promo = await CrossPromotion.findOne({ _id: req.params.id, status: 'awaiting' })
  if (!promo) throw new AppError('Promotion not found', 404)
  if (!promo.createdBy.equals(req.user._id)) throw new AppError('You can only delete your own pending request', 403)

  await promo.deleteOne()
  res.json({ success: true, message: 'Promotion cancelled' })
})