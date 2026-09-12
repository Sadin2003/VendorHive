import { Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import StarRating from '../../components/ui/StarRating'
import { PageLoading, PageError } from '../../components/ui/Loading'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'

export default function MerchantDashboard() {
  const { data, loading, error } = useApi(() => api.merchant.dashboard(), [], [])

  if (loading) return <div className="card card-pad"><PageLoading text="Loading dashboard…" /></div>
  if (error) return <PageError text="Could not load dashboard." />
  if (!data) return null

  const { user: org, stats, deals, reviews } = data

  const STATS = [
    { icon: 'i-eye', tone: 'green', label: 'Profile views (30d)', value: (stats.views30d || 0).toLocaleString() },
    { icon: 'i-bookmark-o', tone: 'amber', label: 'Deal saves (30d)', value: (stats.saves30d || 0).toLocaleString() },
    { icon: 'i-tag', tone: 'cyan', label: 'Active deals', value: String(stats.activeDeals || 0) },
    { icon: 'i-star', tone: 'red', label: 'Average rating', value: (stats.avgRating || 0).toFixed(1), delta: `${stats.reviewsCount || 0} reviews` },
  ]

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Good day, {org?.name || 'Merchant'}</h1>
          <p>Here's how {org?.name || 'your business'} performed this month.</p>
        </div>
        <Button to="/merchant/deals/new" variant="primary"><Icon name="i-plus" size={15} /> New deal</Button>
      </div>

      <div className="grid grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {Array.isArray(deals) && deals.length > 0 && (
        <>
          <div className="section-head" style={{ marginTop: 34 }}>
            <div>
              <h2>Recent deals</h2>
            </div>
            <Link to="/merchant/deals" className="section-link">Manage deals →</Link>
          </div>
          <div className="card">
            {deals.slice(0, 5).map((d) => (
              <div key={d.id} className="row" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <div className="grow">
                  <Link to={`/merchant/deals/${d.id}/edit`} style={{ color: 'inherit', fontWeight: 700 }}>{d.title}</Link>
                  <div className="small muted">Ends {d.end} · {d.views.toLocaleString()} views · {d.saves.toLocaleString()} saves</div>
                </div>
                <Badge tone={d.status === 'active' ? 'green' : d.status === 'scheduled' ? 'cyan' : d.status === 'draft' ? 'gray' : 'red'}>{d.status}</Badge>
              </div>
            ))}
          </div>
        </>
      )}

      {Array.isArray(reviews) && reviews.length > 0 && (
        <>
          <div className="section-head" style={{ marginTop: 34 }}>
            <div>
              <h2>Recent reviews</h2>
            </div>
            <Link to="/merchant/reviews" className="section-link">View all reviews →</Link>
          </div>
          <div className="col" style={{ gap: 14 }}>
            {reviews.slice(0, 3).map((r) => (
              <div key={r.id} className="card card-pad">
                <div className="row-between" style={{ marginBottom: 8 }}>
                  <div className="row">
                    <Avatar text={r.user} size="sm" />
                    <div>
                      <div className="bold small">{r.user}</div>
                      <span className="muted tiny">{r.date}</span>
                    </div>
                  </div>
                  <div className="row" style={{ gap: 8 }}>
                    <StarRating value={r.rating} size={13} />
                    {r.moderation === 'kept' && <Badge tone="green">Verified</Badge>}
                  </div>
                </div>
                <p style={{ margin: 0 }}>{r.text}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="grid-2" style={{ display: 'grid', gap: 20, marginTop: 34 }}>
        <div className="card" style={{ padding: 22, background: 'var(--primary-800)', border: 'none' }}>
          <div className="row" style={{ gap: 12, marginBottom: 10 }}>
            <Icon name="i-megaphone" size={22} style={{ color: 'var(--amber)' }} />
            <h4 style={{ color: '#fff', margin: 0 }}>Launch a cross-promotion</h4>
          </div>
          <p className="small" style={{ color: '#bed0c4', marginBottom: 16 }}>
            Partner with a complementary shop nearby — their customers become yours.
          </p>
          <Button to="/merchant/promotions/new" variant="amber" size="sm">Create promotion</Button>
        </div>
        <div className="card card-pad">
          <h4 style={{ marginBottom: 10 }}>Quick tips</h4>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.86rem', color: 'var(--text-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Deals with a "bundle" tag save 2.3× more than solo offers.</li>
            <li>Update your cover photo — profiles with fresh images get +34% views.</li>
            <li>Reply to reviews within 24h to boost your trust score.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}