import { Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import { PageLoading, PageError } from '../../components/ui/Loading'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'

export function AdminAreaChart({ data }) {
  const vals = data && data.length ? data : [1, 1]
  const w = 460, h = 130
  const lmax = Math.max(...vals)
  const points = vals.map((v, i) => `${(i / (vals.length - 1)) * (w - 10) + 5},${h - (v / lmax) * h + 4}`).join(' ')
  const last = vals[vals.length - 1]
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
      <circle cx={w - 5} cy={h - (last / lmax) * h + 4} r="4" fill="#3c6b4f" />
    </svg>
  )
}

export function AdminBarChart({ data }) {
  const vals = data && data.length ? data : [1, 1]
  const max = Math.max(...vals)
  const w = 460, h = 120, bw = (w - 40) / vals.length
  return (
    <svg viewBox={`0 0 ${w} ${h + 20}`} role="img" aria-label="Weekly signups" style={{ width: '100%', height: 'auto', display: 'block' }}>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="0" x2={w} y1={h - i * (h / 3)} y2={h - i * (h / 3)} stroke="#e8e3d9" strokeWidth="1" />
      ))}
      {vals.map((v, i) => (
        <g key={i}>
          <rect x={20 + i * bw} y={h - (v / max) * h} width={bw - 8} height={(v / max) * h} rx="5" fill={i === vals.length - 1 ? '#3d6b50' : '#b9cfc0'} />
        </g>
      ))}
    </svg>
  )
}

export default function AdminDashboard() {
  const { data, loading, error } = useApi(() => api.admin.dashboard(), [], [])

  if (loading) return <div className="card card-pad"><PageLoading text="Loading dashboard…" /></div>
  if (error) return <PageError text="Could not load dashboard." />
  if (!data) return null

  const flaggedTone = (risk) => (risk === 'high' ? 'red' : 'amber')
  const waitTone = (wait) => (wait.endsWith('d') ? 'red' : 'amber')

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Community pulse</h1>
          <p>Platform-wide health across the whole community.</p>
        </div>
        <Button to="/admin/analytics" variant="outline"><Icon name="i-chart" size={15} /> Full analytics</Button>
      </div>

      <div className="grid grid-4">
        {(data.stats || []).map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 30 }}>
        <div className="card card-pad">
          <div className="row-between" style={{ marginBottom: 4 }}>
            <h4 style={{ margin: 0 }}>Active members</h4>
            <span className="badge badge-green">Last 12 months</span>
          </div>
          <p className="small muted">Cumulative members · {data.growth?.length} months</p>
          <AdminAreaChart data={data.growth} />
        </div>
        <div className="card card-pad">
          <div className="row-between" style={{ marginBottom: 4 }}>
            <h4 style={{ margin: 0 }}>Weekly signups</h4>
            <span className="badge badge-gray">{data.signups?.length} weeks</span>
          </div>
          <p className="small muted">New members per week</p>
          <AdminBarChart data={data.signups} />
        </div>
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 20 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="row-between" style={{ padding: '18px 20px 12px' }}>
            <h4 style={{ margin: 0, fontSize: '1rem' }}>Verification queue</h4>
            <Link to="/admin/verification" className="section-link">Review all →</Link>
          </div>
          {(data.pendingVerification || []).length === 0 ? (
            <p className="muted small" style={{ padding: '16px 20px', margin: 0 }}>Queue cleared.</p>
          ) : (
            (data.pendingVerification || []).map((m) => (
              <div key={m.name} className="row" style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
                <div className="grow">
                  <div className="bold small">{m.name}</div>
                  <span className="tiny muted">{m.owner} · {m.cat}</span>
                </div>
                <div className="col" style={{ alignItems: 'flex-end', gap: 2 }}>
                  <Badge tone={waitTone(m.wait)}>{m.wait}</Badge>
                  <span className="tiny muted">docs {m.r}</span>
                </div>
              </div>
            ))
          )}
          <div className="row" style={{ padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
            <Button to="/admin/verification" variant="ghost" size="sm" className="grow"><Icon name="i-arrow-right" size={14} /> Open the queue</Button>
          </div>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="row-between" style={{ padding: '18px 20px 12px' }}>
            <h4 style={{ margin: 0, fontSize: '1rem' }}>Moderation queue</h4>
            <Link to="/admin/reviews" className="section-link">Approve / flag →</Link>
          </div>
          {(data.flaggedReviews || []).length === 0 ? (
            <p className="muted small" style={{ padding: '16px 20px', margin: 0 }}>Nothing flagged right now.</p>
          ) : (
            (data.flaggedReviews || []).map((f, i) => (
              <div key={i} className="row" style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
                <Avatar text={f.user} size="sm" />
                <div className="grow">
                  <div className="bold small">{f.business}</div>
                  <span className="tiny muted">{f.reason} · by {f.user}</span>
                </div>
                <Badge tone={flaggedTone(f.risk)}>{f.risk}</Badge>
              </div>
            ))
          )}
          <div className="row" style={{ padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
            <Button to="/admin/reviews" variant="ghost" size="sm" className="grow"><Icon name="i-arrow-right" size={14} /> Open moderation</Button>
          </div>
        </div>
      </div>
    </div>
  )
}