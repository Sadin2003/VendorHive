import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import StarRating from '../../components/ui/StarRating'
import Modal from '../../components/ui/Modal'
import { Field, Textarea } from '../../components/ui/Fields'
import EmptyState from '../../components/ui/EmptyState'
import { PageLoading, PageError } from '../../components/ui/Loading'
import { toneFor } from '../../utils/gradients'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'
import { useToast } from '../../components/ui/useToast'

export default function MyReviews() {
  const toast = useToast()
  const [removed, setRemoved] = useState(() => new Set())
  const [updated, setUpdated] = useState(() => new Map())
  const [editId, setEditId] = useState(null)
  const [text, setText] = useState('')
  const [stars, setStars] = useState(5)

  const { data, loading, error } = useApi(() => api.me.reviews(), [], [])
  const reviews = (data || []).filter((r) => !removed.has(r.id)).map((r) => updated.get(r.id) || r)

  const edit = (r) => {
    setEditId(r.id)
    setText(r.text)
    setStars(r.rating)
  }

  const save = async (e) => {
    e.preventDefault()
    try {
      await api.me.updateReview(editId, { rating: stars, text })
      setUpdated((m) => new Map(m).set(editId, { rating: stars, text }))
      setEditId(null)
      toast('Review updated')
    } catch (err) {
      toast(err?.message || 'Could not update review')
    }
  }

  const remove = async (id) => {
    setRemoved((prev) => new Set(prev).add(id))
    toast('Review deleted')
    try {
      await api.me.deleteReview(id)
    } catch {
      setRemoved((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      toast('Could not delete review')
    }
  }

  const active = reviews.find((r) => r.id === editId)

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>My reviews</h1>
          <p>{reviews.length} review{reviews.length === 1 ? '' : 's'} you've shared</p>
        </div>
      </div>

      {loading ? (
        <div className="card card-pad"><PageLoading text="Loading your reviews…" /></div>
      ) : error ? (
        <PageError text="Could not load your reviews." />
      ) : reviews.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="i-star-o"
            title="No reviews yet"
            text="Tried somewhere great lately? Leave a review and help a neighbor decide."
            action={{ to: '/explore', variant: 'primary', children: 'Find a business to review' }}
          />
        </div>
      ) : (
        <div className="col" style={{ gap: 14 }}>
          {reviews.map((r) => (
            <div key={r.id} className="card card-pad">
              <div className="row-between" style={{ marginBottom: 10 }}>
                <div className="row" style={{ gap: 10 }}>
                  <span style={{ width: 10, height: 44, borderRadius: 5, background: toneFor(r.merchant) }} />
                  <div>
                    <div className="row" style={{ gap: 8 }}>
                      <Link to={`/vendors/${r.merchantId}`} className="bold">{r.merchant}</Link>
                      <StarRating value={r.rating} size={13} />
                    </div>
                    <div className="small muted">{r.date}</div>
                  </div>
                </div>
                <div className="row-actions">
                  <Button variant="ghost" size="sm" onClick={() => edit(r)}><Icon name="i-edit" size={14} /> Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(r.id)}><Icon name="i-trash" size={14} style={{ color: 'var(--danger)' }} /> Delete</Button>
                </div>
              </div>
              <p style={{ margin: 0 }}>{r.text}</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!active} onClose={() => setEditId(null)} title={`Edit review — ${active?.merchant}`}>
        <form onSubmit={save}>
          <Field label="Rating">
            <div className="row" style={{ gap: 6 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" className="btn btn-sm btn-outline" style={{ padding: '5px 10px' }} onClick={() => setStars(s)}>
                  {s}★
                </button>
              ))}
              <span className="small muted" style={{ marginLeft: 8 }}>Selected: {stars}/5</span>
            </div>
          </Field>
          <Field label="Review" required>
            <Textarea required value={text} onChange={(e) => setText(e.target.value)} />
          </Field>
          <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>
            <Button variant="ghost" type="button" onClick={() => setEditId(null)}>Cancel</Button>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}