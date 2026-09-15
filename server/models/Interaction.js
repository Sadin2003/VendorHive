import mongoose from 'mongoose'

const interactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['view_deal', 'view_business', 'save_deal', 'follow_business'],
      required: true,
    },
    deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    category: { type: String },
  },
  { timestamps: true }
)

interactionSchema.index({ user: 1, createdAt: -1 })

export default mongoose.model('Interaction', interactionSchema)