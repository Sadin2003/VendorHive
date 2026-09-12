import mongoose from 'mongoose'

const dealSchema = new mongoose.Schema(
  {
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['percent', 'amount', 'bogo', 'bundle'], default: 'percent' },
    value: { type: String, default: '' },
    desc: { type: String },
    terms: { type: [String], default: [] },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    published: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    coverKey: { type: String },
    businesses: [
      {
        business: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['Host', 'Partner A', 'Partner B'] },
      },
    ],
  },
  { timestamps: true }
)

dealSchema.index({ merchant: 1, published: 1 })
dealSchema.index({ end: 1 })

export default mongoose.model('Deal', dealSchema)