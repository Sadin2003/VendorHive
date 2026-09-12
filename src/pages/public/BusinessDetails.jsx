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
import { PageLoading, PageError } from '../../components/ui/Loading'
import { gradientFor } from '../../utils/gradients'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'
import { useSavedDeals } from '../../utils/useSavedDeals'
import { useAuth } from '../../utils/useAuth'
import { useToast } from '../../components/ui/useToast'

function fmtTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 || 12
  return m !== 0 && m ? `${h12}:${String(m).padStart(2, '0')} ${ampm}` : `${h12} ${ampm}`
}
function fmtHours(range) {
  if (!range) return 'Closed'
  const parts = range.split('-')
  const open = parts[0]
  const close = parts[1]
  if (!open || !close) return range || 'Closed'
  return `${fmtTime(open)} – ${fmtTime(close)}`
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const EMOJIS = ['☕', '🌿', '🛋️', '✨', '🌇', '🧁', '🎵', '📸']

export default function BusinessDetails() {
  const { id } = useParams()
  const { user } = useAuth()

  const { data: v, loading, error } = useApi(
    () => (id ? api.public.business(id) : Promise.reject(new Error('No merchant id'))),
    [id]
  )

  if (loading) return <div className="page"><PageLoading text="Loading business…" /></div>
  if (error || !v) return <div className="page"><PageError title="Business not found" text="This business may no longer be active." /></div>

  return <BusinessBody key={v.id} v={v} id={id} isGuest={!user} />
}

function BusinessBody({ v, id, isGuest }) {
  const { user } = useAuth()
  const toast = useToast()
  const { toggle, contains } = useSavedDeals()

  const [tab, setTab] = useState('overview')
  const [following, setFollowing] = useState(!!v.following)
  const [writeOpen, setWriteOpen] = useState(false)
  const [reviewStars, setReviewStars] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [myReviews, setMyReviews] = useState([])

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).replace('.', '')
  const reviewList = [...myReviews, ...(v?.reviews || [])]

  const ratingDist = [5, 4, 3, 2, 1].map((star) => {
    const count = reviewList.filter((r) => r.rating === star).length
    return { star, pct: reviewList.length ? Math.round((count / reviewList.length) * 100) : 0 }
  })

  const submitReview = async (e) => {
    e.preventDefault()
    if (isGuest) {
      toast('Please log in to write a review.')
      return
    }
    try {
      const result = await api.me.createReview({ businessId: id, rating: reviewStars, text: reviewText })
      setMyReviews((r) => [
        { id: 'mine', user: user.name || 'You', rating: reviewStars, date: 'Just now', text: reviewText, verified: false, helpful: 0 },
        ...r,
      ])
      setWriteOpen(false)
      setReviewText('')
      setReviewStars(5)
      toast(result?.message || 'Thanks! Your review was posted.')
    } catch (err) {
      toast(err?.message || 'Could not post review.')
    }
  }

  return (
    <div className="page" style={{ paddingTop: 0 }}>
      {/* Cover */}
      <div style={{ height: 260, minHeight: 260, background: gradientFor(v.name), position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 110, opacity: 0.28 }}>
          {v.emoji || '🏪'}
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
                    <span className="avg">{Number(v.rating).toFixed(1)}</span>
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
              <Button
                variant={following ? 'primary' : 'outline'}
                onClick={() => {
                  if (isGuest) { toast('Please log in to follow businesses.'); return }
                  setFollowing((f) => !f)
                  const action = following ? api.me.unfollow(id) : api.me.follow(id)
                  action.catch(() => setFollowing((f) => !f))
                  toast(following ? 'Unfollowed business' : `Following ${v.name}`)
                }}
              >
                <Icon name="i-heart" />
                {following ? 'Following' : 'Follow'}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href)
                    toast('Link copied to clipboard')
                  } catch {
                    toast('Could not copy link')
                  }
                }}
              >
                <Icon name="i-share" /> Share
              </Button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 30 }}>
          <Tabs
            items={[
              { id: 'overview', label: 'Overview' },
              { id: 'deals', label: 'Deals', count: v.deals?.length || 0 },
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
                  <p>{v.about || 'A verified VendorHive merchant in the neighborhood.'}</p>
                  <div className="row" style={{ flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                    <span className="badge badge-outline">Followed by {Number(v.followers || 0).toLocaleString()} locals</span>
                    <span className="badge badge-outline">🌱 Local & independent</span>
                  </div>
                </div>
                <div className="card card-pad">
                  <h4 style={{ marginBottom: 14 }}>Opening hours</h4>
                  {DAYS.map((d) => {
                    const range = v.hours?.[d] || v.hours?.[`${d}.`]
                    return (
                      <div key={d} className={`hours-row ${d === today || d === `${today}.` ? 'today' : ''}`}>
                        <span className="d">{d === today || d === `${today}.` ? `${d} (today)` : d}</span>
                        <span className={!range ? 'closed' : ''}>{fmtHours(range)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid" style={{ gap: 20, gridTemplateColumns: '1fr' }}>
                <div className="card card-pad">
                  <h4 style={{ marginBottom: 14 }}>Contact</h4>
                  <div className="kv">
                    {v.address && <><dt><Icon name="i-map-pin" size={15} style={{ verticalAlign: -2 }} /></dt><dd>{v.address}</dd></>}
                    {v.phone && <><dt><Icon name="i-phone" size={15} style={{ verticalAlign: -2 }} /></dt><dd>{v.phone}</dd></>}
                    {v.email && <><dt><Icon name="i-mail" size={15} style={{ verticalAlign: -2 }} /></dt><dd>{v.email}</dd></>}
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
            v.deals?.length ? (
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {v.deals.map((d) => (
                  <DealCard
                    key={d.id}
                    deal={d}
                    saved={contains(d.id)}
                    onSave={toggle}
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
                  <span style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-.03em' }}>{Number(v.rating).toFixed(1)}</span>
                  <div>
                    <StarRating value={v.rating} size={18} />
                    <div className="tiny muted" style={{ marginTop: 4 }}>Based on {v.reviewCount} reviews</div>
                  </div>
                </div>
                {ratingDist.map((r) => (
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
                {reviewList.length === 0 && (
                  <div className="card">
                    <EmptyState icon="i-star" title="No reviews yet" text="Be the first to leave a review for this business." />
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'gallery' && (
            <div className="gallery-grid">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="tile" style={{ background: gradientFor(`${v.name} ${EMOJIS[i % EMOJIS.length]}`), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
                  {EMOJIS[i % EMOJIS.length]}
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