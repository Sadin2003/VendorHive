import { Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import DealCard from '../../components/cards/DealCard'
import BusinessCard from '../../components/cards/BusinessCard'
import Avatar from '../../components/ui/Avatar'
import { PageLoading, PageError } from '../../components/ui/Loading'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'
import { useSavedDeals } from '../../utils/useSavedDeals'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function CustomerDashboard() {
  const { data, loading, error } = useApi(() => api.me.dashboard())
  const { toggle, contains } = useSavedDeals()

  if (loading) return <PageLoading text="Loading your dashboard…" />
  if (error || !data) return <PageError text="Could not load your dashboard." />

  const stats = data.user?.stats || {}

  return (
    <div>
      <div className="card card-pad" style={{ marginBottom: 26, background: 'var(--primary-800)', border: 'none' }}>
        <div className="row-between" style={{ flexWrap: 'wrap', gap: 14 }}>
          <div className="row">
            <Avatar text={data.user?.name || 'Member'} size="lg" gradient="linear-gradient(135deg,#3c6b4f,#d9a878)" />
            <div>
              <div className="small" style={{ color: '#b9c9bf' }}>{greeting()},</div>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.5rem' }}>{data.user?.name || 'there'}</h2>
            </div>
          </div>
          <div className="row" style={{ gap: 22 }}>
            <div><b style={{ color: '#fff', fontSize: '1.3rem', display: 'block' }}>{stats.saved ?? 0}</b><span style={{ color: '#9fb2a6', fontSize: '0.8rem' }}>deals saved</span></div>
            <div><b style={{ color: '#fff', fontSize: '1.3rem', display: 'block' }}>{stats.following ?? 0}</b><span style={{ color: '#9fb2a6', fontSize: '0.8rem' }}>following</span></div>
            <div><b style={{ color: '#fff', fontSize: '1.3rem', display: 'block' }}>{stats.reviews ?? 0}</b><span style={{ color: '#9fb2a6', fontSize: '0.8rem' }}>reviews</span></div>
          </div>
        </div>
      </div>

      <div className="section-head">
        <div>
          <h2>Recommended for you</h2>
          <p>Tailored from the categories you save most</p>
        </div>
        <Link to="/deals" className="section-link">See all deals →</Link>
      </div>
      {data.recommended?.length ? (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {data.recommended.map((d) => (
            <DealCard key={d.id} deal={d} saved={contains(d.id)} onSave={toggle} />
          ))}
        </div>
      ) : (
        <p className="muted small" style={{ padding: '8px 0' }}>Save a few deals and we'll start recommending more.</p>
      )}

      <div className="section-head" style={{ marginTop: 40 }}>
        <div>
          <h2>Nearby businesses</h2>
          <p>Top-rated spots around your neighborhood</p>
        </div>
        <Link to="/explore" className="section-link">Open map →</Link>
      </div>
      {data.nearby?.length ? (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {data.nearby.slice(0, 4).map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      ) : (
        <p className="muted small" style={{ padding: '8px 0' }}>No businesses nearby yet.</p>
      )}

      <div className="section-head" style={{ marginTop: 40 }}>
        <div>
          <h2>Recent activity</h2>
          <p>Everything happening in your hive</p>
        </div>
        <Link to="/account/notifications" className="section-link">Notifications →</Link>
      </div>
      {data.activity?.length ? (
        <div className="card">
          {data.activity.map((a, i) => (
            <div key={i} className="notif">
              <span className="n-icon" style={{ background: a.tone?.bg, color: a.tone?.c }}>
                <Icon name={a.icon} />
              </span>
              <span className="n-text" dangerouslySetInnerHTML={{ __html: a.text }} />
              <span className="n-time">{a.time}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="card card-pad">
          <p className="muted small" style={{ margin: 0 }}>No activity yet — follow a business or save a deal to get started.</p>
        </div>
      )}

      <div className="section" style={{ marginTop: 34 }}>
        <Button to="/explore" variant="outline">
          <Icon name="i-search" size={16} />
          Discover more local businesses
        </Button>
      </div>
    </div>
  )
}