import { useMemo, useState } from 'react'
import SearchInput from '../../components/ui/SearchInput'
import DealCard from '../../components/cards/DealCard'
import Icon from '../../components/ui/Icon'
import EmptyState from '../../components/ui/EmptyState'

const DEALS = [
  { id: 'd1', merchant: 'Bean & Leaf', category: 'Cafés', title: 'BOGO any signature brew after 3pm', tag: 'BOGO', discount: 'Buy 1 Get 1', views: 4210, saves: 1180, expiresIn: '6 days left' },
  { id: 'd2', merchant: 'Ember & Oak Grill', category: 'Restaurants', title: '20% off the Tuesday steak night menu', tag: '20% OFF', discount: '20% off', views: 3310, saves: 940, expiresIn: '3 days left' },
  { id: 'd3', merchant: 'Sunflower Bakehouse', category: 'Bakeries', title: 'Free dozen rolls with any custom cake order', tag: 'FREE', discount: 'Free dozen rolls', views: 2140, saves: 610, expiresIn: '10 days left' },
  { id: 'd4', merchant: 'Hearth & Thread', category: 'Clothing', title: '$15 off any purchase over $75', tag: '$15 OFF', discount: '$15 off', views: 1580, saves: 445, expiresIn: '5 days left' },
  { id: 'd5', merchant: 'Volt City Repairs', category: 'Electronics', title: 'Free diagnostics with any repair over $50', tag: 'FREE', discount: 'Free check-up', views: 1890, saves: 520, expiresIn: '9 days left' },
  { id: 'd6', merchant: 'The Copper Studio', category: 'Services', title: '15% off your first cut + free beard trim', tag: '15% OFF', discount: '15% off', views: 2475, saves: 703, expiresIn: '12 days left' },
  { id: 'd7', merchant: 'Bean & Leaf × Sunflower Bakehouse', category: 'Cafés', title: 'Bundle: cappuccino + croissant duo for $9', tag: 'BUNDLE', discount: '$9 duo', views: 5120, saves: 1734, expiresIn: '7 days left' },
  { id: 'd8', merchant: 'Daily Grind Gym', category: 'Services', title: 'Two-week trial membership + free training session', tag: 'TRIAL', discount: '2-week trial', views: 3090, saves: 866, expiresIn: '14 days left' },
  { id: 'd9', merchant: 'Glow & Grace Spa', category: 'Health & Beauty', title: '25% off the seasonal body ritual package', tag: '25% OFF', discount: '25% off', views: 1720, saves: 488, expiresIn: '8 days left' },
  { id: 'd10', merchant: 'Petal & Stem Florist', category: 'Gifts & Local', title: '10% off local bouquet deliveries this weekend', tag: '10% OFF', discount: '10% off', views: 940, saves: 231, expiresIn: '4 days left' },
]

const CATS = ['All', 'Cafés', 'Restaurants', 'Bakeries', 'Clothing', 'Electronics', 'Services', 'Health & Beauty', 'Gifts & Local']

const SORTS = ['Newest', 'Most saved', 'Most viewed', 'Expiring soon']

export default function DealsFeed() {
  const [cat, setCat] = useState('All')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('Most saved')

  const list = useMemo(() => {
    let l = DEALS.filter((d) => {
      if (cat !== 'All' && d.category !== cat) return false
      if (q && !`${d.title} ${d.merchant} ${d.category}`.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
    const order = {
      'Most saved': (a, b) => b.saves - a.saves,
      'Most viewed': (a, b) => b.views - a.views,
      'Expiring soon': (a, b) => (a.expiresIn.match(/\d+/) || [99])[0] - (b.expiresIn.match(/\d+/) || [99])[0],
    }[sort]
    return [...l].sort(order)
  }, [cat, q, sort])

  return (
    <div className="container page">
      <div style={{ marginBottom: 24, maxWidth: 640 }}>
        <span className="badge badge-amber" style={{ marginBottom: 12 }}>🔥 {DEALS.reduce((a, d) => a + d.saves, 0).toLocaleString()} saves this week</span>
        <h1 style={{ marginTop: 10, marginBottom: 6 }}>Deals feed</h1>
        <p className="muted">Fresh local offers from verified merchants — including co-op bundles between neighbors.</p>
      </div>

      <div className="explore-toolbar">
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search deals…" />
        <label className="select" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, width: 'auto', padding: '9px 14px', cursor: 'pointer' }}>
          <Icon name="i-filter" size={15} style={{ color: 'var(--text-muted)' }} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ border: 'none', background: 'none', fontWeight: 600, color: 'var(--text)', cursor: 'pointer' }}
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {s}
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

      {list.length === 0 ? (
        <div className="card">
          <EmptyState icon="i-tag" title="No deals yet" text="We couldn't find a match for that search. Try another category or keyword." />
        </div>
      ) : (
        <div className="grid grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {list.map((d) => (
            <DealCard key={d.id} deal={d} />
          ))}
        </div>
      )}
    </div>
  )
}