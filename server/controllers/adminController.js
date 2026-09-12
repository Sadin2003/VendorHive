import User from '../models/User.js'
import Deal from '../models/Deal.js'
import Review from '../models/Review.js'
import Interaction from '../models/Interaction.js'
import SavedDeal from '../models/SavedDeal.js'
import ContactMessage from '../models/ContactMessage.js'
import PlatformSetting from '../models/PlatformSetting.js'
import AuditLog from '../models/AuditLog.js'
import asyncHandler from '../middlewares/asyncHandler.js'
import { AppError } from '../middlewares/error.js'
import { humanTime, merchantName } from '../utils/serialize.js'
import { createNotification } from '../utils/notify.js'
import { recomputeBusinessRating } from '../utils/rating.js'

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------
function fmtShort(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function waitLabel(u) {
  const ms = Date.now() - new Date(u.createdAt).getTime()
  const hrs = Math.max(1, Math.round(ms / 36e5))
  if (hrs >= 72) return `${(hrs / 24).toFixed(1).replace('.0', '')}d`
  return `${hrs}h`
}

function merchantStatus(u) {
  if (u.status === 'pending' || u.status === 'rejected' || u.status === 'suspended' || u.status === 'delisted') {
    return u.status
  }
  return u.verified ? 'live' : 'reviewed'
}

function merchantRow(m) {
  return {
    id: m._id,
    name: m.businessName || merchantName(m),
    cat: m.category || '',
    owner: m.owner || m.name,
    addr: m.address || '',
    verified: m.verified,
    rating: m.rating || null,
    reports: m.reports || 0,
    status: merchantStatus(m),
  }
}

function verificationRow(m) {
  return {
    id: m._id,
    name: m.businessName || merchantName(m),
    owner: m.owner || m.name,
    email: m.email,
    cat: m.category || '',
    addr: m.address || '',
    waited: waitLabel(m),
    docs: m.docs ? `${m.docs}%` : '50%',
    note: m.about || 'No application notes provided.',
  }
}

function moderationRow(r) {
  return {
    id: r._id,
    business: merchantName(r.business),
    user: r.author?.name || 'Anonymous',
    rating: r.rating,
    date: humanTime(r.createdAt),
    reason: r.flagReason || 'Community report',
    risk: r.risk || 'med',
    text: r.text || '',
    moderation: r.moderation || 'kept',
  }
}

async function writeAudit(req, action, details = {}) {
  try {
    await AuditLog.create({ admin: req.user._id, action, details })
  } catch (err) {
    console.error('Audit write failed:', err.message)
  }
}

// --------------------------------------------------------------------------
// Dashboard + analytics
// --------------------------------------------------------------------------
export const getDashboard = asyncHandler(async (req, res) => {
  const [members, businesses, pending, flaggedReviews, deals, weekAgo] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'merchant' }),
    User.countDocuments({ role: 'merchant', status: 'pending' }),
    Review.countDocuments({ flagged: true }),
    Deal.find().select('views saves').lean(),
    new Date(Date.now() - 7 * 864e5),
  ])

  const newThisWeek = await User.countDocuments({ createdAt: { $gte: weekAgo } })
  const over72 = await User.countDocuments({ role: 'merchant', status: 'pending', createdAt: { $lte: new Date(Date.now() - 72 * 36e5) } })
  const escalated = await Review.countDocuments({ moderation: 'escalated' })
  const totalViews = deals.reduce((s, d) => s + (d.views || 0), 0)
  const totalSaves = deals.reduce((s, d) => s + (d.saves || 0), 0)

  const pendingList = await User.find({ role: 'merchant', status: 'pending' })
    .sort({ createdAt: 1 })
    .limit(3)
    .lean()

