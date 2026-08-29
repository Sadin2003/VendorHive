import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import StarRating from '../../components/ui/StarRating'
import Modal from '../../components/ui/Modal'
import { Field, Textarea } from '../../components/ui/Fields'
import EmptyState from '../../components/ui/EmptyState'
import { toneFor } from '../../utils/gradients'
import { useToast } from '../../components/ui/useToast'

const INITIAL = [
  { id: 'r1', merchantId: 'm2', merchant: 'Ember & Oak Grill', rating: 5, date: 'Aug 20, 2026', text: 'The Tuesday steak night is genuinely the best value dinner in Hive City. Whiskey glaze for the win.' },
  { id: 'r2', merchantId: 'm1', merchant: 'Bean & Leaf', rating: 4, date: 'Aug 3, 2026', text: 'Excellent cold drip. Knock off one star because the line gets long right after 3pm (their own fault for being good).' },
  { id: 'r3', merchantId: 'm9', merchant: 'Page & Plume Books', rating: 5, date: 'Jul 28, 2026', text: 'Asked for a recommendation and walked out with my new favorite novel. +1 to the reading-room cat.' },
]

export default function MyReviews() {
  const [reviews, setReviews] = useState(INITIAL)
  const [editId, setEditId] = useState(null)
  const [text, setText] = useState('')
  const [stars, setStars] = useState(5)
  const toast = useToast()

  const edit = (r) => {
    setEditId(r.id)
    setText(r.text)
    setStars(r.rating)
  }

  const save = (e) => {
    e.preventDefault()
    setReviews((rs) => rs.map((r) => (r.id === editId ? { ...r, text, rating: stars } : r)))
    setEditId(null)
    toast('Review updated')
  }

  const remove = (id) => {
    setReviews((rs) => rs.filter((r) => r.id !== id))
    toast('Review deleted')
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

      {reviews.length === 0 ? (
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