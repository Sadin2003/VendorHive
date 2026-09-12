import Notification from '../models/Notification.js'
import Follow from '../models/Follow.js'

// Write a single notification row for one user.
export const createNotification = async (userId, type, text, icon) => {
  try {
    await Notification.create({ user: userId, type, text, icon })
  } catch (err) {
    console.error('Notification write failed:', err.message)
  }
}

// Alert every customer who follows a business.
export const notifyFollowers = async (businessId, type, text, icon) => {
  try {
    const follows = await Follow.find({ business: businessId }).select('user')
    if (!follows.length) return
    await Notification.insertMany(
      follows.map((f) => ({ user: f.user, type, text, icon }))
    )
  } catch (err) {
    console.error('Follower notification failed:', err.message)
  }
}