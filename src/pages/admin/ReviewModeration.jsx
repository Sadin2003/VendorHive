import { useState } from 'react'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import StarRating from '../../components/ui/StarRating'
import Tabs from '../../components/ui/Tabs'
import { useToast } from '../../components/ui/useToast'

const INITIAL = [
  { id: 'rv1', business: 'The Copper Studio', user: 'J. Rivera', rating: 1, date: '2 h ago', reason: 'Hate speech', risk: 'high', text: 'Worst place in town, and the owner is a total <redacted>.' },
  { id: 'rv2', business: 'Petal & Stem', user: 'T. Novak', rating: 5, date: '1 day ago', reason: 'Suspected self-review', risk: 'med', text: 'Absolutely divine arrangements. 10/10 would recommend to my own mom.' },
  { id: 'rv3', business: 'Ember & Oak Grill', user: 'K. Wren', rating: 2, date: '6 h ago', reason: 'Off-topic (political)', risk: 'med', text: 'Great ribs but honestly the city council should — see below for my full opinion.' },
]

export default function ReviewModeration() {
  const toast = useToast()
  const [reviews, setReviews] = useState(INITIAL)
  const [tab, setTab] = useState('queue')

  const resolve = (id, action) => {
    if (action === 'remove') {
      setReviews((rs) => rs.filter((r) => r.id !== id))
      toast('Review removed')
    } else if (action === 'restore') {
      setReviews((rs) => rs.filter((r) => r.id !== id))
      toast('Review kept — flag cleared, feedback logged')
    } else {
      toast('Escalated to human review')
    }
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
                  <span className="tiny muted">{r.date}</span>
                </div>
                <p style={{ margin: '0 0 12px' }}>{r.text}</p>
                <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                  <Badge tone={r.risk === 'high' ? 'red' : 'amber'}>
                    <Icon name={r.risk === 'high' ? 'i-flag' : 'i-alert'} size={12} /> {r.risk} · {r.reason}
                  </Badge>
                  <span className="grow" />
                  <Button variant="ghost" size="sm" onClick={() => resolve(r.id, 'remove')}><Icon name="i-trash" size={14} /> Remove</Button>
                  <Button variant="outline" size="sm" onClick={() => resolve(r.id, 'restore')}><Icon name="i-check" size={14} /> Keep</Button>
                  <Button variant="ghost" size="sm" onClick={() => resolve(r.id, 'escalate')}><Icon name="i-shield" size={14} /> Escalate</Button>
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