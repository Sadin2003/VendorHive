import StatCard from '../../components/ui/StatCard'
import { AdminAreaChart, AdminBarChart } from './Dashboard'

const KPIS = [
  { icon: 'i-eye', tone: 'green', label: 'Total profile views', value: '1.28M', delta: '+24% this quarter' },
  { icon: 'i-bookmark-o', tone: 'amber', label: 'Deal redemptions', value: '86,204', delta: '+9% this month' },
  { icon: 'i-users', tone: 'cyan', label: 'Active trippers', value: '6,120', delta: '+412 this week' },
  { icon: 'i-chart', tone: 'red', label: 'Avg. deal value', value: '$11.42', delta: '+$0.68' },
]

const CATS = [
  { c: 'Cafés', deals: 214, saves: 38120, pct: 100 },
  { c: 'Bakeries', deals: 168, saves: 27410, pct: 74 },
  { c: 'Restaurants', deals: 155, saves: 22150, pct: 41 },
  { c: 'Health & Beauty', deals: 121, saves: 16080, pct: 30 },
  { c: 'Gifts & Local', deals: 98, saves: 12750, pct: 22 },
]

export default function Analytics() {
  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Analytics</h1>
          <p>Platform-wide health, from signups to saves.</p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <span className="badge badge-gray">Last 12 months</span>
          <button type="button" className="btn btn-outline btn-sm">Export CSV</button>
        </div>
      </div>

      <div className="grid grid-4">
        {KPIS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 30 }}>
        <div className="card card-pad">
          <h4 style={{ margin: '0 0 4px' }}>Member growth</h4>
          <p className="small muted" style={{ margin: 0 }}>Active monthly members</p>
          <AdminAreaChart />
        </div>
        <div className="card card-pad">
          <h4 style={{ margin: '0 0 4px' }}>New member signups</h4>
          <p className="small muted" style={{ margin: 0 }}>Weekly new accounts</p>
          <AdminBarChart />
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 20 }}>
        <h4 style={{ margin: '0 0 16px' }}>Top categories by deal saves</h4>
        {CATS.map((r) => (
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