import { useState } from 'react'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import StarRating from '../../components/ui/StarRating'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { Field, Textarea } from '../../components/ui/Fields'
import { useToast } from '../../components/ui/useToast'

const INITIAL = [
  { id: 'r1', user: 'Aisha K.', rating: 5, date: '2 days ago', text: 'The oat-latte-cold-drip combo is unreal. Baristas remember my order every single morning.', verified: true, reply: null },
  { id: 'r2', user: 'Marcus T.', rating: 5, date: '1 week ago', text: 'Cozy spot, great WiFi, and the bundled deal with Sunflower is the best value on the block.', verified: true, reply: 'Appreciate it, Marcus — the bundle is our favorite hangover from the cross-promo.' },
  { id: 'r3', user: 'Priya N.', rating: 4, date: '3 weeks ago', text: 'Lovely roastery smell when you walk in. Gets busy after 5pm on Thursdays.', verified: false, reply: null },
  { id: 'r4', user: 'Danny R.', rating: 5, date: '1 month ago', text: 'Staff went out of their way to help me choose a gift bag of beans. Five stars.', verified: true, reply: null },
]

const DIST = [
  { star: 5, pct: 82 }, { star: 4, pct: 12 }, { star: 3, pct: 4 }, { star: 2, pct: 1 }, { star: 1, pct: 1 },
]

export default function Reviews() {
  const toast = useToast()
  const [reviews, setReviews] = useState(INITIAL)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')

  const avg = (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Reviews</h1>
          <p>Replying quickly builds trust — and it shows up beside every review.</p>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 26 }}>
        <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-.03em' }}>{avg}</span>
          <div>
            <StarRating value={Number(avg)} size={17} />
            <div className="tiny muted" style={{ marginTop: 4 }}>{reviews.length} reviews · all time</div>
          </div>
        </div>
        <div className="card card-pad">
          {DIST.map((r) => (
            <div className="row" style={{ gap: 10 }} key={r.star}>
              <span className="tiny muted" style={{ width: 22 }}>{r.star}★</span>
              <div className="progress grow"><i style={{ width: `${r.pct}%` }} /></div>
              <span className="tiny muted" style={{ width: 34, textAlign: 'right' }}>{r.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="col" style={{ gap: 14 }}>
        {reviews.map((r) => (
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
                {r.verified && <Badge tone="green">Verified</Badge>}
              </div>
            </div>
            <p style={{ margin: '0 0 12px' }}>{r.text}</p>
            {r.reply ? (
              <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '10px 14px', fontSize: '0.86rem' }}>
                <strong style={{ color: 'var(--primary-700)' }}>Your response:</strong>
                <p style={{ margin: '4px 0 0' }}>{r.reply}</p>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                icon={<Icon name="i-message" size={14} />}
                onClick={() => { setReplyingTo(r); setReplyText('') }}
              >
                Respond
              </Button>
            )}
          </div>
        ))}
      </div>

      <Modal open={!!replyingTo} onClose={() => setReplyingTo(null)} title={`Reply to ${replyingTo?.user}`}>
        <div className="card card-pad" style={{ marginBottom: 14, background: 'var(--surface-2)', boxShadow: 'none' }}>
          <div className="row" style={{ gap: 8, marginBottom: 6 }}>
            <StarRating value={replyingTo?.rating || 0} size={13} />
            <span className="tiny muted">{replyingTo?.date}</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>{replyingTo?.text}</p>
        </div>
        <Field label="Your public reply">
          <Textarea placeholder="Thank the customer, acknowledge feedback, keep it human…" value={replyText} onChange={(e) => setReplyText(e.target.value)} />
        </Field>
        <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
          <Button
            onClick={() => {
              setReviews((rs) => rs.map((x) => (x.id === replyingTo.id ? { ...x, reply: replyText } : x)))
              setReplyingTo(null)
              toast('Reply published')
            }}
            disabled={!replyText.trim()}
          >
            <Icon name="i-send" size={14} /> Publish reply
          </Button>
        </div>
      </Modal>
    </div>
  )
}