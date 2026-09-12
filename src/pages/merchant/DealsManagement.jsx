import { useMemo, useState } from 'react'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { PageLoading, PageError } from '../../components/ui/Loading'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'
import { useToast } from '../../components/ui/useToast'

const STATUS_TONE = { active: 'green', scheduled: 'cyan', draft: 'gray', expired: 'red' }

const FILTERS = ['All', 'Active', 'Scheduled', 'Draft', 'Expired']

export default function DealsManagement() {
  const toast = useToast()
  const [filter, setFilter] = useState('All')
  const { data, loading, error, refetch } = useApi(() => api.merchant.deals(), [], [])
  const list = useMemo(
    () => (data || []).filter((d) => filter === 'All' || d.status === filter.toLowerCase()),
    [data, filter]
  )

  const del = async (id) => {
    try {
      await api.merchant.deleteDeal(id)
      toast('Deal deleted')
      refetch()
    } catch (err) {
      toast(err.message || 'Could not delete deal')
    }
  }

  if (loading) return <div className="card card-pad"><PageLoading text="Loading deals…" /></div>
  if (error) return <PageError text="Could not load deals." />

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
            title={filter === 'All' ? 'No deals yet' : `No ${filter.toLowerCase()} deals`}
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
                        <div className="c-sub">{d.published ? 'Live' : 'Draft'}</div>
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