import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    text: { type: String, trim: true, default: '' },
    reply: { type: String, default: null },
    helpful: { type: Number, default: 0 },
    unhelpful: { type: Number, default: 0 },
    flagged: { type: Boolean, default: false },
    flagReason: { type: String },
    risk: { type: String, enum: ['low', 'med', 'high'], default: 'med' },
    moderation: {
      type: String,
      enum: ['pending', 'kept', 'escalated', 'removed'],
      default: 'pending',
    },
  },
  { timestamps: true }
)

reviewSchema.index({ business: 1, createdAt: -1 })

export default mongoose.model('Review', reviewSchema)