import User from '../models/User.js'
import Review from '../models/Review.js'
import PlatformSetting from '../models/PlatformSetting.js'
import AuditLog from '../models/AuditLog.js'
import asyncHandler from '../middlewares/asyncHandler.js'
import { AppError } from '../middlewares/error.js'

const logAudit = async (admin, action, details) => {
  try {
    await AuditLog.create({ admin: admin?._id, action, details })
  } catch (err) {
    console.error('Audit log write failed:', err.message)
  }
}

const fmtWait = (date) => {
  const hours = Math.max(1, Math.round((Date.now() - new Date(date).getTime()) / 3600000))
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}

// ---------------- Dashboard stats ----------------
export const getStats = asyncHandler(async (req, res) => {
  const [members, businesses, pendingVerification, flaggedReviews] = await Promise.all([
    User.countDocuments({ role: { $ne: 'admin' } }),
    User.countDocuments({ role: 'merchant' }),
    User.countDocuments({ role: 'merchant', status: 'pending' }),
    Review.countDocuments({ flagged: true, moderation: 'pending' }),
  ])

  const since = Date.now() - 7 * 24 * 3600 * 1000
  const weeklySignups = await User.aggregate([
    { $match: { role: { $ne: 'admin' }, createdAt: { $gte: new Date(since) } } },
    { $project: { week: { $week: '$createdAt' } } },
    { $group: { _id: '$week', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ])

  const monthlyActive = await User.aggregate([
    { $match: { role: { $ne: 'admin' }, status: 'active' } },
    { $project: { month: { $month: '$createdAt' } } },
    { $group: { _id: '$month', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ])

  const pending = await User.find({ role: 'merchant', status: 'pending' })
    .sort({ createdAt: 1 })
    .limit(4)

  const flagged = await Review.find({ flagged: true, moderation: 'pending' })
    .populate('author', 'name')
    .populate('business', 'businessName')
    .sort({ createdAt: 1 })
    .limit(4)

  res.json({
    success: true,
    data: {
      members,
      businesses,
      pendingVerification,
      flaggedReviews,
      weeklySignups: weeklySignups.map((w) => w.count).slice(-11),
      monthlyActive: monthlyActive.map((m) => m.count).slice(-12),
      recentPending: pending.map((p) => ({
        id: p._id,
        name: p.businessName,
        owner: p.owner || p.name,
        cat: p.category,
        wait: fmtWait(p.createdAt),
        r: `${Math.min(100, Math.round(p.docs || 0))}%`,
      })),
      recentFlagged: flagged.map((f) => ({
        id: f._id,
        user: f.author?.name ? `${f.author.name.split(' ')[0][0]}. ${f.author.name.split(' ').slice(-1)[0]}` : 'Unknown',
        business: f.business?.businessName || 'Unknown',
        reason: f.flagReason,
        risk: f.risk,
      })),
    },
  })
})

// ---------------- Merchant Verification ----------------
export const getVerification = asyncHandler(async (req, res) => {
  const queue = await User.find({ role: 'merchant', status: 'pending' }).sort({ createdAt: 1 })
  res.json({
    success: true,
    data: queue.map((q) => ({
      id: q._id,
      name: q.businessName,
      owner: q.owner || q.name,
      cat: q.category,
      addr: q.address,
      waited: fmtWait(q.createdAt),
      docs: `${Math.min(100, Math.round(q.docs || 0))}%`,
      note: q.description,
    })),
  })
})

export const approveVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) throw new AppError('Merchant not found', 404)
  if (user.role !== 'merchant') throw new AppError('Only merchant applications can be verified', 400)

  user.status = 'live'
  user.verified = true
  await user.save()
  await logAudit(req.user, 'MERCHANT_APPROVED', { merchant: user._id, name: user.businessName })

  res.json({ success: true, message: `${user.businessName} verified` })
})

export const rejectVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) throw new AppError('Merchant not found', 404)

  const { reason } = req.body
  user.status = 'rejected'
  user.verified = false
  user.rejectionReason = reason || 'Application rejected'
  await user.save()
  await logAudit(req.user, 'MERCHANT_REJECTED', { merchant: user._id, reason: user.rejectionReason })

  res.json({ success: true, message: 'Application rejected' })
})

// ---------------- User Management ----------------
export const getUsers = asyncHandler(async (req, res) => {
  const { role, status, q } = req.query
  const filter = { role: { $in: ['customer', 'merchant'] } }
  if (role === 'shopper') filter.role = 'customer'
  else if (role === 'merchant') filter.role = 'merchant'
  if (status && status !== 'all') filter.status = status
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { businessName: { $regex: q, $options: 'i' } },
    ]
  }

  const users = await User.find(filter).sort({ createdAt: -1 })
  res.json({
    success: true,
    data: users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role === 'customer' ? 'shopper' : 'merchant',
      joined: u.createdAt.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
      status: u.status,
      deals: u.dealsCount,
    })),
  })
})

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) throw new AppError('User not found', 404)

  if (user.status === 'pending') {
    user.status = 'active'
  } else if (user.status === 'suspended') {
    user.status = 'active'
  } else {
    user.status = 'suspended'
  }

  await user.save()
  await logAudit(req.user, 'USER_STATUS_CHANGE', { user: user._id, status: user.status })

  res.json({ success: true, status: user.status })
})

// ---------------- Business Management ----------------
export const getBusinesses = asyncHandler(async (req, res) => {
  const businesses = await User.find({ role: 'merchant' })
    .sort({ createdAt: -1 })
  res.json({
    success: true,
    data: businesses.map((b) => ({
      id: b._id,
      name: b.businessName || b.name,
      cat: b.category,
      owner: b.owner || b.name,
      verified: b.verified,
      rating: b.rating,
      reports: b.reports,
      status: b.status,
    })),
  })
})

