import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import StarRating from '../../components/ui/StarRating'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Tabs from '../../components/ui/Tabs'
import Modal from '../../components/ui/Modal'
import { Field, Textarea } from '../../components/ui/Fields'
import ReviewCard from '../../components/cards/ReviewCard'
import DealCard from '../../components/cards/DealCard'
import EmptyState from '../../components/ui/EmptyState'
import { gradientFor } from '../../utils/gradients'
import { useToast } from '../../components/ui/useToast'

const VENDOR_DETAILS = {
  m1: {
    id: 'm1', name: 'Bean & Leaf', category: 'Cafés', tags: ['Specialty coffee', 'Cozy seating', 'Plant-based milk'],
    address: '12 Maple Lane, Hive City', phone: '(555) 010-2211', email: 'hello@beanandleaf.co',
    about: 'A neighborhood espresso bar that roasts in-house twice a week. We serve single-origin brews, seasonal pastries from Sunflower Bakehouse, and pour the best cold drip on Maple Lane. Come for the coffee, stay for the community.',
    hours: { Mon: '7:00 am – 6:00 pm', Tue: '7:00 am – 6:00 pm', Wed: '7:00 am – 6:00 pm', Thu: '7:00 am – 8:00 pm', Fri: '7:00 am – 8:00 pm', Sat: '8:00 am – 7:00 pm', Sun: '9:00 am – 4:00 pm' },
    rating: 4.8, reviewCount: 214, verified: true, followers: 1830, emoji: '☕',
    deals: [
      { id: 'd1', merchant: 'Bean & Leaf', category: 'Cafés', title: 'BOGO any signature brew after 3pm', tag: 'BOGO', discount: 'Buy 1 Get 1', views: 4210, saves: 1180, expiresIn: '6 days left' },
      { id: 'd7', merchant: 'Bean & Leaf × Sunflower Bakehouse', category: 'Cafés', title: 'Bundle: cappuccino + croissant duo for $9', tag: 'BUNDLE', discount: '$9 duo', views: 5120, saves: 1734, expiresIn: '7 days left' },
    ],
    reviews: [
      { id: 'r1', user: 'Aisha K.', rating: 5, date: '2 days ago', text: 'The oat-latte-cold-drip combo is unreal. Baristas remember my order every single morning.', verified: true, helpful: 42, helpfulVoted: false },
      { id: 'r2', user: 'Marcus T.', rating: 5, date: '1 week ago', text: 'Cozy spot, great WiFi, and the bundled deal with Sunflower is the best value on the block.', verified: true, helpful: 27, helpfulVoted: false },
      { id: 'r3', user: 'Priya N.', rating: 4, date: '3 weeks ago', text: 'Lovely roastery smell when you walk in. Gets busy after 5pm on Thursdays.', verified: false, helpful: 11, helpfulVoted: false },
      { id: 'r4', user: 'Danny R.', rating: 5, date: '1 month ago', text: 'Staff went out of their way to help me choose a gift bag of beans. Five stars.', verified: true, helpful: 19, helpfulVoted: false },
    ],
  },
  m2: {
    id: 'm2', name: 'Ember & Oak Grill', category: 'Restaurants', tags: ['Steakhouse', 'Local produce', 'Craft beer'],
    address: '88 Coal Street, Hive City', phone: '(555) 010-8810', email: 'table@emberandoak.com',
    about: 'Wood-fired cooking with produce from Green Table Grocery and craft pours from three breweries within ten blocks. Tuesday night is steak night — it sells out fast.',
    hours: { Mon: '5:00 pm – 10:00 pm', Tue: '5:00 pm – 10:00 pm', Wed: '5:00 pm – 10:00 pm', Thu: '5:00 pm – 11:00 pm', Fri: '5:00 pm – 11:00 pm', Sat: '12:00 pm – 11:00 pm', Sun: '12:00 pm – 9:00 pm' },
    rating: 4.6, reviewCount: 342, verified: true, followers: 2410, emoji: '🍖',
    deals: [
      { id: 'd2', merchant: 'Ember & Oak Grill', category: 'Restaurants', title: '20% off the Tuesday steak night menu', tag: '20% OFF', discount: '20% off', views: 3310, saves: 940, expiresIn: '3 days left' },
    ],
    reviews: [
      { id: 'r1', user: 'Lena V.', rating: 5, date: '1 day ago', text: 'The flat iron on Tuesday night with the whiskey glaze? Lifelong memory. Book ahead.', verified: true, helpful: 38, helpfulVoted: false },
      { id: 'r2', user: 'Omar S.', rating: 4, date: '1 week ago', text: 'Great smoke flavor, slightly loud room. Drinks list is a winner.', verified: true, helpful: 14, helpfulVoted: false },
      { id: 'r3', user: 'Cara L.', rating: 5, date: '2 weeks ago', text: 'Loved that they list every farm they buy from. Feel-good eating.', verified: false, helpful: 9, helpfulVoted: false },
    ],
  },
  m3: {
    id: 'm3', name: 'Sunflower Bakehouse', category: 'Bakeries', tags: ['Sourdough', 'Custom cakes', 'Local honey'],
    address: '3 Meadow Road, Hive City', phone: '(555) 010-3300', email: 'hello@sunflowerbake.com',
    about: 'Slow-fermented sourdough, laminated croissants, and celebration cakes baked before sunrise. Our honey is from two backyard hives on neighborhood rooftops.',
    hours: { Mon: 'Closed', Tue: '6:30 am – 3:00 pm', Wed: '6:30 am – 3:00 pm', Thu: '6:30 am – 3:00 pm', Fri: '6:30 am – 5:00 pm', Sat: '7:00 am – 4:00 pm', Sun: '7:00 am – 12:00 pm' },
    rating: 4.9, reviewCount: 176, verified: true, followers: 1980, emoji: '🥐',
    deals: [
      { id: 'd3', merchant: 'Sunflower Bakehouse', category: 'Bakeries', title: 'Free dozen rolls with any custom cake order', tag: 'FREE', discount: 'Free dozen rolls', views: 2140, saves: 610, expiresIn: '10 days left' },
      { id: 'd7', merchant: 'Bean & Leaf × Sunflower Bakehouse', category: 'Cafés', title: 'Bundle: cappuccino + croissant duo for $9', tag: 'BUNDLE', discount: '$9 duo', views: 5120, saves: 1734, expiresIn: '7 days left' },
    ],
    reviews: [
      { id: 'r1', user: 'Hana P.', rating: 5, date: '3 days ago', text: 'Their cross-pan sourdough is the best loaf in town. Order early on Saturdays!', verified: true, helpful: 31, helpfulVoted: false },
      { id: 'r2', user: 'Theo W.', rating: 5, date: '2 weeks ago', text: 'Custom birthday cake looked like art and tasted even better.', verified: true, helpful: 22, helpfulVoted: false },
      { id: 'r3', user: 'June B.', rating: 4, date: '3 weeks ago', text: 'Honey cardamom rolls sell out fast for a reason.', verified: false, helpful: 8, helpfulVoted: false },
      { id: 'r4', user: 'Ravi D.', rating: 5, date: '1 month ago', text: 'Everyone in the office now has a standing Friday bread order.', verified: true, helpful: 16, helpfulVoted: false },
    ],
  },
}

