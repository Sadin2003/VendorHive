import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'merchant', 'admin'], default: 'customer' },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended', 'rejected', 'delisted', 'live', 'reviewed'],
      default: 'active',
    },
    phone: { type: String },
    bio: { type: String },

    // Merchant-specific fields
    businessName: { type: String, trim: true },
    owner: { type: String, trim: true },
    category: { type: String },
    address: { type: String },
    description: { type: String },
    verified: { type: Boolean, default: false },
    docs: { type: Number, default: 0 },
    rejectionReason: { type: String },

    // Aggregates
    rating: { type: Number, default: null },
    reports: { type: Number, default: 0 },
    dealsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password)
}

export default mongoose.model('User', userSchema)
