import { useMemo, useState } from 'react'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import SearchInput from '../../components/ui/SearchInput'
import { useToast } from '../../components/ui/useToast'

const INITIAL = [
  { id: '1', name: 'Aisha Khan', email: 'aisha@example.com', role: 'shopper', joined: 'Jan 2026', status: 'active', deals: 22 },
  { id: '2', name: 'Marcus Taylor', email: 'marcus@example.com', role: 'shopper', joined: 'Jan 2026', status: 'active', deals: 9 },
  { id: '3', name: 'Maya Chen', email: 'owner@beanandleaf.co', role: 'merchant', joined: 'Feb 2026', status: 'active', deals: 6 },
  { id: '4', name: 'Ravi Shah', email: 'ravi@coalclay.co', role: 'merchant', joined: 'Aug 2026', status: 'pending', deals: 0 },
  { id: '5', name: 'Priya Nair', email: 'priya@example.com', role: 'shopper', joined: 'Mar 2026', status: 'suspended', deals: 4 },
  { id: '6', name: 'Tomás Rivera', email: 'tomas@example.com', role: 'shopper', joined: 'Apr 2026', status: 'active', deals: 2 },
]

const ROLE = { shopper: 'gray', merchant: 'green', admin: 'amber' }

const FILTERS = ['All', 'Shoppers', 'Merchants', 'Pending', 'Suspended']

export default function UserManagement() {
  const [users, setUsers] = useState(INITIAL)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('All')
  const toast = useToast()

  const list = useMemo(() => {
    const t = q.trim().toLowerCase()
    return users.filter((u) => {
      if (filter === 'Shoppers' && u.role !== 'shopper') return false
      if (filter === 'Merchants' && u.role !== 'merchant') return false
      if (filter === 'Pending' && u.status !== 'pending') return false
      if (filter === 'Suspended' && u.status !== 'suspended') return false
      if (t && !`${u.name} ${u.email}`.toLowerCase().includes(t)) return false
      return true
    })
  }, [users, q, filter])

  const toggle = (u) => {
    const next = u.status === 'suspended' ? 'active' : 'suspended'
    setUsers((us) => us.map((x) => (x.id === u.id ? { ...x, status: next } : x)))
    toast(next === 'suspended' ? `${u.name} suspended` : `${u.name} restored`)
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>User management</h1>
          <p>{users.length} members · 2 new this week</p>
        </div>
        <span className="badge badge-green"><Icon name="i-check-circle" size={13} /> System healthy</span>
      </div>

      <div className="row" style={{ gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <SearchInput className="grow" value={q} onChange={setQ} placeholder="Search name or email…" />
        <div className="explore-filters" style={{ gap: 6 }}>
          {FILTERS.map((f) => (
            <button key={f} type="button" className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Deals saved</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="cell-head">
                    <Avatar text={u.name} size="sm" />
                    <div>
                      <div className="c-name">{u.name}</div>
                      <div className="c-sub">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td><Badge tone={ROLE[u.role]}>{u.role}</Badge></td>
                <td>
                  <Badge tone={u.status === 'active' ? 'green' : u.status === 'pending' ? 'amber' : 'red'}>{u.status}</Badge>
                </td>
                <td>{u.joined}</td>
                <td>{u.deals}</td>
                <td>
                  <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                    <Button variant="ghost" className="btn-icon" title="View profile"><Icon name="i-eye" size={15} /></Button>
                    {u.status !== 'pending' && (
                      <Button
                        variant="ghost"
                        className="btn-icon"
                        title={u.status === 'suspended' ? 'Restore' : 'Suspend'}
                        onClick={() => toggle(u)}
                      >
                        <Icon name={u.status === 'suspended' ? 'i-refresh' : 'i-user'} size={15} style={{ color: u.status === 'suspended' ? 'var(--primary)' : 'var(--danger)' }} />
                      </Button>
                    )}
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