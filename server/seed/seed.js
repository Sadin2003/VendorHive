import 'dotenv/config'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Deal from '../models/Deal.js'
import Review from '../models/Review.js'
import Follow from '../models/Follow.js'
import SavedDeal from '../models/SavedDeal.js'
import Interaction from '../models/Interaction.js'
import Notification from '../models/Notification.js'
import CrossPromotion from '../models/CrossPromotion.js'
import ContactMessage from '../models/ContactMessage.js'
import PlatformSetting from '../models/PlatformSetting.js'
import HelpfulVote from '../models/HelpfulVote.js'
import AuditLog from '../models/AuditLog.js'

const d = (days) => new Date(Date.now() + days * 24 * 3600 * 1000)

const hours = { Mon: '8:00 AM – 6:00 PM', Tue: '8:00 AM – 6:00 PM', Wed: '8:00 AM – 6:00 PM', Thu: '8:00 AM – 8:00 PM', Fri: '8:00 AM – 8:00 PM', Sat: '9:00 AM – 6:00 PM', Sun: 'Closed' }
const gallery = (n) => Array.from({ length: 3 }, (_, i) => `https://picsum.photos/seed/vh${n}${i}/600/400`)

const clear = () =>
  Promise.all([
    User.deleteMany({}),
    Deal.deleteMany({}),
    Review.deleteMany({}),
    Follow.deleteMany({}),
    SavedDeal.deleteMany({}),
    Interaction.deleteMany({}),
    Notification.deleteMany({}),
    CrossPromotion.deleteMany({}),
    ContactMessage.deleteMany({}),
    PlatformSetting.deleteMany({}),
    HelpfulVote.deleteMany({}),
    AuditLog.deleteMany({}),
  ])

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected. Clearing existing data...')
  await clear()

  // ---------------- Admin ----------------
  await User.create({
    name: 'Dara Osei',
    email: 'admin@vendorhive.app',
    password: 'admin1234',
    role: 'admin',
    status: 'active',
  })
  console.log(`Admin: admin@vendorhive.app / admin1234`)

  // ---------------- Merchants ----------------
  const merch = [
    {
      businessName: 'Bean & Leaf', owner: 'Maya Chen', category: 'Cafés', emoji: '☕',
      tagline: 'Neighborhood coffee, roasted in-house.', address: '11 Market Row',
      about: 'Small-batch roastery and café serving single-origin espresso, pour-overs, and a rotating pastry case.',
      tags: ['Coffee', 'Brunch', 'Desserts'], phone: '(555) 010-1001',
      email: 'maya@beanandleaf.co', location: [-118.265, 34.061], rating: 4.8, ratingsCount: 214, followersCount: 342,
    },
    {
      businessName: 'Ember & Oak Grill', owner: 'Theo Grant', category: 'Restaurants', emoji: '🔥',
      tagline: 'Wood-fired plates, seasonal menus.', address: '44 Firelight Ave',
      about: 'Wood-fired grill focused on seasonal, locally sourced produce and dry-aged beef.',
      tags: ['Dinner', 'Steaks', 'Craft Beer'], phone: '(555) 010-1002',
      email: 'theo@emberandoak.co', location: [-118.2405, 34.047], rating: 4.6, ratingsCount: 187, followersCount: 268, reports: 1,
    },
    {
      businessName: 'Sunflower Bakehouse', owner: 'Elena Petrova', category: 'Bakeries', emoji: '🥐',
      tagline: 'Sourdough everything, baked at dawn.', address: '7 Petal Lane',
      about: 'Artisan bakery famous for levain loaves, laminated pastries, and weekend focaccia drops.',
      tags: ['Sourdough', 'Pastries', 'Catering'], phone: '(555) 010-1003',
      email: 'elena@sunflowerbake.co', location: [-118.255, 34.058], rating: 4.9, ratingsCount: 156, followersCount: 401,
    },
    {
      businessName: 'Stitch & Button', owner: 'Noah Bell', category: 'Clothing', emoji: '🧵',
      tagline: 'Tailored essentials from local mills.', address: '18 Loom Street',
      about: 'Sustainably made wardrobe staples, tailored on-site with a make-it-last guarantee.',
      tags: ['Tailoring', 'Local Mills', 'Eco'], phone: '(555) 010-1004',
      email: 'noah@stitchbutton.com', location: [-118.248, 34.063], rating: 4.5, ratingsCount: 92, followersCount: 150,
    },
    {
      businessName: 'Volt & Vine', owner: 'Amara Singh', category: 'Electronics', emoji: '🔌',
      tagline: 'Repair, recycle, and renewed devices.', address: '29 Circuit Ct',
      about: 'Electronics repair and certified-refurbished laptops and phones with a two-year warranty.',
      tags: ['Repairs', 'Refurbished', 'Warranty'], phone: '(555) 010-1005',
      email: 'amara@voltvine.net', location: [-118.232, 34.07], rating: 4.4, ratingsCount: 78, followersCount: 96,
    },
    {
      businessName: 'The Copper Studio', owner: 'Iris Wolfe', category: 'Services', emoji: '✂️',
      tagline: 'Design studio & community workshops.', address: '27 Foundry Ave',
      about: 'Creative studio offering design services, printing, and skill-share workshops every Thursday.',
      tags: ['Design', 'Workshops', 'Printing'], phone: '(555) 010-1006',
      email: 'iris@copperstudio.co', location: [-118.258, 34.0495], rating: 4.7, ratingsCount: 64, followersCount: 121,
    },
    {
      businessName: 'Rose & Ivy Spa', owner: 'Yuki Tanaka', category: 'Health & Beauty', emoji: '🌿',
      tagline: 'Plant-based facials and massage.', address: '12 Blossom Blvd',
      about: 'Calm, plant-based skincare studio with facial treatments and Swedish massage.',
      tags: ['Facials', 'Massage', 'Skincare'], phone: '(555) 010-1007',
      email: 'yuki@roseivy.co', location: [-118.268, 34.0545], rating: 4.9, ratingsCount: 140, followersCount: 287,
    },
    {
      businessName: 'Petal & Stem', owner: 'Grace Liu', category: 'Gifts & Local', emoji: '💐',
      tagline: 'Flowers, gifts, and tiny treasures.', address: '22 Bloom St',
      about: 'Floral studio and curated gift shop stocking local makers, cards, and candles.',
      tags: ['Flowers', 'Gifts', 'Local Makers'], phone: '(555) 010-1008',
      email: 'grace@petalandstem.co', location: [-118.245, 34.0445], rating: 4.7, ratingsCount: 118, followersCount: 233, reports: 2,
    },
  ]

  const merchants = []
  for (const m of merch) {
    const user = await User.create({
      name: m.owner, owner: m.owner, businessName: m.businessName, email: m.email, password: 'password123',
      role: 'merchant', status: 'live', verified: true, phone: m.phone, category: m.category, emoji: m.emoji,
      tagline: m.tagline, address: m.address, about: m.about, tags: m.tags, hours,
      gallery: gallery(m.businessName.replace(/\W/g, '')), cover: `https://picsum.photos/seed/cover${m.businessName.replace(/\W/g, '')}/800/400`,
      location: { type: 'Point', coordinates: m.location },
      rating: m.rating, ratingsCount: m.ratingsCount, followersCount: m.followersCount,
      reports: m.reports || 0, dealsCount: 3,
    })
    merchants.push(user)
  }

  // ---------------- Pending merchant applications ----------------
  const pending = [
    { businessName: 'Coal & Clay Ceramics', owner: 'Ravi Shah', category: 'Gifts & Local', address: '19 Kiln Lane', description: 'Studio pottery with a storefront.', docs: 100, email: 'ravi@coalclay.co' },
    { businessName: 'The Hearth Pantry', owner: 'Lena Ortiz', category: 'Bakeries', address: '2 Oven Street', description: 'Bakery/deli, seasonal menu.', docs: 92, email: 'lena@hearthpantry.co' },
    { businessName: 'Redline Bicycles', owner: 'Jon Mercer', category: 'Services', address: '31 Spoke Road', description: 'Repairs + rentals.', docs: 100, email: 'jon@redlinebikes.co' },
  ]
  await Promise.all(
    pending.map((p, i) =>
      User.create({
        ...p, name: p.owner, password: 'password123', role: 'merchant', status: 'pending',
        phone: '(555) 020-0000', createdAt: new Date(Date.now() - (i === 1 ? 74 : i === 0 ? 28 : 11) * 3600 * 1000),
      })
    )
  )

  // ---------------- Customers ----------------
  const customers = await Promise.all(
    [
      { name: 'Aisha Khan', email: 'aisha@example.com', status: 'active' },
      { name: 'Marcus Taylor', email: 'marcus@example.com', status: 'active' },
      { name: 'Priya Nair', email: 'priya@example.com', status: 'suspended' },
      { name: 'Tomás Rivera', email: 'tomas@example.com', status: 'active' },
      { name: 'J. Rivera', email: 'jrivera@example.com', status: 'active' },
      { name: 'Zoe Tan', email: 'zoe@example.com', status: 'active' },
      { name: 'Omar Haddad', email: 'omar@example.com', status: 'active' },
    ].map((c, i) =>
      User.create({ ...c, password: 'password123', role: 'customer', createdAt: new Date(Date.now() - (i + 1) * 25 * 24 * 3600 * 1000) })
    )
  )
  const [aisha, marcus, priya, tomas, jriv, zoe, omar] = customers

  // ---------------- Deals ----------------
  const dealDefs = [
    // [merchant, title, type, value, startOffset, endOffset, published, views, saves, desc, terms]
    [merchants[0], 'Two coffees for $8', 'amount', '$8 duo', -6, 12, true, 320, 41, 'Any two espresso drinks after 2 PM.', ['Voucher valid 2PM–close.', 'Single redemption per customer.']],
    [merchants[0], '15% off pastry box', 'percent', '15% OFF', -2, 20, true, 180, 23, 'Fifteen percent off any pastry box pre-ordered by 9 AM.', ['Pre-order required.', 'Excludes custom cakes.']],
    [merchants[0], 'Sourdough starter class', 'bogo', 'BOGO', 4, 25, true, 65, 9, 'Buy one workshop seat, bring a friend free.', ['Class capped at 12.', 'No refunds within 48h.']],
    [merchants[1], 'Wednesday steaks night', 'percent', '20% OFF', -4, 14, true, 540, 88, '20% off all steaks every Wednesday.', ['Dine-in only.', 'Not valid with other offers.']],
    [merchants[1], '$15 date-night duo', 'amount', '$15 OFF', 2, 30, true, 210, 34, 'Two mains and a shared side for a flat deal.', ['Weekend evenings only.']],
    [merchants[2], 'Free pastry with loaf', 'bogo', 'FREE', -8, 9, true, 410, 73, 'Buy any sourdough loaf, get one pastry free.', ['One per customer.']],
    [merchants[2], 'Bake-at-home kit', 'percent', '10% OFF', -1, 21, true, 95, 15, '10% off bake-at-home focaccia kits.', ['While supplies last.']],
    [merchants[3], 'Summer tailoring deal', 'percent', '25% OFF', -10, 6, true, 310, 47, 'Quarter off any two-garment alteration.', ['Appointment required.']],
    [merchants[4], 'Repair day special', 'percent', '20% OFF', -3, 8, true, 265, 31, '20% off any repair booked this week.', ['No water-damage repairs.']],
    [merchants[5], 'Workshop bundle', 'amount', '$10 OFF', -5, 18, true, 140, 22, 'Ten off any four-part workshop series.', ['Membership not required.']],
    [merchants[6], 'First facial trial', 'bogo', 'TRIAL', -12, 3, true, 500, 120, 'First-timer press facial at the trial rate.', ['New clients only.']],
    [merchants[6], 'Massage refresh', 'percent', '15% OFF', 5, 40, true, 88, 17, '15% off a 60-minute Swedish massage booked before noon.', ['Noon weekday bookings only.']],
    [merchants[7], 'Local makers bundle', 'bundle', 'BUNDLE', -2, 16, true, 230, 55, 'Flowers + candle + card, assembled as a gift bundle.', ['Assembly day is Friday.']],
    [merchants[7], 'Expired spring bowl', 'percent', '10% OFF', -45, -20, true, 300, 0, 'Past promotion kept for history.', ['Ended.']],
    [merchants[0], 'Draft: loyalty punch card', 'percent', '10% OFF', 7, 45, false, 0, 0, 'Unpublished draft.', ['Draft.']],
  ]

  const deals = []
  for (const [merchant, title, type, value, sOff, eOff, published, views, saves, desc, terms] of dealDefs) {
    const deal = await Deal.create({
      merchant: merchant._id, title, type, value, desc,
      terms, start: d(sOff), end: d(eOff), published, views, saves,
      businesses: [{ business: merchant._id, role: 'Host' }],
    })
    deals.push(deal)
  }

  // ---------------- Cross-promotions + bundle deal ----------------
  const bundle = await Deal.create({
    merchant: merchants[0]._id,
    title: 'Cappuccino + 15% off haircut',
    type: 'bundle', value: 'BUNDLE',
    desc: 'Buy a cappuccino at Bean & Leaf, get 15% off any haircut at The Copper Studio.',
    terms: ['Voucher must be used within 72 hours.', 'Single redemption per customer.'],
    start: d(-3), end: d(24), published: true, views: 380, saves: 62,
    businesses: [
      { business: merchants[0]._id, role: 'Host' },
      { business: merchants[5]._id, role: 'Partner A' },
    ],
  })

  await CrossPromotion.create([
    {
      createdBy: merchants[0]._id, businessA: merchants[0]._id, businessB: merchants[5]._id,
      offer: bundle.title, value: 'BUNDLE', terms: bundle.terms, start: d(-3), end: d(24),
      status: 'accepted', views: 380, saves: 62,
    },
    {
      createdBy: merchants[1]._id, businessA: merchants[1]._id, businessB: merchants[4]._id,
      offer: 'Steak dinner + 20% off accessory repair', value: '% COMBO', terms: ['Ask either shop.'],
      start: d(3), end: d(28), status: 'awaiting',
    },
    {
      createdBy: merchants[3]._id, businessA: merchants[3]._id, businessB: merchants[6]._id,
      offer: 'Tailored shirt + facial trial', value: 'DUO', terms: ['Both shops in one street.'],
      start: d(-10), end: d(-1), status: 'declined',
    },
  ])

  // ---------------- Follows ----------------
  const follows = [
    [aisha, merchants[0]], [aisha, merchants[2]], [aisha, merchants[5]],
    [marcus, merchants[1]], [zoe, merchants[6]], [zoe, merchants[0]],
    [tomas, merchants[4]],
  ]
  for (const [u, b] of follows) await Follow.create({ user: u._id, business: b._id })

  // ---------------- Saved deals ----------------
  await SavedDeal.create([
    { user: aisha._id, deal: deals[0]._id },
    { user: aisha._id, deal: deals[3]._id },
    { user: aisha._id, deal: bundle._id },
    { user: zoe._id, deal: deals[10]._id },
  ])

  // ---------------- Reviews ----------------
  const reviewDefs = [
    { b: merchants[0], a: aisha, rating: 5, text: 'Best cortado in town, and the staff remembers your name.', reply: 'Thank you Aisha! See you Saturday morning.', daysAgo: 9, kept: true },
    { b: merchants[0], a: marcus, rating: 4, text: 'Great beans, busy at noon — go early.', daysAgo: 22, kept: true },
    { b: merchants[1], a: tomas, rating: 5, text: 'The wood-fired ribeye is unreal.', daysAgo: 5, kept: true },
    { b: merchants[1], a: aisha, rating: 3, text: 'Crowded on a Friday, food was good but service slow.', daysAgo: 30, kept: true },
    { b: merchants[2], a: zoe, rating: 5, text: 'The almond croissant changed my life.', reply: 'That is the best compliment, thank you!', daysAgo: 3, kept: true },
    { b: merchants[2], a: marcus, rating: 5, text: 'Sourdough this good should be illegal.', daysAgo: 40, kept: true },
    { b: merchants[3], a: omar, rating: 4, text: 'Sharp tailoring, lovely fabric choices.', daysAgo: 12, kept: true },
    { b: merchants[4], a: aisha, rating: 4, text: 'Fast, honest laptop repair.', daysAgo: 7, kept: true },
    { b: merchants[5], a: marcus, rating: 5, text: 'Took a workshop here, came out with a real brand.', daysAgo: 15, kept: true },
    { b: merchants[6], a: zoe, rating: 5, text: 'Calmest room in the city. Skin has never looked better.', daysAgo: 6, kept: true },
    { b: merchants[7], a: priya, rating: 4, text: 'Gorgeous arrangements, wraps ship beautifully.', daysAgo: 11, kept: true },
    { b: merchants[1], a: jriv, rating: 1, text: 'Worst place in town, and the owner is hostile to customers.', flagReason: 'Hate speech', risk: 'high', daysAgo: 2, kept: false },
    { b: merchants[7], a: jriv, rating: 5, text: 'Absolutely divine arrangements. 10/10 would recommend.', flagReason: 'Suspected self-review', risk: 'med', daysAgo: 24, kept: false },
  ]

  const reviews = []
  for (const r of reviewDefs) {
    const review = await Review.create({
      author: r.a._id, business: r.b._id, rating: r.rating, text: r.text,
      reply: r.reply ?? null,
      helpful: 0, unhelpful: 0,
      flagged: r.flagReason ? true : false,
      flagReason: r.flagReason || undefined,
      risk: r.risk || 'low',
      moderation: r.kept ? 'kept' : 'pending',
      createdAt: new Date(Date.now() - r.daysAgo * 24 * 3600 * 1000),
    })
    reviews.push(review)
  }

  // ---------------- Helpful votes (keep counts consistent) ----------------
  const helpfulReview = reviews.find((x) => x.business.toString() === merchants[2]._id.toString()) // Zoe's croissant review
  helpfulReview.helpful = 3
  await helpfulReview.save()
  await HelpfulVote.create([
    { review: helpfulReview._id, user: aisha._id, value: 1 },
    { review: helpfulReview._id, user: marcus._id, value: 1 },
    { review: helpfulReview._id, user: omar._id, value: 1 },
  ])

  // ---------------- Interactions (powers recommendations) ----------------
  const interactions = [
    { user: aisha, type: 'view_business', business: merchants[0], category: 'Cafés' },
    { user: aisha, type: 'view_business', business: merchants[2], category: 'Bakeries' },
    { user: aisha, type: 'follow_business', business: merchants[5], category: 'Services' },
    { user: aisha, type: 'save_deal', deal: deals[0], category: 'Cafés' },
    { user: aisha, type: 'save_deal', deal: bundle, category: 'Cafés' },
    { user: aisha, type: 'view_deal', deal: deals[1], category: 'Cafés' },
    { user: aisha, type: 'view_deal', deal: deals[6], category: 'Bakeries' },
    { user: zoe, type: 'view_business', business: merchants[6], category: 'Health & Beauty' },
    { user: zoe, type: 'view_deal', deal: deals[10], category: 'Health & Beauty' },
    { user: marcus, type: 'view_business', business: merchants[1], category: 'Restaurants' },
    { user: marcus, type: 'view_deal', deal: deals[3], category: 'Restaurants' },
  ]
  for (const it of interactions) {
    await Interaction.create({
      user: it.user._id, type: it.type,
      deal: it.deal?._id, business: it.business?._id, category: it.category,
    })
  }

  // ---------------- Notifications ----------------
  await Notification.create([
    { user: aisha._id, type: 'deal', text: '<b>Bean & Leaf</b> just posted a new deal: <b>Two coffees for $8</b>.', unread: true },
    { user: aisha._id, type: 'promotion', text: '<b>Bean & Leaf × The Copper Studio</b> launched a bundle — <b>Cappuccino + 15% off haircut</b>.', unread: true },
    { user: aisha._id, type: 'system', text: 'Welcome to VendorHive! Save deals and follow shops to get alerts.', unread: false },
    { user: zoe._id, type: 'deal', text: '<b>Rose & Ivy Spa</b> posted a new deal: <b>First facial trial</b>.', unread: true },
    { user: merchants[0]._id, type: 'promotion', text: '<b>The Copper Studio</b> accepted your cross-promotion request.', unread: false },
    { user: merchants[1]._id, type: 'review', text: '<b>Zoe Tan</b> left a 5-star review on <b>Ember & Oak Grill</b>.', unread: true },
    { user: merchants[5]._id, type: 'promotion', text: '<b>Bean & Leaf</b> wants to run a cross-promotion with you.', unread: true },
  ])

  // ---------------- Contact messages ----------------
  await ContactMessage.create([
    { name: 'Sam Carter', email: 'sam@example.com', topic: 'Partnership', message: 'We would love to discuss a collaboration.', status: 'new' },
    { name: 'R.C.', email: 'rc@example.com', topic: 'Report a business', message: 'A listing appears to be closed.', status: 'new' },
  ])

  // ---------------- Platform settings ----------------
  await PlatformSetting.create({ key: 'platform' })

  console.log('Seed complete.')
  console.log('Customer login: aisha@example.com / password123')
  console.log('Merchant login: maya@beanandleaf.co / password123')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})