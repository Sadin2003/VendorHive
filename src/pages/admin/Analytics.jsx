import { useEffect, useState } from 'react'
import StatCard from '../../components/ui/StatCard'
import { AdminAreaChart, AdminBarChart } from './Dashboard'
import { api, csvUrl } from '../../services/api'

const FALLBACK = {
  kpis: [
    { label: 'Total profile views', value: '1.28M', delta: '+24% this quarter' },
    { label: 'Deal redemptions', value: '86,204', delta: '+9% this month' },
    { label: 'Active trippers', value: '6,120', delta: '+412 this week' },
    { label: 'Avg. deal value', value: '$11.42', delta: '+$0.68' },
  ],
  monthlyActive: [],
  weeklySignups: [],
  cats: [],
}

const KPI_META = [
  { icon: 'i-eye', tone: 'green' },
  { icon: 'i-bookmark-o', tone: 'amber' },
  { icon: 'i-users', tone: 'cyan' },
  { icon: 'i-chart', tone: 'red' },
]

export default function Analytics() {
  const [data, setData] = useState(FALLBACK)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.admin
      .analytics()
      .then((res) => { if (active) setData(res.data || FALLBACK) })
      .catch((e) => { if (active) setError(e.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const kpis = (data.kpis && data.kpis.length ? data.kpis : FALLBACK.kpis).map((k, i) => ({
    ...k,
    icon: (KPI_META[i] || {}).icon,
    tone: (KPI_META[i] || {}).tone,
  }))

  const exportCsv = () => {
    window.open(csvUrl('/admin/analytics/export'), '_blank')
  }

  if (loading) {
    return <div className="card card-pad" style={{ textAlign: 'center', paddingBlock: 48 }}>Loading analytics…</div>
  }
  if (error) {
    return <div className="card card-pad" style={{ textAlign: 'center', paddingBlock: 48, color: 'var(--danger-2)' }}>Failed to load: {error}</div>
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Analytics</h1>
          <p>Platform-wide health, from signups to saves.</p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <span className="badge badge-gray">Live</span>
          <button type="button" className="btn btn-outline btn-sm" onClick={exportCsv}>Export CSV</button>
        </div>
      </div>

      <div className="grid grid-4">
        {kpis.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 30 }}>
        <div className="card card-pad">
          <h4 style={{ margin: '0 0 4px' }}>Member growth</h4>
          <p className="small muted" style={{ margin: 0 }}>Active monthly members</p>
          <AdminAreaChart data={data.monthlyActive} />
        </div>
        <div className="card card-pad">
          <h4 style={{ margin: '0 0 4px' }}>New member signups</h4>
          <p className="small muted" style={{ margin: 0 }}>Weekly new accounts</p>
          <AdminBarChart data={data.weeklySignups} />
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 20 }}>
        <h4 style={{ margin: '0 0 16px' }}>Top categories by deal saves</h4>
        {data.cats.map((r) => (
          <div key={r.c} className="row" style={{ gap: 12, padding: '6px 0' }}>
            <span className="small bold" style={{ width: 160 }}>{r.c}</span>
            <div className="progress grow"><i style={{ width: `${r.pct}%` }} /></div>
            <span className="tiny muted" style={{ width: 70, textAlign: 'right' }}>
              {r.deals} deals · {r.saves.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
