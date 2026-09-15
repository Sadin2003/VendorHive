import User from '../models/User.js'
import Deal from '../models/Deal.js'
import Review from '../models/Review.js'
import HelpfulVote from '../models/HelpfulVote.js'
import Follow from '../models/Follow.js'
import SavedDeal from '../models/SavedDeal.js'
import Interaction from '../models/Interaction.js'
import Notification from '../models/Notification.js'
import asyncHandler from '../middlewares/asyncHandler.js'
import { AppError } from '../middlewares/error.js'
import { sanitizeUser, clearTokenCookie } from '../utils/token.js'
import { toDealCard, toBusinessCard, toReview, toNotification, merchantName } from '../utils/serialize.js'
import { recommendDeals, recordInteraction } from '../utils/recommend.js'
import { recomputeBusinessRating } from '../utils/rating.js'
import { createNotification } from '../utils/notify.js'
import { moderateText } from '../utils/moderation.js'

// --------------------------------------------------------------------------
// Profile
// --------------------------------------------------------------------------
export const getProfile = asyncHandler(async (req, res) => {
  const u = req.user
  res.json({
    success: true,
    data: {
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone || '',
      zip: u.zip || '',
      bio: u.bio || '',
      prefs: u.prefs || {},
    },
  })
})

export const updateProfile = asyncHandler(async (req, res) => {
  const u = req.user
  const { name, email, phone, zip, bio, prefs } = req.body

  if (name !== undefined) u.name = String(name).trim()
  if (phone !== undefined) u.phone = String(phone).trim()
  if (zip !== undefined) u.zip = String(zip).trim()
  if (bio !== undefined) u.bio = String(bio).trim()

  if (prefs && typeof prefs === 'object') {
    const allowed = ['newsletter', 'dealAlerts', 'reviewAlerts', 'promoAlerts', 'activityDigest']
    const nextPrefs = { ...(u.prefs || {}) }
    for (const key of allowed) {
      if (typeof prefs[key] === 'boolean') nextPrefs[key] = prefs[key]
    }
    u.prefs = nextPrefs
  }

  if (email !== undefined && email !== u.email) {
    const exists = await User.findOne({ email: String(email).toLowerCase() })
    if (exists) throw new AppError('That email is already in use', 400)
    u.email = String(email).toLowerCase()
  }
  await u.save()

  res.json({ success: true, message: 'Profile updated', user: sanitizeUser(u) })
})

export const changePassword = asyncHandler(async (req, res) => {
  const { current, next } = req.body
  const matches = await req.user.matchPassword(current || '')
  if (!matches) throw new AppError('Current password is incorrect', 400)
  if (!next || next.length < 6) throw new AppError('New password must be at least 6 characters', 400)
  req.user.password = next
  await req.user.save()
  res.json({ success: true, message: 'Password updated' })
})

export const deleteAccount = asyncHandler(async (req, res) => {
  const user = req.user

  const authoredReviews = await Review.find({ author: user._id }).select('business')
  const businessIds = [...new Set(authoredReviews.map((r) => r.business.toString()))]

  await Promise.all([
    Review.deleteMany({ author: user._id }),
    Follow.deleteMany({ user: user._id }),
    SavedDeal.deleteMany({ user: user._id }),
    HelpfulVote.deleteMany({ user: user._id }),
    Interaction.deleteMany({ user: user._id }),
    Notification.deleteMany({ user: user._id }),
  ])
  await User.deleteOne({ _id: user._id })

  for (const id of businessIds) await recomputeBusinessRating(id)

  clearTokenCookie(res)
  res.json({ success: true, message: 'Account deleted' })
})

