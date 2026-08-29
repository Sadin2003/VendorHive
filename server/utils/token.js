import jwt from 'jsonwebtoken'

export function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

export function setTokenCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

export function sanitizeUser(user) {
  return {
    id: user._id,
    role: user.role,
    status: user.status,
    name: user.role === 'merchant' ? user.businessName || user.owner || user.name : user.name,
    email: user.email,
  }
}
