import { Router } from 'express'
import { body } from 'express-validator'
import { protect, requireRole } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import { uploadCover, uploadGallery } from '../middlewares/upload.js'
import {
  getMerchantDashboard,
  getMerchantProfile,
  updateMerchantProfile,
  updateCover,
  updateGallery,
  getMerchantDeals,
  getMerchantDealById,
  createDeal,
  updateDeal,
  deleteDeal,
  getMerchantReviews,
  flagReview,
  replyToReview,
  getMerchantPromotions,
  getMerchantPartners,
  createPromotion,
  acceptPromotion,
  declinePromotion,
  deletePromotion,
} from '../controllers/merchantController.js'

const router = Router()

// All merchant routes require a merchant account.
router.use(protect, requireRole('merchant'))

// Dashboard + profile
router.get('/dashboard', getMerchantDashboard)
router.get('/profile', getMerchantProfile)
router.put(
  '/profile',
  [
    body('businessName').optional().trim().isLength({ min: 1, max: 80 }),
    body('category').optional().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('address').optional().trim().isLength({ max: 160 }),
    body('about').optional().trim().isLength({ max: 1500 }),
  ],
  validate,
  updateMerchantProfile,
)
router.post('/cover', uploadCover, updateCover)
router.post('/gallery', uploadGallery, updateGallery)

// Deals
router.get('/deals', getMerchantDeals)
router.get('/deals/:id', getMerchantDealById)
router.post(
  '/deals',
  [
    body('title').trim().isLength({ min: 3, max: 100 }),
    body('type').isIn(['percent', 'amount', 'bogo', 'bundle']),
    body('value').optional().trim().isLength({ max: 60 }),
    body('desc').optional().trim().isLength({ max: 1500 }),
  ],
  validate,
  createDeal,
)
router.put('/deals/:id', validate, updateDeal)
router.delete('/deals/:id', deleteDeal)

// Reviews received by this merchant
router.get('/reviews', getMerchantReviews)
router.put(
  '/reviews/:id/flag',
  [body('reason').optional().trim().isLength({ max: 240 })],
  validate,
  flagReview,
)
router.put(
  '/reviews/:id/reply',
  [body('text').trim().isLength({ min: 1, max: 500 })],
  validate,
  replyToReview,
)

// Cross-promotions
router.get('/promotions', getMerchantPromotions)
router.get('/partners', getMerchantPartners)
router.post(
  '/promotions',
  [
    body('partnerId').isMongoId().withMessage('Invalid partner id'),
    body('offer').trim().isLength({ min: 3, max: 160 }),
    body('start').notEmpty().withMessage('Start date required'),
    body('end').notEmpty().withMessage('End date required'),
  ],
  validate,
  createPromotion,
)
router.put('/promotions/:id/accept', acceptPromotion)
router.put('/promotions/:id/decline', declinePromotion)
router.delete('/promotions/:id', deletePromotion)

export default router