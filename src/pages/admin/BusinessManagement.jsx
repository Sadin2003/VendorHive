import { useState } from 'react'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import StarRating from '../../components/ui/StarRating'
import SearchInput from '../../components/ui/SearchInput'
import { gradientFor } from '../../utils/gradients'
import { PageLoading, PageError } from '../../components/ui/Loading'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'
import { useToast } from '../../components/ui/useToast'

export default function BusinessManagement() {
  const [q, setQ] = useState('')
  const [busyId, setBusyId] = useState(null)
  const toast = useToast()
  const { data, loading, error, refetch } = useApi(() => api.admin.merchants(), [], [])
  const biz = data || []

  const list = biz.filter((b) => !q.trim() || `${b.name} ${b.owner}`.toLowerCase().includes(q.trim().toLowerCase()))
  const live = biz.filter((b) => b.status === 'live').length

  const badgeFor = (b) => {
    if (b.status === 'live' || b.status === 'reviewed') return b.verified ? ['green', 'verified'] : ['gray', 'reviewed']
    if (b.status === 'pending') return ['amber', 'pending']
    return ['red', b.status]
  }

  const delist = async (b) => {
    const next = b.status === 'delisted' ? 'live' : 'delisted'
    setBusyId(b.id)
    try {
      await api.admin.merchantStatus(b.id, next)
      toast(next === 'delisted' ? `${b.name} delisted` : `${b.name} restored`)
      refetch()
    } catch (err) {
      toast(err.message || 'Could not update listing')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <div className="card card-pad"><PageLoading text="Loading businesses…" /></div>
  if (error) return <PageError text="Could not load businesses." />

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Business management</h1>
          <p>{live} active listings · {biz.length} total</p>
        </div>
      </div>

      <SearchInput className="grow" style={{ marginBottom: 18 }} value={q} onChange={setQ} placeholder="Search businesses or owners…" />

      {list.length === 0 ? (
        <div className="card"><p className="muted small" style={{ margin: 0 }}>No businesses match this search.</p></div>
      ) : (
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
              {list.map((b) => {
                const [tone, label] = badgeFor(b)
                return (
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
                    <td><Badge tone={tone}>{label}</Badge></td>
                    <td>{b.rating ? <StarRating value={b.rating} size={13} /> : '—'}</td>
                    <td>{b.reports > 0 ? <Badge tone="red">{b.reports}</Badge> : <span className="muted">0</span>}</td>
                    <td><span className="small">{b.owner}</span></td>
                    <td>
                      <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                        {b.status === 'live' && (
                          <Button to={`/businesses/${b.id}`} variant="ghost" className="btn-icon" title="View public profile"><Icon name="i-eye" size={15} /></Button>
                        )}
                        <Button
                          variant="ghost"
                          className="btn-icon"
                          disabled={busyId === b.id}
                          title={b.status === 'delisted' ? 'Restore listing' : 'Delist'}
                          onClick={() => delist(b)}
                        >
                          <Icon name="i-flag" size={15} style={{ color: b.status === 'delisted' ? 'var(--primary)' : 'var(--danger)' }} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}