const flaggedList = await Review.find({ flagged: true })
    .populate('author business', 'name')
    .sort({ updatedAt: -1 })
    .limit(3)
    .lean()

  // Monthly cumulative members (last 12 months) for the area chart.
  const growth = []
  let cumulative = 0
  for (let i = 11; i >= 0; i--) {
    const start = new Date(Date.now() - i * 2629800000)
    const end = new Date(Date.now() - (i - 1) * 2629800000)
    cumulative += await User.countDocuments({ createdAt: { $gte: start, $lt: end } })
    growth.push(Math.max(1, cumulative))
  }

  // Weekly signups (last 11 weeks) for the bar chart.
  const signups = []
  for (let i = 10; i >= 0; i--) {
    const start = new Date(Date.now() - i * 7 * 864e5)
    const end = new Date(Date.now() - (i - 1) * 7 * 864e5)
    signups.push(await User.countDocuments({ createdAt: { $gte: start, $lt: end } }))
  }

  res.json({
    success: true,
    data: {
      stats: [
        { icon: 'i-users', tone: 'green', label: 'Members', value: members.toLocaleString(), delta: `+${newThisWeek} this week` },
        { icon: 'i-store', tone: 'cyan', label: 'Businesses', value: businesses.toLocaleString(), delta: `+${pending} pending` },
        { icon: 'i-shield', tone: 'amber', label: 'Pending verification', value: String(pending), delta: over72 ? `${over72} over 72h` : 'all recent' },
        { icon: 'i-tag', tone: 'red', label: 'Flagged reviews', value: String(flaggedReviews), delta: escalated ? `${escalated} escalated` : 'none escalated' },
      ],
      views30d: totalViews,
      saves30d: totalSaves,
      pendingVerification: pendingList.map((m) => ({
        name: m.businessName || merchantName(m),
        owner: m.owner || m.name,
        cat: m.category || '',
        wait: waitLabel(m),
        r: m.docs ? `${m.docs}%` : '50%',
      })),
      flaggedReviews: flaggedList.map((r) => ({
        user: r.author?.name || 'Anonymous',
business: merchantName(r.business),
        reason: r.flagReason || 'Community report',
        risk: r.risk || 'med',
      })),
      growth,
      signups,
    },
  })
})

