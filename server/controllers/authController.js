import User from '../models/User.js'
import asyncHandler from '../middlewares/asyncHandler.js'
import { AppError } from '../middlewares/error.js'
import { signToken, setTokenCookie, sanitizeUser } from '../utils/token.js'

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { role = 'customer', name, email, password, phone, businessName, owner, category, address } = req.body

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) throw new AppError('An account with this email already exists', 409)

  let userData
  if (role === 'merchant') {
    userData = {
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
    }
  } else {
    userData = { name, email, password, phone, role: 'customer', status: 'active' }
  }

  const user = await User.create(userData)

  const token = signToken(user._id)
  setTokenCookie(res, token)

  res.status(201).json({ success: true, user: sanitizeUser(user) })
})

// @desc    Login a user
// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401)
  }
  if (user.status === 'suspended') {
    throw new AppError('This account has been suspended', 403)
  }

  const token = signToken(user._id)
  setTokenCookie(res, token)

  res.json({ success: true, user: sanitizeUser(user) })
})

// @desc    Logout
// @route   POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) })
  res.json({ success: true, message: 'Logged out' })
})

// @desc    Get current user
// @route   GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) })
})
