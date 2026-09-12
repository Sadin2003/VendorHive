import Icon from '../../components/ui/Icon'
import StatCard from '../../components/ui/StatCard'
import { AdminAreaChart, AdminBarChart } from './Dashboard'
import { PageLoading, PageError } from '../../components/ui/Loading'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'
import { useToast } from '../../components/ui/useToast'

function escapeCell(v) {
  const s = String(v ?? '')
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function downloadCsv(rows, filename) {
  const csv = rows.map((r) => r.map(escapeCell).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function Analytics() {
  const toast = useToast()
  const { data, loading, error } = useApi(
    () => Promise.all([api.admin.analytics(), api.admin.dashboard()]),
    [],
    null
  )

  if (loading) return <div className="card card-pad"><PageLoading text="Loading analytics…" /></div>
  if (error) return <PageError text="Could not load analytics." />
  if (!data) return null

  const [analytics, dashboard] = data

  const exportCsv = () => {
    const rows = [
      ['section', 'label', 'value', 'delta'],
      ...(analytics.kpis || []).map((k) => ['kpi', k.label, k.value, k.delta || '']),
      ['category', 'deals', 'saves'],
      ...(analytics.categories || []).map((c) => ['category:' + c.c, c.deals, c.saves]),
      ['growth', 'members'],
      ...((dashboard.growth || []).map((v, i) => ['month:' + (i + 1) + '-' + (i + 12), v])),
      ['signups', 'members'],
      ...((dashboard.signups || []).map((v, i) => ['week:' + (i + 1), v])),
    ]
    downloadCsv(rows, `vendorhive-analytics-${new Date().toISOString().slice(0, 10)}.csv`)
    toast('Analytics exported as CSV')
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Analytics</h1>
          <p>Platform-wide health, from signups to saves.</p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <span className="badge badge-gray">Last 12 months</span>
          <button type="button" className="btn btn-outline btn-sm" onClick={exportCsv}>
            <Icon name="i-download" size={13} style={{ verticalAlign: -2, marginRight: 4 }} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-4">
        {(analytics.kpis || []).map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 30 }}>
        <div className="card card-pad">
          <h4 style={{ margin: '0 0 4px' }}>Member growth</h4>
          <p className="small muted" style={{ margin: 0 }}>Active monthly members</p>
          <AdminAreaChart data={dashboard.growth} />
        </div>
        <div className="card card-pad">
          <h4 style={{ margin: '0 0 4px' }}>New member signups</h4>
          <p className="small muted" style={{ margin: 0 }}>Weekly new accounts</p>
          <AdminBarChart data={dashboard.signups} />
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 20 }}>
        <h4 style={{ margin: '0 0 16px' }}>Top categories by deal saves</h4>
        {(analytics.categories || []).length === 0 ? (
          <p className="muted small" style={{ margin: 0 }}>No deal data yet.</p>
        ) : (
          (analytics.categories || []).map((r) => (
            <div key={r.c} className="row" style={{ gap: 12, padding: '6px 0' }}>
              <span className="small bold" style={{ width: 160 }}>{r.c}</span>
              <div className="progress grow"><i style={{ width: `${r.pct}%` }} /></div>
              <span className="tiny muted" style={{ width: 90, textAlign: 'right' }}>
                {r.deals} deals · {r.saves.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}