export const getAnalytics = asyncHandler(async (req, res) => {
  const [deals, interactions, saveCounts] = await Promise.all([
    Deal.find().select('views saves merchant type value').lean(),
    Interaction.distinct('user'),
    Deal.aggregate([
      { $lookup: { from: 'users', localField: 'merchant', foreignField: '_id', as: 'm' } },
      { $unwind: { path: '$m', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$m.category', deals: { $sum: 1 }, saves: { $sum: '$saves' } } },
      { $sort: { saves: -1 } },
    ]),
  ])

  const totalViews = deals.reduce((s, d) => s + (d.views || 0), 0)
  const totalSaves = deals.reduce((s, d) => s + (d.saves || 0), 0)
  const avgPerDeal = deals.length ? Math.round(totalSaves / deals.length) : 0
  const maxSaves = Math.max(1, ...saveCounts.map((c) => c.saves || 0))

  const categories = saveCounts.map((c) => {
    const pct = Math.max(2, Math.round(((c.saves || 0) / maxSaves) * 100))
    return { c: c._id || 'Uncategorized', deals: c.deals, saves: c.saves || 0, pct }
  })

  res.json({
    success: true,
    data: {
      kpis: [
        { icon: 'i-eye', tone: 'green', label: 'Total profile views', value: totalViews.toLocaleString(), delta: 'across all live deals' },
        { icon: 'i-bookmark-o', tone: 'amber', label: 'Deal redemptions', value: totalSaves.toLocaleString(), delta: '+all-time saves' },
        { icon: 'i-users', tone: 'cyan', label: 'Active trippers', value: String(interactions.length), delta: 'engaged this period' },
        { icon: 'i-chart', tone: 'red', label: 'Avg. saves per deal', value: String(avgPerDeal), delta: 'across active deals' },
      ],
      categories,
    },
  })
})

// --------------------------------------------------------------------------
// Merchant verification
// --------------------------------------------------------------------------
export const getVerificationQueue = asyncHandler(async (req, res) => {
  const queue = await User.find({ role: 'merchant', status: 'pending' }).sort({ createdAt: 1 }).lean()
  res.json({ success: true, data: queue.map(verificationRow) })
})

export const approveMerchant = asyncHandler(async (req, res) => {
  const m = await User.findById(req.params.id)
  if (!m || m.role !== 'merchant') throw new AppError('Merchant not found', 404)
  m.status = 'active'
  m.verified = true
  m.docs = 100
  m.rejectionReason = undefined
  await m.save()
  await writeAudit(req, 'merchant.approve', { merchant: m.businessName || m.name })
  await createNotification(
    m._id,
    'system',
    '🎉 Your application was approved — your shop is live and you can start posting deals.'
  )
  res.json({ success: true, message: `${m.businessName || 'Merchant'} approved`, data: merchantRow(m) })
})

export const rejectMerchant = asyncHandler(async (req, res) => {
  const { reason } = req.body
  if (!reason || !reason.trim()) throw new AppError('A rejection reason is required', 400)
  const m = await User.findById(req.params.id)
  if (!m || m.role !== 'merchant') throw new AppError('Merchant not found', 404)
  m.status = 'rejected'
  m.verified = false
  m.rejectionReason = reason.trim()
  await m.save()
  await writeAudit(req, 'merchant.reject', { merchant: m.businessName || m.name, reason })
  await createNotification(m._id, 'system', `Your application was rejected: ${reason.trim()}`)
  res.json({ success: true, message: 'Application rejected and merchant notified', data: merchantRow(m) })
})

// --------------------------------------------------------------------------
// Businesses + members
// --------------------------------------------------------------------------
export const getMerchants = asyncHandler(async (req, res) => {
  const list = await User.find({ role: 'merchant' }).sort({ createdAt: 1 }).lean()
  res.json({ success: true, data: list.map(merchantRow) })
})

export const setMerchantStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  if (!['live', 'suspended', 'delisted', 'active', 'reviewed'].includes(status)) {
    throw new AppError('Invalid status', 400)
  }
  const m = await User.findById(req.params.id)
  if (!m || m.role !== 'merchant') throw new AppError('Merchant not found', 404)
  m.status = status
  if (status === 'active' || status === 'live') m.verified = true
  await m.save()
  await writeAudit(req, 'merchant.status', { merchant: m.businessName || m.name, status })
  res.json({ success: true, message: 'Status updated', data: merchantRow(m) })
})

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).lean()
  const perUserSaves = {}
  for (const row of await SavedDeal.find().select('user').lean()) {
    perUserSaves[row.user] = (perUserSaves[row.user] || 0) + 1
  }
  const perMerchantDeals = {}
  for (const row of await Deal.find().select('merchant').lean()) {
    perMerchantDeals[row.merchant] = (perMerchantDeals[row.merchant] || 0) + 1
  }

  res.json({
    success: true,
    data: users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role === 'customer' ? 'shopper' : u.role,
      joined: u.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      status: u.status,
      deals: u.role === 'merchant' ? perMerchantDeals[u._id] || 0 : perUserSaves[u._id] || 0,
    })),
  })
})

export const setUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  if (!['active', 'suspended'].includes(status)) throw new AppError('Invalid status', 400)
  const u = await User.findById(req.params.id)
  if (!u) throw new AppError('User not found', 404)
  if (u.role === 'admin' && status === 'suspended') throw new AppError('Cannot suspend an admin', 400)
  u.status = status
  await u.save()
  await writeAudit(req, 'user.status', { user: u.name, status })
  await createNotification(u._id, 'system', status === 'suspended'
    ? 'Your account has been suspended. Contact support@vendorhive.co for help.'
    : 'Your account has been restored. Welcome back!')
  res.json({ success: true, message: 'Status updated' })
})

