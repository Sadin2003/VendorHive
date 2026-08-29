import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import { api } from '../../services/api'

const EMPTY = { members: 0, businesses: 0, pendingVerification: 0, flaggedReviews: 0, weeklySignups: [], monthlyActive: [], recentPending: [], recentFlagged: [] }

export function AdminAreaChart({ data = [], lmax } = {}) {
  const LINE = data.length ? data : [30, 46, 38, 62, 55, 74, 68, 92, 84, 110, 98, 126]
  const LMAX = lmax || 140
  const w = 460, h = 130
  const points = LINE.map((v, i) => `${(i / (LINE.length - 1)) * (w - 10) + 5},${h - (v / LMAX) * h + 4}`).join(' ')
  const last = LINE[LINE.length - 1]
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Active members, last 12 months" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="areafill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3c6b4f" stopOpacity=".32" />
          <stop offset="100%" stopColor="#3c6b4f" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="0" x2={w} y1={h - i * (h / 3)} y2={h - i * (h / 3)} stroke="#e8e3d9" strokeWidth="1" />
      ))}
      <polygon points={`5,${h + 2} ${points} ${w - 5},${h + 2}`} fill="url(#areafill)" />
      <polyline points={points} fill="none" stroke="#3c6b4f" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={w - 5} cy={h - (last / LMAX) * h + 4} r="4" fill="#3c6b4f" />
    </svg>
  )
}

export function AdminBarChart({ data = [] } = {}) {
  const BARS = data.length ? data : [42, 68, 55, 74, 88, 61, 96, 78, 112, 90, 104]
  const max = Math.max(...BARS)
  const w = 460, h = 120, bw = (w - 40) / BARS.length
  return (
    <svg viewBox={`0 0 ${w} ${h + 20}`} role="img" aria-label="Weekly signups" style={{ width: '100%', height: 'auto', display: 'block' }}>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="0" x2={w} y1={h - i * (h / 3)} y2={h - i * (h / 3)} stroke="#e8e3d9" strokeWidth="1" />
      ))}
      {BARS.map((v, i) => (
        <g key={i}>
          <rect x={20 + i * bw} y={h - (v / max) * h} width={bw - 8} height={(v / max) * h} rx="5" fill={i === BARS.length - 1 ? '#3d6b50' : '#b9cfc0'} />
        </g>
      ))}
    </svg>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.admin
      .stats()
      .then((res) => { if (active) setStats(res.data || EMPTY) })
      .catch((e) => { if (active) setError(e.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const lineMax = Math.max(140, ...(stats.monthlyActive || []))

  const STATS = [
    { icon: 'i-users', tone: 'green', label: 'Members', value: (stats.members || 0).toLocaleString(), delta: 'Registered members' },
    { icon: 'i-store', tone: 'cyan', label: 'Businesses', value: (stats.businesses || 0).toLocaleString(), delta: 'Total listings' },
    { icon: 'i-shield', tone: 'amber', label: 'Pending verification', value: (stats.pendingVerification || 0).toString(), delta: 'Awaiting review' },
    { icon: 'i-tag', tone: 'red', label: 'Flagged reviews', value: (stats.flaggedReviews || 0).toString(), delta: 'In queue' },
  ]

  if (loading) {
    return <div className="card card-pad" style={{ textAlign: 'center', paddingBlock: 48 }}>Loading dashboard…</div>
  }
  if (error) {
    return <div className="card card-pad" style={{ textAlign: 'center', paddingBlock: 48, color: 'var(--danger-2)' }}>Failed to load dashboard: {error}</div>
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Community pulse</h1>
          <p>Live overview of the VendorHive community.</p>
        </div>
        <Button to="/admin/analytics" variant="outline"><Icon name="i-chart" size={15} /> Full analytics</Button>
      </div>

      <div className="grid grid-4">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 30 }}>
        <div className="card card-pad">
          <div className="row-between" style={{ marginBottom: 4 }}>
            <h4 style={{ margin: 0 }}>Active members</h4>
            <span className="badge badge-green">Live</span>
          </div>
          <p className="small muted">Monthly active members · last 12 months</p>
          <AdminAreaChart data={stats.monthlyActive} lmax={lineMax} />
        </div>
        <div className="card card-pad">
          <div className="row-between" style={{ marginBottom: 4 }}>
            <h4 style={{ margin: 0 }}>Weekly signups</h4>
            <span className="badge badge-gray">7 days</span>
          </div>
          <p className="small muted">New members joined this week</p>
          <AdminBarChart data={stats.weeklySignups} />
        </div>
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 20 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="row-between" style={{ padding: '18px 20px 12px' }}>
            <h4 style={{ margin: 0, fontSize: '1rem' }}>Verification queue</h4>
            <Link to="/admin/verification" className="section-link">Review all →</Link>
          </div>
          {stats.recentPending.length === 0 ? (
            <p className="muted small" style={{ padding: '16px 20px' }}>No pending applications.</p>
          ) : stats.recentPending.map((m) => (
            <div key={m.id} className="row" style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
              <div className="grow">
                <div className="bold small">{m.name}</div>
                <span className="tiny muted">{m.owner} · {m.cat}</span>
              </div>
              <div className="col" style={{ alignItems: 'flex-end', gap: 2 }}>
                <Badge tone={m.wait && m.wait.includes('d ') ? 'red' : 'amber'}>{m.wait}</Badge>
                <span className="tiny muted">docs {m.r}</span>
              </div>
            </div>
          ))}
          <div className="row" style={{ padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
            <Button to="/admin/verification" variant="ghost" size="sm" className="grow"><Icon name="i-arrow-right" size={14} /> Open the queue</Button>
          </div>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="row-between" style={{ padding: '18px 20px 12px' }}>
            <h4 style={{ margin: 0, fontSize: '1rem' }}>Moderation queue</h4>
            <Link to="/admin/reviews" className="section-link">Approve / flag →</Link>
          </div>
          {stats.recentFlagged.length === 0 ? (
            <p className="muted small" style={{ padding: '16px 20px' }}>No flagged reviews.</p>
          ) : stats.recentFlagged.map((f) => (
            <div key={f.id} className="row" style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
              <Avatar text={f.user} size="sm" />
              <div className="grow">
                <div className="bold small">{f.business}</div>
                <span className="tiny muted">{f.reason} · by {f.user}</span>
              </div>
              <Badge tone={f.risk === 'high' ? 'red' : 'amber'}>{f.risk}</Badge>
            </div>
          ))}
          <div className="row" style={{ padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
            <Button to="/admin/reviews" variant="ghost" size="sm" className="grow"><Icon name="i-arrow-right" size={14} /> Open moderation</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
