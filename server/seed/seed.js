import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import Review from '../models/Review.js'
import PlatformSetting from '../models/PlatformSetting.js'

const ADMIN_EMAIL = 'admin@vendorhive.app'
const ADMIN_PASSWORD = 'admin1234'

const approval = await bcrypt.hash(ADMIN_PASSWORD, 10)

const clear = async () => {
  await Promise.all([
    User.deleteMany({}),
    Review.deleteMany({}),
    PlatformSetting.deleteMany({}),
  ])
}

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected. Clearing existing data...')
  await clear()

  // ---- Admin ----
  const admin = await User.create({
    name: 'Dara Osei',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
    status: 'active',
  })
  console.log(`Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)

  // ---- Merchants (verified, live) ----
  const merchants = [
    { businessName: 'Bean & Leaf', owner: 'Maya Chen', category: 'Cafés', address: '11 Market Row', name: 'Maya Chen', verified: true, status: 'live', rating: 4.8, dealsCount: 6 },
    { businessName: 'Ember & Oak Grill', owner: 'Theo Grant', category: 'Restaurants', address: '44 Firelight Ave', name: 'Theo Grant', verified: true, status: 'live', rating: 4.6, reports: 1, dealsCount: 5 },
    { businessName: 'Sunflower Bakehouse', owner: 'Elena Petrova', category: 'Bakeries', address: '7 Petal Lane', name: 'Elena Petrova', verified: true, status: 'live', rating: 4.9, dealsCount: 4 },
    { businessName: 'Petal & Stem', owner: 'Grace Liu', category: 'Gifts & Local', address: '22 Bloom St', name: 'Grace Liu', verified: true, status: 'reviewed', rating: 4.7, reports: 2, dealsCount: 3 },
    { businessName: 'Page & Plume Books', owner: 'Sam Okafor', category: 'Gifts & Local', address: '9 Cover Ct', name: 'Sam Okafor', verified: true, status: 'live', rating: 4.5, dealsCount: 7 },
  ]

  const merchantDocs = await Promise.all(
    merchants.map((m) =>
      User.create({ ...m, email: `${m.owner.split(' ')[0].toLowerCase()}@${m.businessName.split(' ')[0].toLowerCase()}.co`, password: approval, role: 'merchant', phone: '(555) 010-0000' })
    )
  )

  // ---- Pending merchant applications (verification queue) ----
  const pending = [
    { businessName: 'Coal & Clay Ceramics', owner: 'Ravi Shah', category: 'Gifts & Local', address: '19 Kiln Lane', description: 'Studio pottery with a storefront.', docs: 100 },
    { businessName: 'The Hearth Pantry', owner: 'Lena Ortiz', category: 'Bakeries', address: '2 Oven Street', description: 'Bakery/deli, seasonal menu.', docs: 92 },
    { businessName: 'Redline Bicycles', owner: 'Jon Mercer', category: 'Services', address: '31 Spoke Road', description: 'Repairs + rentals.', docs: 100 },
  ]
  const pendingDocs = await Promise.all(
    pending.map((p, i) =>
      User.create({
        ...p,
        name: p.owner,
        email: `p${i}@pending.local`,
        password: approval,
        role: 'merchant',
        status: 'pending',
        phone: '(555) 020-0000',
        createdAt: new Date(Date.now() - (i === 1 ? 74 : i === 0 ? 28 : 11) * 3600 * 1000),
      })
    )
  )

  // ---- Customers ----
  const customers = [
    { name: 'Aisha Khan', email: 'aisha@example.com', role: 'customer', status: 'active', dealsCount: 22 },
    { name: 'Marcus Taylor', email: 'marcus@example.com', role: 'customer', status: 'active', dealsCount: 9 },
    { name: 'Priya Nair', email: 'priya@example.com', role: 'customer', status: 'suspended', dealsCount: 4 },
    { name: 'Tomás Rivera', email: 'tomas@example.com', role: 'customer', status: 'active', dealsCount: 2 },
    { name: 'J. Rivera', email: 'jrivera@example.com', role: 'customer', status: 'active' },
  ]
  await Promise.all(
    customers.map((c, i) =>
      User.create({ ...c, password: approval, createdAt: new Date(Date.now() - (i + 1) * 30 * 24 * 3600 * 1000) })
    )
  )

  const ana = await User.findOne({ email: 'jrivera@example.com' })

  // ---- Flagged reviews ----
  const flagged = [
    { author: ana, business: merchantDocs[1], rating: 1, text: 'Worst place in town, and the owner is hostile to customers.', flagReason: 'Hate speech', risk: 'high', flagged: true, moderation: 'pending', dateAgo: 2 },
    { author: ana, business: merchantDocs[3], rating: 5, text: 'Absolutely divine arrangements. 10/10 would recommend.', flagReason: 'Suspected self-review', risk: 'med', flagged: true, moderation: 'pending', dateAgo: 24 },
  ]
  await Promise.all(
    flagged.map((f, i) =>
      Review.create({
        author: f.author._id,
        business: f.business._id,
        rating: f.rating,
        text: f.text,
        flagReason: f.flagReason,
        risk: f.risk,
        flagged: true,
        moderation: f.moderation,
        createdAt: new Date(Date.now() - f.dateAgo * 3600 * 1000),
      })
    )
  )

  await PlatformSetting.create({ key: 'platform' })

  console.log('Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