// --------------------------------------------------------------------------
// Dashboard (personalized deals + nearby + recent activity)
// --------------------------------------------------------------------------
export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id

  const [savedCount, followingCount, reviewsCount, savedDocs, interactions] = await Promise.all([
    SavedDeal.countDocuments({ user: userId }),
    Follow.countDocuments({ user: userId }),
    Review.countDocuments({ author: userId }),
    SavedDeal.find({ user: userId }).select('deal'),
    Interaction.find({ user: userId })
      .populate({ path: 'deal', populate: { path: 'merchant', select: 'businessName name' } })
      .populate({ path: 'business', select: 'businessName name' })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ])

  const now = new Date()
  const [dealDocs, merchants] = await Promise.all([
    Deal.find({ published: true, start: { $lte: now }, end: { $gte: now } })
      .populate('merchant')
      .lean(),
    User.find({ role: 'merchant', status: 'live' }).sort({ rating: -1 }).limit(4).lean(),
  ])

  const recommended = await recommendDeals(userId, dealDocs)
  const savedIds = new Set(savedDocs.map((s) => s.deal.toString()))
  const recommendedCards = recommended.slice(0, 3).map((d) => ({
    ...toDealCard(d),
    saved: savedIds.has(d._id.toString()),
  }))

  const nearby = merchants.map((b) => toBusinessCard(b, { activeDeals: 0 }))

  const iconMap = {
    save_deal: { icon: 'i-bookmark', tone: { bg: 'rgba(240,192,120,.28)', c: '#8a5a14' } },
    follow_business: { icon: 'i-heart', tone: { bg: 'rgba(192,86,66,.12)', c: 'var(--danger-2)' } },
    view_deal: { icon: 'i-tag', tone: { bg: 'rgba(240,192,120,.2)', c: 'var(--amber-2)' } },
    view_business: { icon: 'i-map-pin', tone: { bg: 'rgba(60,107,79,.12)', c: 'var(--primary-600)' } },
  }

  const activity = interactions.map((it) => {
    const style = iconMap[it.type] || iconMap.view_deal
    const biz = it.deal?.merchant ? merchantName(it.deal.merchant) : merchantName(it.business)
    const label = it.deal ? 'deal' : 'business'
    const verb = it.type === 'save_deal' ? 'saved' : it.type === 'follow_business' ? 'followed' : 'visited'
    return {
      icon: style.icon,
      tone: style.tone,
      text: `You ${verb} the <b>${biz}</b> ${label}.`,
      time: timeAgo(it.createdAt),
    }
  })

  res.json({
    success: true,
    data: {
      user: {
        name: req.user.name,
        stats: { saved: savedCount, following: followingCount, reviews: reviewsCount },
      },
      recommended: recommendedCards,
      nearby,
      activity,
    },
  })
})

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// --------------------------------------------------------------------------
// Saved deals
// --------------------------------------------------------------------------
export const getSavedDeals = asyncHandler(async (req, res) => {
  const rows = await SavedDeal.find({ user: req.user._id })
    .populate({ path: 'deal', populate: { path: 'merchant' } })
    .sort({ createdAt: -1 })

  const data = rows.map((row) => {
    const d = row.deal
    const m = d.merchant
    return {
      id: d._id,
      merchant: merchantName(m),
      title: d.title,
      discount: discountTag(d),
      expires: new Date(d.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      coverKey: d.coverKey || (m ? merchantName(m) : 'Deal'),
    }
  })
  res.json({ success: true, data })
})

function discountTag(d) {
  if (d.value) return d.value
  switch (d.type) {
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

export const saveDeal = asyncHandler(async (req, res) => {
  const { id } = req.params
  const deal = await Deal.findOne({ _id: id, published: true }).populate('merchant')
  if (!deal) throw new AppError('Deal not found', 404)

  const exists = await SavedDeal.exists({ user: req.user._id, deal: deal._id })
  if (!exists) {
    await SavedDeal.create({ user: req.user._id, deal: deal._id })
    deal.saves = (deal.saves || 0) + 1
    await deal.save()
    await recordInteraction(req.user._id, 'save_deal', {
      deal,
      business: deal.merchant,
      category: deal.merchant?.category,
    })
  }
  res.json({ success: true, message: 'Deal saved' })
})

export const unsaveDeal = asyncHandler(async (req, res) => {
  const removed = await SavedDeal.findOneAndDelete({ user: req.user._id, deal: req.params.id })
  if (removed) {
    await Deal.updateOne({ _id: req.params.id }, { $inc: { saves: -1 } })
  }
  res.json({ success: true, message: 'Deal removed from saved' })
})

// --------------------------------------------------------------------------
// Following
// --------------------------------------------------------------------------
export const getFollowing = asyncHandler(async (req, res) => {
  const rows = await Follow.find({ user: req.user._id }).populate('business')
  const data = rows.map((f) => {
    const b = f.business
    return {
      id: b._id,
      name: merchantName(b),
      category: b.category || '',
      rating: b.rating || 0,
      reviews: b.ratingsCount || 0,
      addr: b.address || '',
      address: b.address || '',
      verified: !!b.verified,
      openNow: false,
      emoji: b.emoji || '🏪',
    }
  })
  res.json({ success: true, data })
})

export const followBusiness = asyncHandler(async (req, res) => {
  const { businessId } = req.params
  const business = await User.findOne({ _id: businessId, role: 'merchant', status: 'live' })
  if (!business) throw new AppError('Business not found', 404)
  if (business._id.equals(req.user._id)) throw new AppError('You cannot follow your own business', 400)

  const row = await Follow.findOne({ user: req.user._id, business: business._id })
  if (!row) {
    await Follow.create({ user: req.user._id, business: business._id })
    await User.updateOne({ _id: business._id }, { $inc: { followersCount: 1 } })
    await recordInteraction(req.user._id, 'follow_business', { business, category: business.category })
    await createNotification(
      business._id,
      'system',
      `<b>${req.user.name}</b> now follows your business.`,
      'i-heart'
    )
  }
  res.json({ success: true, message: `Following ${merchantName(business)}`, following: true })
})

export const unfollowBusiness = asyncHandler(async (req, res) => {
  const removed = await Follow.findOneAndDelete({ user: req.user._id, business: req.params.businessId })
  if (removed) {
    await User.updateOne({ _id: req.params.businessId }, { $inc: { followersCount: -1 } })
  }
  res.json({ success: true, message: 'Unfollowed', following: false })
})

// --------------------------------------------------------------------------
// Reviews
// --------------------------------------------------------------------------
export const getMyReviews = asyncHandler(async (req, res) => {
  const rows = await Review.find({ author: req.user._id })
    .populate({ path: 'business', select: 'businessName name' })
    .sort({ createdAt: -1 })
    .lean()

  const data = rows.map((r) => ({
    id: r._id,
    merchantId: r.business?._id,
    merchant: merchantName(r.business),
    rating: r.rating,
    date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    text: r.text || '',
  }))
  res.json({ success: true, data })
})

export const createReview = asyncHandler(async (req, res) => {
  const { businessId, rating, text } = req.body
  const business = await User.findOne({ _id: businessId, role: 'merchant', status: 'live' })
  if (!business) throw new AppError('Business not found', 404)
  if (business._id.equals(req.user._id)) throw new AppError('You cannot review your own business', 400)

  const stars = Number(rating)
  const body = String(text || '').trim()
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) throw new AppError('Rating must be between 1 and 5', 400)
  if (body.length < 3) throw new AppError('Review text is too short', 400)

  const { flagged, risk, reason } = moderateText(body)
  const review = await Review.create({
    author: req.user._id,
    business: business._id,
    rating: stars,
    text: body,
    moderation: flagged ? 'escalated' : 'kept',
    flagged,
    flagReason: flagged ? reason : undefined,
    risk,
  })
  await recomputeBusinessRating(business._id)
  await createNotification(
    business._id,
    'review',
    `New <b>${stars}-star review</b> from ${req.user.name}: "${body.slice(0, 60)}${body.length > 60 ? '…' : ''}"`,
    'i-star'
  )

  res.status(201).json({
    success: true,
    message: 'Thanks! Your review was posted.',
    data: toReview({ ...review.toObject(), author: { name: req.user.name } }),
  })
})

export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, author: req.user._id })
  if (!review) throw new AppError('Review not found', 403)
  if (review.moderation === 'removed') throw new AppError('This review was removed and cannot be edited', 400)

  const stars = Number(req.body.rating)
  const body = String(req.body.text || '').trim()
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) throw new AppError('Rating must be between 1 and 5', 400)
  if (body.length < 3) throw new AppError('Review text is too short', 400)

  review.rating = stars
  review.text = body

  const { flagged, risk, reason } = moderateText(body)
  if (flagged) {
    review.moderation = 'escalated'
    review.flagged = true
    review.flagReason = reason
    review.risk = risk
  }
  await review.save()
  await recomputeBusinessRating(review.business)

  res.json({ success: true, message: 'Review updated', data: toReview({ ...review.toObject(), author: { name: req.user.name } }) })
})

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, author: req.user._id })
  if (!review) throw new AppError('Review not found', 403)
  await Promise.all([
    review.deleteOne(),
    HelpfulVote.deleteMany({ review: review._id }),
  ])
  await recomputeBusinessRating(review.business)
  res.json({ success: true, message: 'Review deleted' })
})