// --------------------------------------------------------------------------
// Review moderation
// --------------------------------------------------------------------------
export const getReviewQueue = asyncHandler(async (req, res) => {
  const scope = req.query.scope || 'queue'
  const filter = { moderation: { $ne: 'removed' } }
  if (scope === 'queue') filter.moderation = { $in: ['pending', 'escalated'] }
  if (scope === 'recent') filter.createdAt = { $gte: new Date(Date.now() - 864e5) }
  const rows = await Review.find(filter)
    .populate('author', 'name')
    .populate('business', 'businessName name category')
    .sort({ createdAt: -1 })
    .lean()
  res.json({ success: true, data: rows.map(moderationRow) })
})

async function resolveReview(req, moderation, extra = {}) {
  const r = await Review.findById(req.params.id)
  if (!r) throw new AppError('Review not found', 404)
  Object.assign(r, { moderation, flagged: moderation !== 'kept', ...extra })
  await r.save()
  if (r.business) await recomputeBusinessRating(r.business)
  await writeAudit(req, `review.${moderation}`, { review: r._id, rating: r.rating })
  return r
}

export const keepReview = asyncHandler(async (req, res) => {
  await resolveReview(req, 'kept', { flagReason: undefined })
  res.json({ success: true, message: 'Review kept — flag cleared' })
})

export const removeReview = asyncHandler(async (req, res) => {
  await resolveReview(req, 'removed', { flagReason: undefined })
  res.json({ success: true, message: 'Review removed' })
})

export const escalateReview = asyncHandler(async (req, res) => {
  await resolveReview(req, 'escalated')
  res.json({ success: true, message: 'Escalated to human review' })
})

export const setReviewRisk = asyncHandler(async (req, res) => {
  const { risk } = req.body
  if (!['low', 'med', 'high'].includes(risk)) throw new AppError('Invalid risk level', 400)
  const r = await Review.findById(req.params.id)
  if (!r) throw new AppError('Review not found', 404)
  r.risk = risk
  await r.save()
  await writeAudit(req, 'review.risk', { review: r._id, risk })
  res.json({ success: true, message: `Risk set to ${risk}` })
})

// --------------------------------------------------------------------------
// Contact messages
// --------------------------------------------------------------------------
export const getMessages = asyncHandler(async (req, res) => {
  const rows = await ContactMessage.find()
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .lean()
  res.json({
    success: true,
    data: rows.map((m) => ({
      id: m._id,
      name: m.name,
      sender: m.user?.name || null,
      email: m.email,
      topic: m.topic,
      message: m.message,
      status: m.status,
      date: fmtShort(m.createdAt),
    })),
  })
})

export const markMessageRead = asyncHandler(async (req, res) => {
  const m = await ContactMessage.findById(req.params.id)
  if (!m) throw new AppError('Message not found', 404)
  m.status = 'read'
  await m.save()
  res.json({ success: true, message: 'Marked as read' })
})

export const deleteMessage = asyncHandler(async (req, res) => {
  await ContactMessage.findByIdAndDelete(req.params.id)
  res.json({ success: true, message: 'Message deleted' })
})

// --------------------------------------------------------------------------
// Platform settings
// --------------------------------------------------------------------------
export const getSettings = asyncHandler(async (req, res) => {
  let s = await PlatformSetting.findOne({ key: 'platform' })
  if (!s) s = await PlatformSetting.create({ key: 'platform' })
  res.json({ success: true, data: s })
})

export const updateSettings = asyncHandler(async (req, res) => {
  const { platformName, supportEmail, salesTaxNote, flags } = req.body
  let s = await PlatformSetting.findOne({ key: 'platform' })
  if (!s) s = await PlatformSetting.create({ key: 'platform' })
  if (platformName) s.platformName = platformName
  if (supportEmail) s.supportEmail = supportEmail
  if (salesTaxNote !== undefined) s.salesTaxNote = salesTaxNote
  if (flags && typeof flags === 'object') {
    for (const k of Object.keys(flags)) {
      if (k in s.flags) s.flags[k] = flags[k]
    }
  }
  await s.save()
  await writeAudit(req, 'settings.update', { flags: flags || {}, platformName: platformName || s.platformName })
  res.json({ success: true, message: 'Settings saved', data: s })
})