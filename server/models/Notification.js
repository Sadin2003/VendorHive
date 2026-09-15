import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['deal', 'promotion', 'review', 'system'], required: true },
    text: { type: String, required: true }, // HTML string rendered by the UI
    icon: { type: String },
    unread: { type: Boolean, default: true },
  },
  { timestamps: true }
)

notificationSchema.index({ user: 1, createdAt: -1 })
notificationSchema.index({ user: 1, unread: 1 })

export default mongoose.model('Notification', notificationSchema)