export const toggleHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, moderation: { $ne: 'removed' } })
  if (!review) throw new AppError('Review not found', 404)
  if (review.author.equals(req.user._id)) throw new AppError('You cannot vote on your own review', 400)

  const value = req.body.value === undefined ? 1 : Number(req.body.value)
  if (value !== 1 && value !== -1) throw new AppError('Invalid vote value', 400)

  const vote = await HelpfulVote.findOne({ user: req.user._id, review: review._id })
  let helpfulVoted = false
  let unhelpfulVoted = false

  if (vote) {
    if (vote.value === value) {
      // Same vote again → toggle it off.
      await vote.deleteOne()
      if (value === 1) review.helpful = Math.max(0, (review.helpful || 0) - 1)
      else review.unhelpful = Math.max(0, (review.unhelpful || 0) - 1)
    } else {
      // Swap helpful ⇄ unhelpful.
      vote.value = value
      await vote.save()
      if (value === 1) {
        review.helpful = (review.helpful || 0) + 1
        review.unhelpful = Math.max(0, (review.unhelpful || 0) - 1)
        helpfulVoted = true
      } else {
        review.unhelpful = (review.unhelpful || 0) + 1
        review.helpful = Math.max(0, (review.helpful || 0) - 1)
        unhelpfulVoted = true
      }
    }
  } else {
    await HelpfulVote.create({ user: req.user._id, review: review._id, value })
    if (value === 1) {
      review.helpful = (review.helpful || 0) + 1
      helpfulVoted = true
      const author = await User.findById(review.author)
      if (author && !author._id.equals(req.user._id)) {
        await createNotification(
          author._id,
          'review',
          `Your review of a business was marked <b>helpful</b> by ${req.user.name}.`,
          'i-heart'
        )
      }
    } else {
      review.unhelpful = (review.unhelpful || 0) + 1
      unhelpfulVoted = true
    }
  }
  await review.save()

  const message = helpfulVoted ? 'Marked as helpful' : unhelpfulVoted ? 'Marked as unhelpful' : 'Vote removed'
  res.json({
    success: true,
    data: { helpful: review.helpful, unhelpful: review.unhelpful, helpfulVoted, unhelpfulVoted },
    message,
  })
})

// --------------------------------------------------------------------------
// Notifications
// --------------------------------------------------------------------------
export const getNotifications = asyncHandler(async (req, res) => {
  const rows = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50)
  res.json({
    success: true,
    data: rows.map(toNotification),
    unread: rows.filter((n) => n.unread).length,
  })
})

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, unread: true }, { $set: { unread: false } })
  res.json({ success: true, message: 'All marked as read' })
})

export const markNotificationRead = asyncHandler(async (req, res) => {
  await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { $set: { unread: false } })
  res.json({ success: true, message: 'Marked as read' })
})

export const dismissNotification = asyncHandler(async (req, res) => {
  await Notification.deleteOne({ _id: req.params.id, user: req.user._id })
  res.json({ success: true, message: 'Notification dismissed' })
})