const FALLBACK = {
  m4: { name: 'Petal & Stem Florist', category: 'Gifts & Local', tags: ['Fresh flowers', 'Same-day delivery'], addr: '45 Garden Walk', emoji: '💐', rating: 4.7, reviews: 98 },
  m5: { name: 'The Copper Studio', category: 'Services', tags: ['Barbershop', 'Hot towel shaves'], addr: '27 Foundry Ave', emoji: '✂️', rating: 4.7, reviews: 158 },
  m6: { name: 'Volt City Repairs', category: 'Electronics', tags: ['Phone repair', 'Laptop service'], addr: '9 Circuit Row', emoji: '🔌', rating: 4.5, reviews: 87 },
  m7: { name: 'Hearth & Thread', category: 'Clothing', tags: ['Local designers', 'Mending bar'], addr: '31 Willow Street', emoji: '👕', rating: 4.6, reviews: 129 },
  m8: { name: 'Daily Grind Gym', category: 'Services', tags: ['Group classes', 'Open 24/5'], addr: '50 Ironworks Blvd', emoji: '🏋️', rating: 4.4, reviews: 201 },
  m9: { name: 'Page & Plume Books', category: 'Gifts & Local', tags: ['Indie books', 'Reading room'], addr: '7 Quill Court', emoji: '📚', rating: 4.8, reviews: 143 },
  m10: { name: 'Woof & Whisker', category: 'Services', tags: ['Grooming', 'Daycare'], addr: '19 Tail Lane', emoji: '🐕', rating: 4.7, reviews: 92 },
  m11: { name: 'Glow & Grace Spa', category: 'Health & Beauty', tags: ['Massage', 'Facials'], addr: '64 Honeycomb Sq', emoji: '💆', rating: 4.9, reviews: 167 },
  m12: { name: 'The Salted Crumb', category: 'Bakeries', tags: ['Pretzel bakery', 'Soft serve'], addr: '11 Rye Avenue', emoji: '🥨', rating: 4.6, reviews: 84 },
}

