import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import asyncHandler from './asyncHandler.js'
import { AppError } from './error.js'

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token
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
