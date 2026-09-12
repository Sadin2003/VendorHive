import mongoose from 'mongoose'

const contactMessageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    topic: { type: String, trim: true, default: 'General' },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'read'], default: 'new' },
  },
  { timestamps: true }
)

export default mongoose.model('ContactMessage', contactMessageSchema)