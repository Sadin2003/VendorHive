import Review from '../models/Review.js'
import User from '../models/User.js'

// Recompute a merchant's aggregate rating + count from their kept reviews,
// keeping the displayed numbers consistent after add/edit/delete/moderation.
export async function recomputeBusinessRating(businessId) {
  const agg = await Review.aggregate([
    { $match: { business: businessId, moderation: 'kept' } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  const row = agg[0]
  await User.updateOne(
    { _id: businessId },
    {
      $set: {
        rating: row ? Math.round(row.avg * 10) / 10 : 0,
        ratingsCount: row ? row.count : 0,
      },
    }
  )
}