export const toggleBusinessStatus = asyncHandler(async (req, res) => {
  const business = await User.findById(req.params.id)
  if (!business) throw new AppError('Business not found', 404)

  if (business.status === 'delisted') {
    business.status = 'live'
  } else {
    business.status = 'delisted'
  }
  await business.save()
  await logAudit(req.user, 'BUSINESS_STATUS_CHANGE', { business: business._id, status: business.status })

  res.json({ success: true, status: business.status })
})

// ---------------- Review Moderation ----------------
export const getReviews = asyncHandler(async (req, res) => {
  const { tab = 'pending' } = req.query
  const filter = { flagged: true }
  if (tab === 'pending') filter.moderation = 'pending'

  const reviews = await Review.find(filter)
    .populate('author', 'name')
    .populate('business', 'businessName')
    .sort({ createdAt: -1 })

  res.json({
    success: true,
    data: reviews.map((r) => ({
      id: r._id,
      business: r.business?.businessName || 'Unknown',
      user: r.author?.name || 'Unknown',
      rating: r.rating,
      date: r.createdAt,
      reason: r.flagReason,
      risk: r.risk,
      text: r.text,
      moderation: r.moderation,
    })),
  })
})

export const reviewAction = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) throw new AppError('Review not found', 404)

  const { action } = req.body
  if (action === 'remove') {
    await Review.findByIdAndDelete(review._id)
    await logAudit(req.user, 'REVIEW_REMOVED', { review: review._id })
    return res.json({ success: true, message: 'Review removed' })
  } else if (action === 'restore') {
    review.moderation = 'kept'
    review.flagged = false
    await review.save()
    await logAudit(req.user, 'REVIEW_RESTORED', { review: review._id })
    return res.json({ success: true, message: 'Review kept' })
  } else if (action === 'escalate') {
    review.moderation = 'escalated'
    await review.save()
    await logAudit(req.user, 'REVIEW_ESCALATED', { review: review._id })
    return res.json({ success: true, message: 'Escalated to human review' })
  }
  throw new AppError('Invalid action', 400)
})

// ---------------- Analytics ----------------
export const getAnalytics = asyncHandler(async (req, res) => {
  const [members, merchants, activeUsers, dealsCount] = await Promise.all([
    User.countDocuments({ role: { $ne: 'admin' } }),
    User.countDocuments({ role: 'merchant' }),
    User.countDocuments({ role: { $ne: 'admin' }, status: 'active' }),
    User.aggregate([{ $group: { _id: null, total: { $sum: '$dealsCount' } } }]),
  ])

  const totalDeals = dealsCount[0]?.total || 0

  const monthlyActive = await User.aggregate([
    { $match: { role: { $ne: 'admin' }, status: 'active' } },
    { $project: { month: { $month: '$createdAt' } } },
    { $group: { _id: '$month', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ])

  const since = Date.now() - 7 * 24 * 3600 * 1000
  const weeklySignups = await User.aggregate([
    { $match: { role: { $ne: 'admin' }, createdAt: { $gte: new Date(since) } } },
    { $project: { week: { $week: '$createdAt' } } },
    { $group: { _id: '$week', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ])

  const categories = ['Cafés', 'Bakeries', 'Restaurants', 'Health & Beauty', 'Gifts & Local']
  const cats = categories.map((c, i) => ({
    c,
    deals: Math.max(totalDeals - i * 12, 5),
    saves: 12000 + i * 5000,
    pct: Math.max(20, 100 - i * 18),
  }))

  res.json({
    success: true,
    data: {
      kpis: [
        { label: 'Total profile views', value: '1.28M', delta: '+24% this quarter' },
        { label: 'Deal redemptions', value: '86,204', delta: '+9% this month' },
        { label: 'Active trippers', value: activeUsers.toLocaleString(), delta: '+412 this week' },
        { label: 'Avg. deal value', value: '$11.42', delta: '+$0.68' },
      ],
      monthlyActive: monthlyActive.map((m) => m.count).slice(-12),
      weeklySignups: weeklySignups.map((w) => w.count).slice(-11),
      cats,
      members,
      merchants,
    },
  })
})

export const exportAnalytics = asyncHandler(async (req, res) => {
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="vendorhive-analytics.csv"')
  res.send([
    'Metric,Value',
    `Members,${await User.countDocuments({ role: { $ne: 'admin' } })}`,
    `Businesses,${await User.countDocuments({ role: 'merchant' })}`,
    `Pending verification,${await User.countDocuments({ role: 'merchant', status: 'pending' })}`,
    `Flagged reviews,${await Review.countDocuments({ flagged: true, moderation: 'pending' })}`,
  ].join('\n'))
})

// ---------------- Settings ----------------
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await PlatformSetting.findOne({ key: 'platform' })
  if (!settings) {
    settings = await PlatformSetting.create({ key: 'platform' })
  }
  res.json({ success: true, data: settings })
})

export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await PlatformSetting.findOne({ key: 'platform' })
  if (!settings) settings = new PlatformSetting({ key: 'platform' })

  const { platformName, supportEmail, salesTaxNote, flags } = req.body
  if (platformName !== undefined) settings.platformName = platformName
  if (supportEmail !== undefined) settings.supportEmail = supportEmail
  if (salesTaxNote !== undefined) settings.salesTaxNote = salesTaxNote
  if (flags) settings.flags = { ...settings.flags, ...flags }

  await settings.save()
  await logAudit(req.user, 'SETTINGS_UPDATED', { settings: settings.toObject() })

  res.json({ success: true, data: settings })
})
