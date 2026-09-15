import { haversine } from './geo.js'
import Interaction from '../models/Interaction.js'
import Follow from '../models/Follow.js'

// Log an interaction that feeds the recommendation engine and the
// "recent activity" feed on the customer dashboard.
export async function recordInteraction(userId, type, { deal, business, category } = {}) {
  if (!userId || !type) return
  try {
    await Interaction.create({
      user: userId,
      type,
      deal: deal?._id || undefined,
      business: business?._id || undefined,
      category: category || undefined,
    })
  } catch {
    // Interaction logging is best-effort; never break the request over it.
  }
}

// Category affinity weights, built from the user's interaction history.
// Save/follow signals weigh more than casual views.
export async function categoryAffinity(userId) {
  const [interactions, follows] = await Promise.all([
    Interaction.find({ user: userId }).select('category').lean().catch(() => []),
    Follow.find({ user: userId })
      .populate({ path: 'business', select: 'category' })
      .lean()
      .catch(() => []),
  ])
  const weights = {}
  const bump = (cat, w) => {
    if (cat) weights[cat] = (weights[cat] || 0) + w
  }
  for (const it of interactions) {
    const w = it.type === 'save_deal' || it.type === 'follow_business' ? 3 : it.type === 'view_deal' ? 2 : 1
    bump(it.category, w)
  }
  for (const f of follows) bump(f.business?.category, 3)
  const total = Object.values(weights).reduce((a, b) => a + b, 0) || 1
  return { weights, total }
}

// Score a set of already-loaded deals for the user. Each deal must have its
// `merchant` ref populated (for category + location). Returns sorted array.
//
//   score = 0.40 * proximity + 0.35 * affinity + 0.25 * popularity
//
// Proximity falls off from 1.0 at 0 miles to ~0.5 at 12.5 mi and ~0 at 25 mi.
// Popularity is (views + 3*saves) normalized against the hottest deal.
export async function recommendDeals(userId, deals, { lat, lng } = {}) {
  if (!deals.length) return deals
  const { weights, total } = await categoryAffinity(userId)
  const maxPop = Math.max(1, ...deals.map((d) => (d.views || 0) + 3 * (d.saves || 0)))
  return deals
    .map((deal) => {
      const m = deal.merchant
      const popularity = ((deal.views || 0) + 3 * (deal.saves || 0)) / maxPop
      let proximity = 0
      if (lat && lng && m?.location?.coordinates?.length === 2) {
        const [dlng, dlat] = m.location.coordinates
        const dist = haversine(lat, lng, dlat, dlng)
        proximity = dist == null ? 0 : Math.max(0, 1 - dist / 25)
      }
      const affinity = m?.category ? (weights[m.category] || 0) / total : 0
      const score = 0.4 * proximity + 0.35 * affinity + 0.25 * popularity
      return { deal, score }
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.deal)
}

// Pure helper used by the no-DB "deals discover" path too.
export function scoreDealsSync(deals, affinity, { lat, lng } = {}) {
  const { weights, total } = affinity || { weights: {}, total: 1 }
  const maxPop = Math.max(1, ...deals.map((d) => (d.views || 0) + 3 * (d.saves || 0)))
  return deals
    .map((deal) => {
      if (typeof deal.score === 'number') return deal
      const m = deal.merchant
      const popularity = ((deal.views || 0) + 3 * (deal.saves || 0)) / maxPop
      let proximity = 0
      if (lat && lng && m?.location?.coordinates?.length === 2) {
        const [dlng, dlat] = m.location.coordinates
        const dist = haversine(lat, lng, dlat, dlng)
        proximity = dist == null ? 0 : Math.max(0, 1 - dist / 25)
      }
      const affinityScore = m?.category ? (weights[m.category] || 0) / total : 0
      deal.score = 0.4 * proximity + 0.35 * affinityScore + 0.25 * popularity
      return deal
    })
    .sort((a, b) => b.score - a.score)
}