import { Router } from 'express'
import { body } from 'express-validator'
import {
  getStats,
  getVerification,
  approveVerification,
  rejectVerification,
  getUsers,
  toggleUserStatus,
  getBusinesses,
  toggleBusinessStatus,
  getReviews,
  reviewAction,
  getAnalytics,
  exportAnalytics,
  getSettings,
  updateSettings,
} from '../controllers/adminController.js'
import { protect, requireRole } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'

const router = Router()

router.use(protect, requireRole('admin'))

router.get('/stats', getStats)

router.get('/verification', getVerification)
router.post('/verification/approve/:id', approveVerification)
router.post('/verification/reject/:id', [body('reason').notEmpty().withMessage('A rejection reason is required')], validate, rejectVerification)

router.get('/users', getUsers)
router.patch('/users/:id/status', toggleUserStatus)

router.get('/businesses', getBusinesses)
router.patch('/businesses/:id/status', toggleBusinessStatus)

router.get('/reviews', getReviews)
router.post('/reviews/:id/action', [body('action').isIn(['remove', 'restore', 'escalate']).withMessage('Invalid action')], validate, reviewAction)

router.get('/analytics', getAnalytics)
router.get('/analytics/export', exportAnalytics)

router.get('/settings', getSettings)
router.patch('/settings', updateSettings)

export default router
