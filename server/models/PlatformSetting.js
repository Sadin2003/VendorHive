import mongoose from 'mongoose'

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'platform' },
    platformName: { type: String, default: 'VendorHive' },
    supportEmail: { type: String, default: 'support@vendorhive.co' },
    salesTaxNote: { type: String, default: '' },
    flags: {
      openApp: { type: Boolean, default: true },
      idCheck: { type: Boolean, default: true },
      crossPromos: { type: Boolean, default: true },
      autoVerify: { type: Boolean, default: false },
      newsletter: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
)

export default mongoose.model('PlatformSetting', settingSchema)
