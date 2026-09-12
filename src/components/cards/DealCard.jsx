import { Link } from 'react-router-dom'
import Icon from '../ui/Icon'
import { gradientFor } from '../../utils/gradients'

export default function DealCard({ deal, saved = false, onSave }) {
  const handleSave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onSave?.(deal, !saved)
  }

  return (
    <div className="card card-hover deal-card deal-tile">
      <Link
        to={`/deals/${deal.id}`}
        className="deal-cover"
        style={{ background: gradientFor(deal.merchant || deal.coverKey || deal.id) }}
      >
        {deal.tag && <span className="deal-tag">{deal.tag}</span>}
        {onSave && (
          <button
            type="button"
            className={`deal-save ${saved ? 'saved' : ''}`}
            onClick={handleSave}
            aria-label={saved ? 'Remove from saved' : 'Save deal'}
          >
            <Icon name={saved ? 'i-bookmark' : 'i-bookmark-o'} />
          </button>
        )}
      </Link>
      <div className="deal-body">
        <div className="merchant">
          <span>{deal.merchant}</span>
          <span style={{ opacity: 0.55 }}>·</span>
          <span>{deal.category}</span>
        </div>
        <Link to={`/deals/${deal.id}`} style={{ color: 'inherit' }}>
          <h4>{deal.title}</h4>
        </Link>
        <div className="meta">
          <span>
            <Icon name="i-eye" /> {deal.views?.toLocaleString?.() ?? deal.views}
          </span>
          <span>
            <Icon name="i-bookmark-o" /> {deal.saves?.toLocaleString?.() ?? deal.saves}
          </span>
          <span>
            <Icon name="i-clock" /> {deal.expiresIn ?? 'Ends soon'}
          </span>
        </div>
        <div className="foot">
          <span className="badge badge-amber">{deal.discount}</span>
          <Link to={`/deals/${deal.id}`} className="btn btn-sm btn-outline">
            View deal
            <Icon name="i-arrow-right" size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}