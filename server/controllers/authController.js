import User from '../models/User.js'
import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import asyncHandler from '../middlewares/asyncHandler.js'
import { AppError } from '../middlewares/error.js'
import { signToken, setTokenCookie, clearTokenCookie, sanitizeUser } from '../utils/token.js'
import { createNotification } from '../utils/notify.js'

// @desc    Register a customer or merchant
// @route   POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { role = 'customer', name, email, password, phone, businessName, owner, category, address } = req.body

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) throw new AppError('An account with this email already exists', 409)

  let user
  if (role === 'merchant') {
    user = await User.create({
      name: owner || name,
      owner: owner || name,
      businessName,
      category,
      address,
      phone,
      email,
      password,
      role: 'merchant',
      status: 'pending',
      verified: false,
    })
    await createNotification(user._id, 'system', `Your application for <b>${businessName}</b> is pending review.`, 'i-bell')
  } else {
    user = await User.create({ name, email, password, phone, role: 'customer', status: 'active' })
    await createNotification(user._id, 'system', 'Welcome to VendorHive! Save deals and follow shops to get alerts.', 'i-bell')
  }

  const token = signToken(user._id)
  setTokenCookie(res, token)

  res.status(201).json({ success: true, user: sanitizeUser(user) })
})

// @desc    Login
// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401)
  }

  if (user.status === 'pending') {
    throw new AppError('Your merchant application is still under review. Please wait for approval.', 403)
  }
  if (user.status === 'rejected') {
    throw new AppError('Your merchant application was rejected. Contact support for details.', 403)
  }
  if (user.status === 'suspended') {
    throw new AppError('This account has been suspended.', 403)
  }

  const token = signToken(user._id)
  setTokenCookie(res, token)

  res.json({ success: true, user: sanitizeUser(user) })
})

// @desc    Logout
// @route   POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res)
  res.json({ success: true, message: 'Logged out' })
})

// @desc    Get current user
// @route   GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) })
})

// @desc    Forgot password — generates a short-lived reset token and logs a
//          copyable reset link to the server console (no email provider is
//          configured for this university project).
// @route   POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email: email.toLowerCase() })
  if (user) {
    const rawToken = randomBytes(32).toString('hex')
    const hashed = await bcrypt.hash(rawToken, 10)
    user.resetPasswordToken = hashed
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await user.save()
    const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}`
    console.log('\n=============================================')
    console.log(`[forgot-password] Password reset link for ${email}:`)
    console.log(link)
    console.log('=============================================\n')
  }
  res.json({ success: true, message: 'If that account exists, a reset link has been sent.' })
})

// @desc    Reset password using a valid reset token
// @route   POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body
  if (!token) throw new AppError('A reset token is required', 400)

  // Tokens are stored bcrypt-hashed, so we scan the short-listed unexpired,
  // unconsumed tokens and bcrypt-compare against each until we find the owner.
  const candidates = await User.find({
    resetPasswordToken: { $ne: null, $exists: true },
    resetPasswordExpiry: { $gt: new Date() },
  })

  let user = null
  for (const candidate of candidates) {
    if (await bcrypt.compare(token, candidate.resetPasswordToken)) {
      user = candidate
      break
    }
  }

  if (!user) throw new AppError('This reset link is invalid or has expired. Please request a new one.', 400)

  user.password = password
  user.resetPasswordToken = undefined
  user.resetPasswordExpiry = undefined
  await user.save()

  await createNotification(user._id, 'system', 'Your password was changed. If this was not you, contact support.', 'i-bell')

  res.json({ success: true, message: 'Password updated. You can now log in with your new password.' })
})