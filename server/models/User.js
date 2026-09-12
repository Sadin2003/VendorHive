import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const hoursSchema = new mongoose.Schema(
  {
    Mon: { type: String, default: '' },
    Tue: { type: String, default: '' },
    Wed: { type: String, default: '' },
    Thu: { type: String, default: '' },
    Fri: { type: String, default: '' },
    Sat: { type: String, default: '' },
    Sun: { type: String, default: '' },
  },
  { _id: false }
)

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'merchant', 'admin'], default: 'customer' },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended', 'rejected', 'live', 'delisted'],
      default: 'active',
    },
    phone: { type: String },
    bio: { type: String },
    zip: { type: String, trim: true },

    // Customer preference flags
    prefs: {
      type: {
        newsletter: { type: Boolean, default: true },
        dealAlerts: { type: Boolean, default: true },
        reviewAlerts: { type: Boolean, default: true },
        promoAlerts: { type: Boolean, default: false },
        activityDigest: { type: Boolean, default: false },
      },
      default: {},
    },

    // Password reset
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },

    // Merchant-only fields
    businessName: { type: String, trim: true },
    owner: { type: String, trim: true },
    category: { type: String },
    tagline: { type: String },
    address: { type: String },
    about: { type: String },
    verified: { type: Boolean, default: false },
    docs: { type: Number, default: 0 },
    rejectionReason: { type: String },
    hours: { type: hoursSchema, default: {} },
    tags: { type: [String], default: [] },
    gallery: { type: [String], default: [] },
    emoji: { type: String, default: '🏪' },
    cover: { type: String },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },

    // Aggregates
    rating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    reports: { type: Number, default: 0 },
    dealsCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

userSchema.index({ location: '2dsphere' })

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