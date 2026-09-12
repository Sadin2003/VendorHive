import mongoose from 'mongoose'

const crossPromotionSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    businessA: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    businessB: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    offer: { type: String, required: true },
    value: { type: String, default: '' },
    terms: { type: [String], default: [] },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    status: { type: String, enum: ['awaiting', 'accepted', 'declined'], default: 'awaiting' },
    views: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.model('CrossPromotion', crossPromotionSchema)