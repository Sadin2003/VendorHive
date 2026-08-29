import { Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import StarRating from '../../components/ui/StarRating'

const STATS = [
  { icon: 'i-eye', tone: 'green', label: 'Profile views (30d)', value: '12,480', delta: '+18% vs last month' },
  { icon: 'i-bookmark-o', tone: 'amber', label: 'Deal saves (30d)', value: '2,914', delta: '+11% vs last month' },
  { icon: 'i-tag', tone: 'cyan', label: 'Active deals', value: '3', delta: '2 live + 1 scheduled' },
  { icon: 'i-star', tone: 'red', label: 'Average rating', value: '4.8', delta: '214 reviews' },
]

const DEALS = [
  { id: 'd1', title: 'BOGO any signature brew after 3pm', status: 'active', views: 4210, saves: 1180, end: 'Sep 6' },
  { id: 'd7', title: 'Bundle: cappuccino + croissant duo for $9', status: 'active', views: 5120, saves: 1734, end: 'Sep 10' },
  { id: 'd11', title: 'Monday happy-hour latte special', status: 'scheduled', views: 0, saves: 0, end: 'Sep 12' },
]

const REVIEWS = [
  { id: 'r1', user: 'Aisha K.', rating: 5, date: '2 days ago', text: 'The oat-latte-cold-drip combo is unreal. Baristas remember my order every single morning.' },
  { id: 'r2', user: 'Marcus T.', rating: 5, date: '1 week ago', text: 'Cozy spot, great WiFi, and the bundled deal with Sunflower is the best value on the block.' },
  { id: 'r3', user: 'Priya N.', rating: 4, date: '3 weeks ago', text: 'Lovely roastery smell when you walk in. Gets busy after 5pm on Thursdays.' },
]

export default function MerchantDashboard() {
  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Good afternoon, Maya</h1>
          <p>Here's how Bean & Leaf performed this month.</p>
        </div>
        <Button to="/merchant/deals/new" variant="primary"><Icon name="i-plus" size={15} /> New deal</Button>
      </div>

      <div className="grid grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="section-head" style={{ marginTop: 34 }}>
        <div>
          <h2>Recent deals</h2>
        </div>
        <Link to="/merchant/deals" className="section-link">Manage deals →</Link>
      </div>
      <div className="card">
        {DEALS.map((d) => (
          <div key={d.id} className="row" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div className="grow">
              <Link to={`/merchant/deals/${d.id}/edit`} style={{ color: 'inherit', fontWeight: 700 }}>{d.title}</Link>
              <div className="small muted">Ends {d.end} · {d.views.toLocaleString()} views · {d.saves.toLocaleString()} saves</div>
            </div>
            <Badge tone={d.status === 'active' ? 'green' : 'cyan'}>{d.status}</Badge>
          </div>
        ))}
      </div>

      <div className="section-head" style={{ marginTop: 34 }}>
        <div>
          <h2>Recent reviews</h2>
        </div>
        <Link to="/merchant/reviews" className="section-link">View all reviews →</Link>
      </div>
      <div className="col" style={{ gap: 14 }}>
        {REVIEWS.map((r) => (
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
                <span className="badge badge-green">Verified</span>
              </div>
            </div>
            <p style={{ margin: 0 }}>{r.text}</p>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ display: 'grid', gap: 20, marginTop: 34 }}>
        <div className="card" style={{ padding: 22, background: 'var(--primary-800)', border: 'none' }}>
          <div className="row" style={{ gap: 12, marginBottom: 10 }}>
            <Icon name="i-megaphone" size={22} style={{ color: 'var(--amber)' }} />
            <h4 style={{ color: '#fff', margin: 0 }}>Launch a cross-promotion</h4>
          </div>
          <p className="small" style={{ color: '#bed0c4', marginBottom: 16 }}>
            Partner with Sunflower Bakehouse or another neighbor — their customers become yours.
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