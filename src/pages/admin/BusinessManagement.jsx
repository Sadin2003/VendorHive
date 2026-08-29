import { useState } from 'react'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import StarRating from '../../components/ui/StarRating'
import SearchInput from '../../components/ui/SearchInput'
import { gradientFor } from '../../utils/gradients'
import { useToast } from '../../components/ui/useToast'

const INITIAL = [
  { id: 'm1', name: 'Bean & Leaf', cat: 'Cafés', owner: 'Maya Chen', verified: true, rating: 4.8, reports: 0, status: 'live' },
  { id: 'm2', name: 'Ember & Oak Grill', cat: 'Restaurants', owner: 'Theo Grant', verified: true, rating: 4.6, reports: 1, status: 'live' },
  { id: 'm3', name: 'Sunflower Bakehouse', cat: 'Bakeries', owner: 'Elena Petrova', verified: true, rating: 4.9, reports: 0, status: 'live' },
  { id: 'm4', name: 'Petal & Stem', cat: 'Gifts & Local', owner: 'Grace Liu', verified: true, rating: 4.7, reports: 2, status: 'reviewed' },
  { id: 'm13', name: 'Coal & Clay Ceramics', cat: 'Gifts & Local', owner: 'Ravi Shah', verified: false, rating: null, reports: 0, status: 'pending' },
  { id: 'm14', name: 'The Hearth Pantry', cat: 'Bakeries', owner: 'Lena Ortiz', verified: false, rating: null, reports: 0, status: 'pending' },
]

export default function BusinessManagement() {
  const [biz, setBiz] = useState(INITIAL)
  const [q, setQ] = useState('')
  const toast = useToast()

  const list = biz.filter((b) => !q.trim() || b.name.toLowerCase().includes(q.trim().toLowerCase()))
  const live = biz.filter((b) => b.status === 'live').length

  const delist = (b) => {
    setBiz((bs) => bs.map((x) => (x.id === b.id ? { ...x, status: x.status === 'delisted' ? 'live' : 'delisted' } : x)))
    toast(b.status === 'delisted' ? `${b.name} restored` : `${b.name} delisted`)
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Business management</h1>
          <p>{live} active listings · {biz.length} total</p>
        </div>
        <Button variant="outline"><Icon name="i-filter" size={15} /> Filter</Button>
      </div>

      <SearchInput className="grow" style={{ marginBottom: 18 }} value={q} onChange={setQ} placeholder="Search businesses…" />

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Business</th>
              <th>Status</th>
              <th>Rating</th>
              <th>Reports</th>
              <th>Owner</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((b) => (
              <tr key={b.id}>
                <td>
                  <div className="cell-head">
                    <span className="logo-badge" style={{ background: gradientFor(b.name), width: 34, height: 34, borderRadius: 9, fontSize: '0.7rem' }}>{b.name.slice(0, 2)}</span>
                    <div>
                      <div className="c-name">{b.name}</div>
                      <div className="c-sub">{b.cat}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <Badge tone={b.verified ? 'green' : b.status === 'pending' ? 'amber' : 'red'}>
                    {b.verified ? 'verified' : b.status === 'pending' ? 'pending' : b.status}
                  </Badge>
                </td>
                <td>{b.rating ? <StarRating value={b.rating} size={13} /> : '—'}</td>
                <td>{b.reports > 0 ? <Badge tone="red">{b.reports}</Badge> : <span className="muted">0</span>}</td>
                <td><span className="small">{b.owner}</span></td>
                <td>
                  <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                    <Button to={`/vendors/${b.id}`} variant="ghost" className="btn-icon" title="View public profile"><Icon name="i-eye" size={15} /></Button>
                    <Button variant="ghost" className="btn-icon" title={b.status === 'delisted' ? 'Restore listing' : 'Delist'} onClick={() => delist(b)}>
                      <Icon name="i-flag" size={15} style={{ color: b.status === 'delisted' ? 'var(--primary)' : 'var(--danger)' }} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}