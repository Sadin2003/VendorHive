import { useState } from 'react'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import StarRating from '../../components/ui/StarRating'
import Tabs from '../../components/ui/Tabs'
import { PageLoading, PageError } from '../../components/ui/Loading'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'
import { useToast } from '../../components/ui/useToast'

export default function ReviewModeration() {
  const toast = useToast()
  const [tab, setTab] = useState('queue')
  const [busyId, setBusyId] = useState(null)
  const { data, loading, error, refetch } = useApi(() => api.admin.reviews(tab), [tab], [])
  const reviews = data || []

  const resolve = async (id, action) => {
    setBusyId(id)
    try {
      if (action === 'remove') {
        await api.admin.removeReview(id)
        toast('Review removed')
      } else if (action === 'keep') {
        await api.admin.keepReview(id)
        toast('Review kept — flag cleared')
      } else {
        await api.admin.escalateReview(id)
        toast('Escalated to human review')
      }
      refetch()
    } catch (err) {
      toast(err.message || 'Action failed')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <div className="card card-pad"><PageLoading text="Loading review queue…" /></div>
  if (error) return <PageError text="Could not load reviews." />

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Review moderation</h1>
          <p>Community standards apply to everyone — members and merchants alike.</p>
        </div>
        {tab === 'queue' && (
          <span className="badge badge-amber"><Icon name="i-flag" size={13} /> {reviews.length} in queue</span>
        )}
      </div>

      <Tabs
        items={[
          { id: 'queue', label: 'Needs review', count: tab === 'queue' ? reviews.length : undefined },
          { id: 'recent', label: 'Today', count: tab === 'recent' ? reviews.length : undefined },
          { id: 'all', label: 'All time', count: tab === 'all' ? reviews.length : undefined },
        ]}
        active={tab}
        onChange={setTab}
      />

      {reviews.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: 'center', paddingBlock: 44 }}>
          <Icon name="i-check-circle" size={40} style={{ color: 'var(--primary)' }} />
          <h3 style={{ margin: '12px 0 4px' }}>{tab === 'queue' ? 'Queue cleared' : 'Nothing here'}</h3>
          <p className="muted small">You're all caught up — nice.</p>
        </div>
      ) : (
        <div className="col" style={{ gap: 14 }}>
          {reviews.map((r) => (
            <div key={r.id} className="card card-pad">
              <div className="row-between" style={{ marginBottom: 8 }}>
                <div className="row">
                  <Avatar text={r.user} size="sm" />
                  <div>
                    <span className="tiny muted">{r.business}</span>
                    <div className="bold small">{r.user} <StarRating value={r.rating} size={12} style={{ verticalAlign: '1px' }} /></div>
                  </div>
                </div>
                <span className="tiny muted">{r.date}</span>
              </div>
              <p style={{ margin: '0 0 12px' }}>{r.text}</p>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <Badge tone={r.risk === 'high' ? 'red' : r.risk === 'low' ? 'gray' : 'amber'}>
                  <Icon name={(r.risk === 'high' ? 'i-flag' : 'i-alert')} size={12} /> {r.risk} · {r.reason}
                </Badge>
                <span className="grow" />
                <Button variant="ghost" size="sm" disabled={busyId === r.id} onClick={() => resolve(r.id, 'remove')}><Icon name="i-trash" size={14} /> Remove</Button>
                <Button variant="outline" size="sm" disabled={busyId === r.id} onClick={() => resolve(r.id, 'keep')}><Icon name="i-check" size={14} /> Keep</Button>
                <Button variant="ghost" size="sm" disabled={busyId === r.id} onClick={() => resolve(r.id, 'escalate')}><Icon name="i-shield" size={14} /> Escalate</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="hint-role" style={{ marginTop: 20 }}>
        <Icon name="i-info" size={15} style={{ verticalAlign: -3 }} />
        <span>
          Flagged personally-identifiable info is auto-redacted (<code>&lt;redacted&gt;</code>). You can still review the original.
        </span>
      </div>
    </div>
  )
}