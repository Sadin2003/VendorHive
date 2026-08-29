import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../ui/Icon'
import StarRating from '../ui/StarRating'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'

export default function ReviewCard({ review, showMerchant = false }) {
  const [helpful, setHelpful] = useState(review.helpfulVoted || false)
  const [votes, setVotes] = useState(review.helpful || 0)

  const toggleHelpful = () => {
    setHelpful((h) => !h)
    setVotes((v) => (helpful ? v - 1 : v + 1))
  }

  return (
    <div className="card card-pad">
      <div className="row-between" style={{ marginBottom: 12 }}>
        <div className="row">
          <Avatar text={review.user} size="sm" />
          <div>
            <div className="bold small">{review.user}</div>
            <div className="row" style={{ gap: 8 }}>
              <StarRating value={review.rating} size={12} />
              <span className="tiny muted">{review.date}</span>
            </div>
          </div>
        </div>
        {review.verified && <Badge tone="green">Verified visit</Badge>}
      </div>
      {showMerchant && (
        <Link to={`/vendors/${review.merchantId}`} className="tag" style={{ display: 'inline-block', marginBottom: 10 }}>
          {review.merchant}
        </Link>
      )}
      <p style={{ marginBottom: 14 }}>{review.text}</p>
      <div className="row" style={{ gap: 8 }}>
        <button
          type="button"
          className={`btn btn-sm ${helpful ? 'btn-primary' : 'btn-ghost'}`}
          style={{ padding: '6px 12px' }}
          onClick={toggleHelpful}
        >
          <Icon name="i-thumbs-up" size={14} />
          Helpful · {votes}
        </button>
      </div>
    </div>
  )
}