const GALLERY_NAMES = ['counter', 'seating', 'garden', 'detail', 'patio', 'evening']

const RATING_DIST = [
  { star: 5, pct: 82 },
  { star: 4, pct: 12 },
  { star: 3, pct: 4 },
  { star: 2, pct: 1 },
  { star: 1, pct: 1 },
]

export default function BusinessDetails() {
  const { id } = useParams()
  const planet = id || 'm1'
  const detail = VENDOR_DETAILS[planet]
  const fallback = FALLBACK[planet]
  const toast = useToast()

  const v = detail || {
    id: planet,
    name: fallback?.name || 'Local business',
    category: fallback?.category || 'Services',
    tags: fallback?.tags || [],
    address: fallback?.addr || 'Hive City',
    phone: '(555) 010-0000',
    email: `hello@${planet}.local`,
    about: `${fallback?.name || 'This business'} is a verified VendorHive merchant in the neighborhood, known for friendly service and ${
      fallback?.category?.toLowerCase() || 'local goods'
    }. Drop by to see today's deals.`,
    hours: { Mon: '9:00 am – 6:00 pm', Tue: '9:00 am – 6:00 pm', Wed: '9:00 am – 6:00 pm', Thu: '9:00 am – 6:00 pm', Fri: '9:00 am – 8:00 pm', Sat: '10:00 am – 6:00 pm', Sun: 'Closed' },
    rating: fallback?.rating || 4.6,
    reviewCount: fallback?.reviews || 120,
    verified: true,
    followers: 950,
    emoji: fallback?.emoji || '🏪',
    deals: [
      { id: 'd2', merchant: VENDOR_DETAILS.m2?.name || 'Ember & Oak Grill', category: 'Restaurants', title: '20% off the Tuesday steak night menu', tag: '20% OFF', discount: '20% off', views: 3310, saves: 940, expiresIn: '3 days left' },
    ],
    reviews: [
      { id: 'r1', user: 'Sam L.', rating: 5, date: '2 days ago', text: 'Great experience and the team is so welcoming. Will definitely come back.', verified: true, helpful: 18, helpfulVoted: false },
      { id: 'r2', user: 'Noor A.', rating: 4, date: '1 week ago', text: 'Solid quality and friendly service. Gets busy on weekends.', verified: false, helpful: 7, helpfulVoted: false },
      { id: 'r3', user: 'Isaac F.', rating: 5, date: '3 weeks ago', text: 'Found them through the co-op deal and became a regular.', verified: true, helpful: 12, helpfulVoted: false },
    ],
  }

  const [tab, setTab] = useState('overview')
  const [following, setFollowing] = useState(false)
  const [saved, setSaved] = useState([])
  const [writeOpen, setWriteOpen] = useState(false)
  const [reviewStars, setReviewStars] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [myReviews, setMyReviews] = useState([])

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const reviewList = [...myReviews, ...v.reviews]

  const submitReview = (e) => {
    e.preventDefault()
    setMyReviews((r) => [
      { id: 'mine', user: 'You', rating: reviewStars, date: 'Just now', text: reviewText, verified: false, helpful: 0 },
      ...r,
    ])
    setWriteOpen(false)
    setReviewText('')
    toast('Thanks! Your review was posted.')
  }

  return (
    <div className="page" style={{ paddingTop: 0 }}>
      {/* Cover */}
      <div style={{ height: 260, minHeight: 260, background: gradientFor(v.name), position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 110, opacity: 0.28 }}>
          {v.emoji}
        </div>
      </div>

      <div className="container" style={{ marginTop: -56, position: 'relative' }}>
        <div className="card card-pad" style={{ boxShadow: 'var(--shadow)' }}>
          <div className="row-between" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div className="row" style={{ gap: 18, flexWrap: 'wrap' }}>
              <Avatar text={v.name} size="lg" style={{ fontSize: 26, width: 92, height: 92, borderRadius: 26, boxShadow: 'var(--shadow)', border: '4px solid var(--surface)' }} />
              <div>
                <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '2rem', margin: 0 }}>{v.name}</h1>
                  {v.verified && (
                    <Badge tone="green">
                      <Icon name="i-shield" size={12} /> Verified
                    </Badge>
                  )}
                </div>
                <div className="row" style={{ gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
                  <span className="rating-line">
                    <StarRating value={v.rating} size={15} />
                    <span className="avg">{v.rating.toFixed(1)}</span>
                    <span className="count">({v.reviewCount} reviews)</span>
                  </span>
                  <span className="badge badge-gray">{v.category}</span>
                  {v.tags?.map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="row" style={{ gap: 10 }}>
              <Button variant={following ? 'primary' : 'outline'} onClick={() => { setFollowing((f) => !f); toast(following ? 'Unfollowed business' : `Following ${v.name}`) }}>
                <Icon name={following ? 'i-heart' : 'i-heart'} />
                {following ? 'Following' : 'Follow'}
              </Button>
              <Button variant="outline" onClick={() => toast('Link copied to clipboard')}>
                <Icon name="i-share" /> Share
              </Button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 30 }}>
          <Tabs
            items={[
              { id: 'overview', label: 'Overview' },
              { id: 'deals', label: 'Deals', count: v.deals.length },
              { id: 'reviews', label: 'Reviews', count: reviewList.length },
              { id: 'gallery', label: 'Gallery', count: 6 },
            ]}
            active={tab}
            onChange={setTab}
          />

          {tab === 'overview' && (
            <div className="grid-2" style={{ display: 'grid', gap: 20, alignItems: 'start' }}>
              <div className="grid" style={{ gap: 20, gridTemplateColumns: '1fr' }}>
                <div className="card card-pad">
                  <h4 style={{ marginBottom: 10 }}>About</h4>
                  <p>{v.about}</p>
                  <div className="row" style={{ flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                    <span className="badge badge-outline">Followed by {v.followers.toLocaleString()} locals</span>
                    <span className="badge badge-outline">🌱 Local & independent</span>
                  </div>
                </div>
                <div className="card card-pad">
                  <h4 style={{ marginBottom: 14 }}>Opening hours</h4>
                  {Object.entries(v.hours).map(([d, h]) => (
                    <div key={d} className={`hours-row ${d === today ? 'today' : ''}`}>
                      <span className="d">{d === today ? `${d} (today)` : d}</span>
                      <span className={h === 'Closed' ? 'closed' : ''}>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid" style={{ gap: 20, gridTemplateColumns: '1fr' }}>
                <div className="card card-pad">
                  <h4 style={{ marginBottom: 14 }}>Contact</h4>
                  <div className="kv">
                    <dt><Icon name="i-map-pin" size={15} style={{ verticalAlign: -2 }} /></dt><dd>{v.address}</dd>
                    <dt><Icon name="i-phone" size={15} style={{ verticalAlign: -2 }} /></dt><dd>{v.phone}</dd>
                    <dt><Icon name="i-mail" size={15} style={{ verticalAlign: -2 }} /></dt><dd>{v.email}</dd>
                  </div>
                </div>
                <div className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
                    <h4 style={{ margin: 0 }}>
                      <Icon name="i-map" size={16} style={{ verticalAlign: -2, marginRight: 6, color: 'var(--primary)' }} />
                      Find us
                    </h4>
                  </div>
                  <div className="map-ph" style={{ border: 'none', borderRadius: 0, minHeight: 260 }}>
                    <div className="map-bg" />
                    <Link to="/explore" className="map-pin" style={{ left: '58%', top: '52%' }} aria-label={v.name}>
                      <svg viewBox="0 0 24 24" style={{ overflow: 'visible' }}>
                        <path fill="var(--primary-600)" stroke="#fff" strokeWidth="1.4" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" fill="#fff" />
                      </svg>
                    </Link>
                    <div className="attribution">Open the map →</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'deals' && (
            v.deals.length ? (
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {v.deals.map((d) => (
                  <DealCard
                    key={d.id + d.title}
                    deal={d}
                    saved={saved.includes(d.id)}
                    onSave={(dl, s) => setSaved((arr) => (s ? [...arr, dl.id] : arr.filter((x) => x !== dl.id)))}
                  />
                ))}
              </div>
            ) : (
              <div className="card">
                <EmptyState icon="i-tag" title="No active deals" text="This business hasn't launched a deal yet. Follow them to get notified when one drops." action={{ to: '/deals', variant: 'outline', children: 'Browse other deals' }} />
              </div>
            )
          )}

          {tab === 'reviews' && (
            <div className="grid-2" style={{ display: 'grid', gap: 20, alignItems: 'start' }}>
              <div className="card card-pad" style={{ position: 'sticky', top: 86 }}>
                <h4 style={{ marginBottom: 14 }}>Rating summary</h4>
                <div className="row" style={{ gap: 18, alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-.03em' }}>{v.rating.toFixed(1)}</span>
                  <div>
                    <StarRating value={v.rating} size={18} />
                    <div className="tiny muted" style={{ marginTop: 4 }}>Based on {v.reviewCount} reviews</div>
                  </div>
                </div>
                {RATING_DIST.map((r) => (
                  <div className="row" style={{ gap: 10 }} key={r.star}>
                    <span className="tiny muted nowrap" style={{ width: 30 }}>{r.star}★</span>
                    <div className="progress grow"><i style={{ width: `${r.pct}%` }} /></div>
                    <span className="tiny muted" style={{ width: 34, textAlign: 'right' }}>{r.pct}%</span>
                  </div>
                ))}
                <hr className="divider" />
                <Button variant="primary" block onClick={() => setWriteOpen(true)}>
                  <Icon name="i-edit" /> Write a review
                </Button>
              </div>

              <div className="col" style={{ gap: 14 }}>
                {reviewList.map((r) => (
                  <ReviewCard key={r.id + r.user} review={r} />
                ))}
              </div>
            </div>
          )}

          {tab === 'gallery' && (
            <div className="gallery-grid">
              {GALLERY_NAMES.map((g, i) => (
                <div key={g} className="tile" style={{ background: gradientFor(`${v.name} ${g}`), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
                  {['☕', '🌿', '🛋️', '✨', '🌇', '🧁'][i]}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={writeOpen} onClose={() => setWriteOpen(false)} title={`Review ${v.name}`}>
        <form onSubmit={submitReview}>
          <Field label="Your rating" required>
            <StarRating value={reviewStars} size={22} />
            <div className="row" style={{ marginTop: 8, gap: 6 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" className="btn btn-sm btn-outline" style={{ padding: '5px 10px' }} onClick={() => setReviewStars(s)}>
                  {s}★
                </button>
              ))}
            </div>
          </Field>
          <Field label="Your review" required>
            <Textarea required placeholder="Tell the neighborhood about your visit…" value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
          </Field>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 6 }}>
            <Button variant="ghost" onClick={() => setWriteOpen(false)} type="button">Cancel</Button>
            <Button type="submit">Post review</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}