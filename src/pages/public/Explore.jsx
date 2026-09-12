import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import SearchInput from '../../components/ui/SearchInput'
import StarRating from '../../components/ui/StarRating'
import Avatar from '../../components/ui/Avatar'
import EmptyState from '../../components/ui/EmptyState'
import { PageLoading, PageError } from '../../components/ui/Loading'
import { toneFor } from '../../utils/gradients'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'

const ALL_CATS = ['Restaurants', 'Cafés', 'Bakeries', 'Clothing', 'Electronics', 'Services', 'Health & Beauty', 'Gifts & Local']

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

function useDebounce(value, ms) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export default function Explore() {
  const [params, setParams] = useSearchParams()
  const initialCat = params.get('cat') || 'All'
  const initialQ = params.get('q') || ''
  const [cat, setCat] = useState(initialCat)
  const [search, setSearch] = useState(initialQ)
  const [dist, setDist] = useState('any')
  const [openNowOnly, setOpenNowOnly] = useState(false)
  const [dealsOnly, setDealsOnly] = useState(false)
  const [sort, setSort] = useState('relevance')
  const [active, setActive] = useState(null)
  const debouncedQ = useDebounce(search, 350)

  const pickCat = (c) => {
    setCat(c)
    setParams(c === 'All' ? {} : { cat: c })
  }

  const { data, loading, error } = useApi(
    () =>
      api.public.businesses({
        cat: cat === 'All' ? undefined : cat,
        q: debouncedQ || undefined,
        dist: dist === 'any' ? undefined : dist,
        openNow: openNowOnly || undefined,
        dealsOnly: dealsOnly || undefined,
        sort,
        limit: 60,
      }),
    [cat, debouncedQ, dist, openNowOnly, dealsOnly, sort]
  )

  const results = loading ? [] : data || []

  return (
    <div className="container page">
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ marginBottom: 6 }}>Explore businesses</h1>
        <p className="muted">Search, filter, and find deals within your neighborhood.</p>
      </div>

      <div className="explore-toolbar">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, category, or address…" />
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
              {loading ? (
                'Searching…'
              ) : (
                <>
                  <strong style={{ color: 'var(--text)' }}>{results.length}</strong> businesses found
                </>
              )}
            </span>
            {active && <span>Showing pins for “{active.name}”</span>}
          </div>
          {loading && <PageLoading text="Loading businesses…" />}
          {!loading && error && <PageError text="Could not load businesses." />}
          {!loading && !error && results.length === 0 && (
            <div className="card">
              <EmptyState
                icon="i-search"
                title="Nothing matched your filters"
                text="Try widening the distance or turning off the &quot;Open now&quot; filter, then searching a different term."
              />
            </div>
          )}
          {!loading &&
            !error &&
            results.map((b) => (
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
                      <span className="muted small">{Number(b.distance || 0).toFixed(1)} mi</span>
                      <span className="small rating-line">
                        <StarRating value={b.rating} size={13} />
                        <span className="avg">{Number(b.rating).toFixed(1)}</span>
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
              style={{ left: `${b.pos?.x || 50}%`, top: `${b.pos?.y || 50}%` }}
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