import { useMemo, useState } from 'react'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { useToast } from '../../components/ui/useToast'

const INITIAL = [
  { id: 'd1', title: 'BOGO any signature brew after 3pm', status: 'active', views: 4210, saves: 1180, start: 'Aug 12', end: 'Sep 6' },
  { id: 'd7', title: 'Bundle: cappuccino + croissant duo for $9', status: 'active', views: 5120, saves: 1734, start: 'Aug 10', end: 'Sep 10' },
  { id: 'd11', title: 'Monday happy-hour latte special', status: 'scheduled', views: 0, saves: 0, start: 'Sep 12', end: 'Oct 12' },
  { id: 'd12', title: 'First-visit 10% off loyalty card', status: 'draft', views: 0, saves: 0, start: '—', end: '—' },
  { id: 'd13', title: 'Back-to-school cold brew bucket', status: 'expired', views: 3180, saves: 640, start: 'Jun 1', end: 'Jul 31' },
]

const STATUS_TONE = { active: 'green', scheduled: 'cyan', draft: 'gray', expired: 'red' }

const FILTERS = ['All', 'Active', 'Scheduled', 'Draft', 'Expired']

export default function DealsManagement() {
  const [deals, setDeals] = useState(INITIAL)
  const [filter, setFilter] = useState('All')
  const toast = useToast()

  const list = useMemo(
    () => deals.filter((d) => filter === 'All' || d.status === filter.toLowerCase()),
    [deals, filter]
  )

  const expire = (id) => {
    setDeals((ds) => ds.map((d) => (d.id === id ? { ...d, status: 'expired', end: 'Today' } : d)))
    toast('Deal expired')
  }
  const del = (id) => {
    setDeals((ds) => ds.filter((d) => d.id !== id))
    toast('Deal deleted')
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Deal management</h1>
          <p>Create, edit, and deactivate promotions.</p>
        </div>
        <Button to="/merchant/deals/new"><Icon name="i-plus" size={15} /> Add deal</Button>
      </div>

      <div className="explore-filters" style={{ marginBottom: 18 }}>
        {FILTERS.map((f) => (
          <button key={f} type="button" className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="i-tag"
            title="No deals here yet"
            text="Create your first deal and start driving visitors to the shop."
            action={{ to: '/merchant/deals/new', variant: 'primary', children: 'Create a deal' }}
          />
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Deal</th>
                <th>Status</th>
                <th>Views</th>
                <th>Saves</th>
                <th>Ends</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div className="cell-head">
                      <span className="logo-badge" style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-600)' }}>
                        <Icon name="i-tag" size={15} />
                      </span>
                      <div>
                        <div className="c-name">{d.title}</div>
                        <div className="c-sub">Starts {d.start}</div>
                      </div>
                    </div>
                  </td>
                  <td><Badge tone={STATUS_TONE[d.status]}>{d.status}</Badge></td>
                  <td>{d.views ? d.views.toLocaleString() : '—'}</td>
                  <td>{d.saves ? d.saves.toLocaleString() : '—'}</td>
                  <td>{d.end}</td>
                  <td>
                    <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                      <span title="View"><Button to={`/deals/${d.id}`} variant="ghost" className="btn-icon"><Icon name="i-eye" size={15} /></Button></span>
                      <span title="Edit"><Button to={`/merchant/deals/${d.id}/edit`} variant="ghost" className="btn-icon"><Icon name="i-edit" size={15} /></Button></span>
                      {d.status !== 'expired' && d.status !== 'scheduled' && (
                        <span title="Expire"><Button variant="ghost" className="btn-icon" onClick={() => expire(d.id)}><Icon name="i-clock" size={15} style={{ color: 'var(--danger)' }} /></Button></span>
                      )}
                      <span title="Delete"><Button variant="ghost" className="btn-icon" onClick={() => del(d.id)}><Icon name="i-trash" size={15} style={{ color: 'var(--danger)' }} /></Button></span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}