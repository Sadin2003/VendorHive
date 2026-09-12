import { Router } from 'express'
import { body } from 'express-validator'
import { register, login, logout, me, forgotPassword, resetPassword } from '../controllers/authController.js'
import { protect } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import { authLimiter } from '../middlewares/rateLimit.js'

const router = Router()

router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['customer', 'merchant']).withMessage('Invalid role'),
  ],
  validate,
  register
)

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
)

router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().withMessage('Please enter a valid email')],
  validate,
  forgotPassword
)

router.post(
  '/reset-password',
  authLimiter,
  [
    body('token').notEmpty().withMessage('A reset token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  resetPassword
)

router.post('/logout', logout)
router.get('/me', protect, me)

export default router