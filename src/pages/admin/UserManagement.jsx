import { useMemo, useState } from 'react'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import SearchInput from '../../components/ui/SearchInput'
import { PageLoading, PageError } from '../../components/ui/Loading'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'
import { useToast } from '../../components/ui/useToast'

const ROLE = { shopper: 'gray', merchant: 'green', admin: 'amber' }

const FILTERS = ['All', 'Shoppers', 'Merchants', 'Pending', 'Suspended']

export default function UserManagement() {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('All')
  const [busyId, setBusyId] = useState(null)
  const toast = useToast()
  const { data, loading, error, refetch } = useApi(() => api.admin.users(), [], [])
  const users = data || []

  const list = useMemo(() => {
    const t = q.trim().toLowerCase()
    return (data || []).filter((u) => {
      if (filter === 'Shoppers' && u.role !== 'shopper') return false
      if (filter === 'Merchants' && u.role !== 'merchant') return false
      if (filter === 'Pending' && u.status !== 'pending') return false
      if (filter === 'Suspended' && u.status !== 'suspended') return false
      if (t && !`${u.name} ${u.email}`.toLowerCase().includes(t)) return false
      return true
    })
  }, [data, q, filter])

  const toggle = async (u) => {
    const next = u.status === 'suspended' ? 'active' : 'suspended'
    setBusyId(u.id)
    try {
      await api.admin.userStatus(u.id, next)
      toast(next === 'suspended' ? `${u.name} suspended` : `${u.name} restored`)
      refetch()
    } catch (err) {
      toast(err.message || 'Could not change status')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <div className="card card-pad"><PageLoading text="Loading members…" /></div>
  if (error) return <PageError text="Could not load users." />

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>User management</h1>
          <p>{users.length} members</p>
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

      {list.length === 0 ? (
        <div className="card"><p className="muted small" style={{ margin: 0 }}>No members match this filter.</p></div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>{filter.includes('Merchant') || filter === 'All' ? 'Deals' : 'Saves'}</th>
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
                      {u.status !== 'pending' && u.role !== 'admin' && (
                        <Button
                          variant="ghost"
                          className="btn-icon"
                          title={u.status === 'suspended' ? 'Restore' : 'Suspend'}
                          disabled={busyId === u.id}
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
      )}
    </div>
  )
}