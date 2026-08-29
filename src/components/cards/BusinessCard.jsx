import { Link } from 'react-router-dom'
import Icon from '../ui/Icon'
import StarRating from '../ui/StarRating'
import { gradientFor } from '../../utils/gradients'

export default function BusinessCard({ business }) {
  const {
    id,
    name,
    address,
    rating,
    reviews,
    verified,
    openNow,
  } = business

  return (
    <div className="card card-hover biz-card">
      <Link to={`/vendors/${id}`} className="biz-cover" style={{ background: gradientFor(name) }}>
        {business.emoji && <span style={{ fontSize: 44 }}>{business.emoji}</span>}
      </Link>
      <div className="biz-body">
        <Link to={`/vendors/${id}`} style={{ color: 'inherit' }}>
          <div className="b-name">
            {name}
            {verified && (
              <Icon name="i-shield" size={14} style={{ color: 'var(--primary)', marginLeft: 5, verticalAlign: -2 }} />
            )}
          </div>
        </Link>
        <div className="b-addr">
          <Icon name="i-map-pin" />
          <span>{address}</span>
        </div>
        <div className="b-foot">
          <div className="rating-line">
            <StarRating value={rating} size={14} />
            <span className="avg">{rating.toFixed(1)}</span>
            <span className="count">({reviews})</span>
          </div>
          <span className={`badge ${openNow ? 'badge-green' : 'badge-gray'}`}>
            {openNow ? 'Open now' : 'Closed'}
          </span>
        </div>
      </div>
    </div>
  )
}