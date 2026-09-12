import { useState } from 'react'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import StarRating from '../../components/ui/StarRating'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { Field, Textarea } from '../../components/ui/Fields'
import { PageLoading, PageError } from '../../components/ui/Loading'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'
import { useToast } from '../../components/ui/useToast'

const STARS = [5, 4, 3, 2, 1]

function ReviewsBody({ data }) {
  const toast = useToast()
  const [reviews, setReviews] = useState(data || [])
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [flagging, setFlagging] = useState(null)
  const [flagReason, setFlagReason] = useState('')
  const [busy, setBusy] = useState(false)

  const total = reviews.length
  const avg = total ? (reviews.reduce((a, r) => a + r.rating, 0) / total).toFixed(1) : '0.0'
  const dist = STARS.map((star) => {
    const count = reviews.filter((r) => r.rating === star).length
    return { star, count, pct: total ? Math.round((count / total) * 100) : 0 }
  })

  const publishReply = async () => {
    if (!replyText.trim() || !replyingTo) return
    setBusy(true)
    try {
      await api.merchant.replyToReview(replyingTo.id, replyText.trim())
      setReviews((rs) => rs.map((x) => (x.id === replyingTo.id ? { ...x, reply: replyText.trim() } : x)))
      setReplyingTo(null)
      setReplyText('')
      toast('Reply published')
    } catch (err) {
      toast(err.message || 'Could not publish reply')
    } finally {
      setBusy(false)
    }
  }

  const submitFlag = async () => {
    if (!flagging) return
    setBusy(true)
    try {
      await api.merchant.flagReview(flagging.id, flagReason.trim() || 'Reported by merchant')
      setReviews((rs) => rs.map((x) => (x.id === flagging.id ? { ...x, moderation: 'escalated' } : x)))
      setFlagging(null)
      setFlagReason('')
      toast('Review flagged for admin moderation')
    } catch (err) {
      toast(err.message || 'Could not flag review')
    } finally {
      setBusy(false)
    }
  }

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
            <div className="tiny muted" style={{ marginTop: 4 }}>{total} reviews · all time</div>
          </div>
        </div>
        <div className="card card-pad">
          {dist.map((r) => (
            <div className="row" style={{ gap: 10 }} key={r.star}>
              <span className="tiny muted" style={{ width: 22 }}>{r.star}★</span>
              <div className="progress grow"><i style={{ width: `${r.pct}%` }} /></div>
              <span className="tiny muted" style={{ width: 34, textAlign: 'right' }}>{r.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="col" style={{ gap: 14 }}>
        {reviews.length === 0 ? (
          <div className="card"><p className="muted" style={{ margin: 0 }}>No reviews yet.</p></div>
        ) : (
          reviews.map((r) => (
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
                  {r.moderation === 'kept' && <Badge tone="green">Verified</Badge>}
                  {r.moderation === 'escalated' && <Badge tone="amber">Under review</Badge>}
                </div>
              </div>
              <p style={{ margin: '0 0 12px' }}>{r.text}</p>
              {r.reply ? (
                <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '10px 14px', fontSize: '0.86rem', marginBottom: 8 }}>
                  <strong style={{ color: 'var(--primary-700)' }}>Your response:</strong>
                  <p style={{ margin: '4px 0 0' }}>{r.reply}</p>
                </div>
              ) : null}
              <div className="row" style={{ gap: 8 }}>
                {!r.reply && (
                  <Button variant="ghost" size="sm" icon={<Icon name="i-message" size={14} />} onClick={() => { setReplyingTo(r); setReplyText('') }}>
                    Respond
                  </Button>
                )}
                {r.moderation !== 'escalated' && (
                  <Button variant="ghost" size="sm" icon={<Icon name="i-flag" size={14} />} onClick={() => { setFlagging(r); setFlagReason('') }}>
                    Flag
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
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
          <Button disabled={!replyText.trim() || busy} onClick={publishReply}>
            <Icon name="i-send" size={14} /> Publish reply
          </Button>
        </div>
      </Modal>

      <Modal open={!!flagging} onClose={() => setFlagging(null)} title="Flag this review">
        <p className="small muted" style={{ marginTop: 0 }}>
          Flagged reviews go to our admin team for review. Why are you reporting this one?
        </p>
        <Field label="Reason">
          <Textarea placeholder="e.g. Off-topic, abusive, or factually wrong…" value={flagReason} onChange={(e) => setFlagReason(e.target.value)} />
        </Field>
        <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="ghost" onClick={() => setFlagging(null)}>Cancel</Button>
          <Button disabled={busy} onClick={submitFlag}>
            <Icon name="i-flag" size={14} /> Flag for review
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default function Reviews() {
  const { data, loading, error } = useApi(() => api.merchant.reviews(), [], [])

  if (loading) return <div className="card card-pad"><PageLoading text="Loading reviews…" /></div>
  if (error) return <PageError text="Could not load reviews." />

  return <ReviewsBody data={data || []} />
}