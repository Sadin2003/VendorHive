import { Router } from 'express'
import { body } from 'express-validator'
import {
  getCategories,
  getBusinesses,
  getBusinessById,
  getDeals,
  getDealById,
  getRelatedDeals,
  submitContact,
} from '../controllers/publicController.js'
import { optionalAuth } from '../middlewares/auth.js'
import { contactLimiter } from '../middlewares/rateLimit.js'
import { validate } from '../middlewares/validate.js'

const router = Router()

// Public: no auth required, but these get richer when a user is logged in.
router.get('/categories', getCategories)
router.get('/businesses', getBusinesses)
router.get('/businesses/:id', optionalAuth, getBusinessById)
router.get('/deals', getDeals)
router.get('/deals/:id', optionalAuth, getDealById)
router.get('/deals/:id/related', getRelatedDeals)

// Contact form: heavy rate limiting prevents spam. optionalAuth captures the
// sender id when a logged-in member uses the form.
router.post(
  '/contact',
  optionalAuth,
  contactLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
    body('email').trim().isEmail().withMessage('Valid email is required').isLength({ max: 120 }),
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }),
  ],
  validate,
  submitContact,
)

export default router