import { useState } from 'react'
import SearchInput from '../../components/ui/SearchInput'
import DealCard from '../../components/cards/DealCard'
import Icon from '../../components/ui/Icon'
import EmptyState from '../../components/ui/EmptyState'
import { PageLoading, PageError } from '../../components/ui/Loading'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'
import { useSavedDeals } from '../../utils/useSavedDeals'

const CATS = ['All', 'Cafés', 'Restaurants', 'Bakeries', 'Clothing', 'Electronics', 'Services', 'Health & Beauty', 'Gifts & Local']

const SORTS = [
  { id: 'saves', label: 'Most saved' },
  { id: 'newest', label: 'Newest' },
  { id: 'views', label: 'Most viewed' },
  { id: 'expiring', label: 'Expiring soon' },
]

export default function DealsFeed() {
  const [cat, setCat] = useState('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('saves')
  const { toggle, contains } = useSavedDeals()

  const { data, loading, error } = useApi(
    () =>
      api.public.deals({
        q: search || undefined,
        cat: cat === 'All' ? undefined : cat,
        sort,
        limit: 60,
      }),
    [cat, search, sort]
  )

  const deals = loading ? [] : data || []
  const totalSaves = deals.reduce((a, d) => a + (d.saves || 0), 0)

  return (
    <div className="container page">
      <div style={{ marginBottom: 24, maxWidth: 640 }}>
        <span className="badge badge-amber" style={{ marginBottom: 12 }}>🔥 {totalSaves.toLocaleString()} saves this week</span>
        <h1 style={{ marginTop: 10, marginBottom: 6 }}>Deals feed</h1>
        <p className="muted">Fresh local offers from verified merchants — including co-op bundles between neighbors.</p>
      </div>

      <div className="explore-toolbar">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search deals…" />
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

      <div className="explore-filters" style={{ marginBottom: 24 }}>
        {CATS.map((c) => (
          <button key={c} type="button" className={`pill ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      {loading && <PageLoading text="Loading deals…" />}
      {!loading && error && <PageError text="Could not load deals." />}
      {!loading && !error && deals.length === 0 && (
        <div className="card">
          <EmptyState icon="i-tag" title="No deals yet" text="We couldn't find a match for that search. Try another category or keyword." />
        </div>
      )}
      {!loading && !error && (
        <div className="grid grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {deals.map((d) => (
            <DealCard key={d.id} deal={d} saved={contains(d.id)} onSave={toggle} />
          ))}
        </div>
      )}
    </div>
  )
}