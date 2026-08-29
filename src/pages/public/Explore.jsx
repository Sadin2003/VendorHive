import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import SearchInput from '../../components/ui/SearchInput'
import StarRating from '../../components/ui/StarRating'
import Avatar from '../../components/ui/Avatar'
import EmptyState from '../../components/ui/EmptyState'
import { toneFor } from '../../utils/gradients'

const ALL_CATS = ['Restaurants', 'Cafés', 'Bakeries', 'Clothing', 'Electronics', 'Services', 'Health & Beauty', 'Gifts & Local']

const BUSINESSES = [
  { id: 'm1', name: 'Bean & Leaf', category: 'Cafés', address: '12 Maple Lane', distance: 0.3, rating: 4.8, reviews: 214, openNow: true, deals: 3, pos: { x: 30, y: 34 }, verified: true },
  { id: 'm2', name: 'Ember & Oak Grill', category: 'Restaurants', address: '88 Coal Street', distance: 0.6, rating: 4.6, reviews: 342, openNow: true, deals: 2, pos: { x: 62, y: 26 }, verified: true },
  { id: 'm3', name: 'Sunflower Bakehouse', category: 'Bakeries', address: '3 Meadow Road', distance: 1.1, rating: 4.9, reviews: 176, openNow: false, deals: 1, pos: { x: 78, y: 58 }, verified: true },
  { id: 'm4', name: 'Petal & Stem Florist', category: 'Gifts & Local', address: '45 Garden Walk', distance: 0.9, rating: 4.7, reviews: 98, openNow: true, deals: 1, pos: { x: 45, y: 72 }, verified: true },
  { id: 'm5', name: 'The Copper Studio', category: 'Services', address: '27 Foundry Ave', distance: 0.4, rating: 4.7, reviews: 158, openNow: true, deals: 2, pos: { x: 22, y: 55 }, verified: true },
  { id: 'm6', name: 'Volt City Repairs', category: 'Electronics', address: '9 Circuit Row', distance: 1.4, rating: 4.5, reviews: 87, openNow: true, deals: 2, pos: { x: 58, y: 48 }, verified: true },
  { id: 'm7', name: 'Hearth & Thread', category: 'Clothing', address: '31 Willow Street', distance: 1.8, rating: 4.6, reviews: 129, openNow: false, deals: 1, pos: { x: 70, y: 80 }, verified: true },
  { id: 'm8', name: 'Daily Grind Gym', category: 'Services', address: '50 Ironworks Blvd', distance: 2.2, rating: 4.4, reviews: 201, openNow: true, deals: 2, pos: { x: 40, y: 88 }, verified: false },
  { id: 'm9', name: 'Page & Plume Books', category: 'Gifts & Local', address: '7 Quill Court', distance: 2.9, rating: 4.8, reviews: 143, openNow: true, deals: 1, pos: { x: 84, y: 34 }, verified: true },
  { id: 'm10', name: 'Woof & Whisker', category: 'Services', address: '19 Tail Lane', distance: 3.4, rating: 4.7, reviews: 92, openNow: true, deals: 1, pos: { x: 16, y: 82 }, verified: true },
  { id: 'm11', name: 'Glow & Grace Spa', category: 'Health & Beauty', address: '64 Honeycomb Sq', distance: 3.1, rating: 4.9, reviews: 167, openNow: false, deals: 2, pos: { x: 51, y: 16 }, verified: true },
  { id: 'm12', name: 'The Salted Crumb', category: 'Bakeries', address: '11 Rye Avenue', distance: 4.0, rating: 4.6, reviews: 84, openNow: true, deals: 1, pos: { x: 66, y: 66 }, verified: false },
]

const DISTANCES = [
  { id: 'any', label: 'Any distance' },
  { id: '1', label: 'Within 1 mi' },
  { id: '3', label: 'Within 3 mi' },
  { id: '5', label: 'Within 5 mi' },
]

const SORTS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'rating', label: 'Highest rated' },
  { id: 'reviews', label: 'Most reviewed' },
  { id: 'nearest', label: 'Nearest' },
]

