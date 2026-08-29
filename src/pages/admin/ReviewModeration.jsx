import { useEffect, useState } from 'react'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import StarRating from '../../components/ui/StarRating'
import Tabs from '../../components/ui/Tabs'
import { useToast } from '../../components/ui/useToast'
import { api } from '../../services/api'

function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${Math.max(1, mins)} m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} h ago`
  const days = Math.floor(hrs / 24)
  return `${days} d ago`
}

export default function ReviewModeration() {
  const toast = useToast()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [tab, setTab] = useState('queue')

  useEffect(() => {
    let active = true
    api.admin
      .reviews('pending')
      .then((res) => { if (active) setReviews(res.data || []) })
      .catch((e) => { if (active) setError(e.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const resolve = async (id, action) => {
    setBusyId(id)
    try {
      await api.admin.reviewAction(id, action)
      if (action === 'escalate') {
        toast('Escalated to human review')
      } else {
        setReviews((rs) => rs.filter((r) => r.id !== id))
        toast(action === 'remove' ? 'Review removed' : 'Review kept — flag cleared, feedback logged')
      }
    } catch (e) {
      toast(e.message || 'Action failed')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return <div className="card card-pad" style={{ textAlign: 'center', paddingBlock: 48 }}>Loading reviews…</div>
  }
  if (error) {
    return <div className="card card-pad" style={{ textAlign: 'center', paddingBlock: 48, color: 'var(--danger-2)' }}>Failed to load: {error}</div>
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Review moderation</h1>
          <p>Community standards apply to everyone — members and merchants alike.</p>
        </div>
        <span className="badge badge-amber"><Icon name="i-flag" size={13} /> {reviews.length} in queue</span>
      </div>

      <Tabs
        items={[
          { id: 'queue', label: 'Needs review', count: reviews.length },
          { id: 'recent', label: 'Today', count: 42 },
          { id: 'all', label: 'All time', count: 1384 },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'queue' && (
        <div className="col" style={{ gap: 14 }}>
          {reviews.length === 0 ? (
            <div className="card card-pad" style={{ textAlign: 'center', paddingBlock: 44 }}>
              <Icon name="i-check-circle" size={40} style={{ color: 'var(--primary)' }} />
              <h3 style={{ margin: '12px 0 4px' }}>Queue cleared</h3>
              <p className="muted small">You're all caught up — nice.</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="card card-pad">
                <div className="row-between" style={{ marginBottom: 8 }}>
                  <div className="row">
                    <Avatar text={r.user} size="sm" />
                    <div>
                      <span className="tiny muted">{r.business}</span>
                      <div className="bold small">{r.user} <StarRating value={r.rating} size={12} style={{ verticalAlign: '1px' }} /></div>
                    </div>
                  </div>
                  <span className="tiny muted">{timeAgo(r.date)}</span>
                </div>
                <p style={{ margin: '0 0 12px' }}>{r.text}</p>
                <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                  <Badge tone={r.risk === 'high' ? 'red' : 'amber'}>
                    <Icon name={r.risk === 'high' ? 'i-flag' : 'i-alert'} size={12} /> {r.risk} · {r.reason}
                  </Badge>
                  <span className="grow" />
                  <Button variant="ghost" size="sm" disabled={busyId === r.id} onClick={() => resolve(r.id, 'remove')}><Icon name="i-trash" size={14} /> Remove</Button>
                  <Button variant="outline" size="sm" disabled={busyId === r.id} onClick={() => resolve(r.id, 'restore')}><Icon name="i-check" size={14} /> Keep</Button>
                  <Button variant="ghost" size="sm" disabled={busyId === r.id} onClick={() => resolve(r.id, 'escalate')}><Icon name="i-shield" size={14} /> Escalate</Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab !== 'queue' && (
        <div className="row" style={{ gap: 14, flexWrap: 'wrap' }}>
          {['Bean & Leaf', 'Sunflower Bakehouse', 'Page & Plume Books', 'Copper Studio', 'Petal & Stem'].map((b, i) => (
            <div key={b} className="card" style={{ flex: '1 1 240px', padding: 16 }}>
              <div className="bold small" style={{ marginBottom: 4 }}>{b}</div>
              <StarRating value={[5, 5, 4, 4, 5][i]} size={12} />
              <div className="tiny muted" style={{ marginTop: 6 }}>
                {[3, 1, 0, 2, 0][i]} flagged · {[42, 18, 9, 12, 7][i]} reviews this week
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
