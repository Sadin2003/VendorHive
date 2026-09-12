import { Router } from 'express'
import { protect, requireRole } from '../middlewares/auth.js'
import {
  getDashboard,
  getAnalytics,
  getVerificationQueue,
  approveMerchant,
  rejectMerchant,
  getMerchants,
  setMerchantStatus,
  getUsers,
  setUserStatus,
  getReviewQueue,
  keepReview,
  removeReview,
  escalateReview,
  setReviewRisk,
  getMessages,
  markMessageRead,
  deleteMessage,
  getSettings,
  updateSettings,
} from '../controllers/adminController.js'

const router = Router()

router.use(protect, requireRole('admin'))

router.get('/dashboard', getDashboard)
router.get('/analytics', getAnalytics)

router.get('/merchants/verification', getVerificationQueue)
router.put('/merchants/:id/approve', approveMerchant)
router.put('/merchants/:id/reject', rejectMerchant)
router.get('/merchants', getMerchants)
router.put('/merchants/:id/status', setMerchantStatus)

router.get('/users', getUsers)
router.put('/users/:id/status', setUserStatus)

router.get('/reviews', getReviewQueue)
router.put('/reviews/:id/keep', keepReview)
router.put('/reviews/:id/remove', removeReview)
router.put('/reviews/:id/escalate', escalateReview)
router.put('/reviews/:id/risk', setReviewRisk)

router.get('/messages', getMessages)
router.put('/messages/:id/read', markMessageRead)
router.delete('/messages/:id', deleteMessage)

router.get('/settings', getSettings)
router.put('/settings', updateSettings)

export default router