export default function Explore() {
  const [params, setParams] = useSearchParams()
  const [cat, setCat] = useState(params.get('cat') || 'All')
  const [q, setQ] = useState('')
  const [dist, setDist] = useState('any')
  const [openNowOnly, setOpenNowOnly] = useState(false)
  const [dealsOnly, setDealsOnly] = useState(false)
  const [sort, setSort] = useState('relevance')
  const [active, setActive] = useState(null)

  const pickCat = (c) => {
    setCat(c)
    setParams(c === 'All' ? {} : { cat: c })
  }

  const results = useMemo(() => {
    let list = BUSINESSES.filter((b) => {
      if (cat !== 'All' && b.category !== cat) return false
      if (q && !`${b.name} ${b.category} ${b.address}`.toLowerCase().includes(q.toLowerCase())) return false
      if (openNowOnly && !b.openNow) return false
      if (dealsOnly && b.deals === 0) return false
      const miles = dist === 'any' ? Infinity : Number(dist)
      if (b.distance > miles) return false
      return true
    })
    const order = {
      rating: (a, b) => b.rating - a.rating,
      reviews: (a, b) => b.reviews - a.reviews,
      nearest: (a, b) => a.distance - b.distance,
      relevance: (a, b) => Number(b.verified) - Number(a.verified),
    }[sort]
    return [...list].sort(order)
  }, [cat, q, dist, openNowOnly, dealsOnly, sort])

  return (
    <div className="container page">
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ marginBottom: 6 }}>Explore businesses</h1>
        <p className="muted">Search, filter, and find deals within your neighborhood.</p>
      </div>

      <div className="explore-toolbar">
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, category, or address…" />
        <label className="select" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, width: 'auto', padding: '9px 14px', cursor: 'pointer' }}>
          <Icon name="i-filter" size={15} style={{ color: 'var(--text-muted)' }} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ border: 'none', background: 'none', fontWeight: 600, color: 'var(--text)', cursor: 'pointer' }}
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="explore-filters" style={{ marginBottom: 22 }}>
        <button type="button" className={`pill ${cat === 'All' ? 'active' : ''}`} onClick={() => pickCat('All')}>
          All
        </button>
        {ALL_CATS.map((c) => (
          <button key={c} type="button" className={`pill ${cat === c ? 'active' : ''}`} onClick={() => pickCat(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="explore-filters" style={{ marginBottom: 24 }}>
        {DISTANCES.map((d) => (
          <button key={d.id} type="button" className={`pill ${dist === d.id ? 'active' : ''}`} onClick={() => setDist(d.id)}>
            <Icon name="i-map-pin" size={14} />
            {d.label}
          </button>
        ))}
        <button type="button" className={`pill ${openNowOnly ? 'active' : ''}`} onClick={() => setOpenNowOnly((v) => !v)}>
          <Icon name="i-clock" size={14} />
          Open now
        </button>
        <button type="button" className={`pill ${dealsOnly ? 'active' : ''}`} onClick={() => setDealsOnly((v) => !v)}>
          <Icon name="i-tag" size={14} />
          Active deals
        </button>
      </div>

      <div className="explore-grid">
        <div className="col" style={{ gap: 12 }}>
          <div className="row-between small muted">
            <span>
              <strong style={{ color: 'var(--text)' }}>{results.length}</strong> businesses found
            </span>
            {active && <span>Showing pins for “{active.name}”</span>}
          </div>
          {results.length === 0 && (
            <div className="card">
              <EmptyState
                icon="i-search"
                title="Nothing matched your filters"
                text="Try widening the distance or turning off the &quot;Open now&quot; filter, then searching a different term."
              />
            </div>
          )}
          {results.map((b) => (
            <div
              key={b.id}
              className={`card card-hover card-pad ${active === b.id ? 'active' : ''}`}
              style={{ ...(active === b.id ? { borderColor: 'var(--primary)', boxShadow: 'var(--shadow)' } : {}) }}
              onMouseEnter={() => setActive(b.id)}
              onMouseLeave={() => setActive(null)}
            >
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <Avatar text={b.name} size="md" />
                <div className="grow">
                  <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                    <Link to={`/vendors/${b.id}`} className="bold" style={{ fontSize: 1.05, fontWeight: 700 }}>
                      {b.name}
                    </Link>
                    {b.verified && <Icon name="i-shield" size={14} style={{ color: 'var(--primary)' }} />}
                    <span className="badge badge-gray">{b.category}</span>
                    {b.deals > 0 && <span className="badge badge-green">{b.deals} deals</span>}
                  </div>
                  <div className="row" style={{ gap: 14, marginTop: 6, flexWrap: 'wrap' }}>
                    <span className="muted small">
                      <Icon name="i-map-pin" size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
                      {b.address}
                    </span>
                    <span className="muted small">{b.distance.toFixed(1)} mi</span>
                    <span className="small rating-line">
                      <StarRating value={b.rating} size={13} />
                      <span className="avg">{b.rating.toFixed(1)}</span>
                      <span className="count">({b.reviews})</span>
                    </span>
                    <span className={`badge ${b.openNow ? 'badge-green' : 'badge-gray'}`}>{b.openNow ? 'Open now' : 'Closed'}</span>
                  </div>
                </div>
                <Link to={`/vendors/${b.id}`} className="btn btn-sm btn-outline">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="map-ph" style={{ position: 'sticky', top: '86px' }}>
          <div className="map-bg" />
          <div className="map-overlay">
            <Icon name="i-map-pin" />
            {results.length} pins · neighborhood view
          </div>
          {results.map((b) => (
            <Link
              key={b.id}
              to={`/vendors/${b.id}`}
              className={`map-pin ${active === b.id ? 'active' : ''}`}
              style={{ left: `${b.pos.x}%`, top: `${b.pos.y}%` }}
              aria-label={b.name}
            >
              <svg viewBox="0 0 24 24" style={{ overflow: 'visible' }}>
                <path
                  fill={active === b.id ? 'var(--amber-2)' : toneFor(b.name)}
                  stroke="#fff"
                  strokeWidth="1.4"
                  d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                />
                <circle cx="12" cy="10" r="3" fill="#fff" stroke="none" />
              </svg>
            </Link>
          ))}
          <div className="attribution">Map preview · VendorHive demo</div>
        </div>
      </div>
    </div>
  )
}