import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import asyncHandler from './asyncHandler.js'
import { AppError } from './error.js'

export const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token
  const header = req.headers?.authorization
  if (!token && header?.startsWith('Bearer ')) token = header.slice(7)

  if (!token) throw new AppError('Not authorized, no token', 401)

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    throw new AppError('Not authorized, token invalid', 401)
  }

  const user = await User.findById(decoded.id)
  if (!user) throw new AppError('Not authorized, user not found', 401)

  req.user = user
  next()
})

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError(`Access denied for role: ${req.user?.role}`, 403))
  }
  next()
}

// Attach req.user if a valid token exists, but never fail the request.
// Used on public endpoints that get richer when a user is present
// (e.g. "following" flags on businesses, personalized deal feeds).
export const optionalAuth = async (req, res, next) => {
  let token = req.cookies?.token
  const header = req.headers?.authorization
  if (!token && header?.startsWith('Bearer ')) token = header.slice(7)
  if (!token) return next()

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (user && user.status !== 'suspended') req.user = user
  } catch {
    // Ignore invalid tokens on optional routes
  }
  next()
}