import { Router } from 'express'
import { body } from 'express-validator'
import { protect } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getDashboard,
  getSavedDeals,
  saveDeal,
  unsaveDeal,
  getFollowing,
  followBusiness,
  unfollowBusiness,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleHelpful,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  dismissNotification,
} from '../controllers/customerController.js'

const router = Router()

// All customer routes require a logged-in user.
router.use(protect)

router.get('/', getProfile)
router.put(
  '/',
  [
    body('name').optional().trim().isLength({ min: 1, max: 80 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().trim().isLength({ max: 30 }),
  ],
  validate,
  updateProfile,
)
router.put(
  '/password',
  [body('current').notEmpty().withMessage('Current password required'), body('next').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')],
  validate,
  changePassword,
)
router.delete('/', deleteAccount)

router.get('/dashboard', getDashboard)

router.get('/deals', getSavedDeals)
router.put('/deals/:id', saveDeal)
router.delete('/deals/:id', unsaveDeal)

router.get('/following', getFollowing)
router.put('/following/:businessId', followBusiness)
router.delete('/following/:businessId', unfollowBusiness)

router.get('/reviews', getMyReviews)
router.post(
  '/reviews',
  [body('businessId').isMongoId().withMessage('Invalid business id'), body('rating').isInt({ min: 1, max: 5 }), body('text').trim().isLength({ min: 3 })],
  validate,
  createReview,
)
router.put(
  '/reviews/:id',
  [body('rating').isInt({ min: 1, max: 5 }), body('text').trim().isLength({ min: 3 })],
  validate,
  updateReview,
)
router.delete('/reviews/:id', deleteReview)
router.post(
  '/reviews/:id/helpful',
  [body('value').optional().isIn([1, -1]).withMessage('Vote value must be 1 or -1')],
  validate,
  toggleHelpful,
)

router.get('/notifications', getNotifications)
router.put('/notifications/read', markAllNotificationsRead)
router.put('/notifications/:id/read', markNotificationRead)
router.delete('/notifications/:id', dismissNotification)

export default router