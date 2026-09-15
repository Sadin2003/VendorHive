import mongoose from 'mongoose'

const followSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

followSchema.index({ user: 1, business: 1 }, { unique: true })

export default mongoose.model('Follow', followSchema)