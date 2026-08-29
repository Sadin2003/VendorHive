import Icon from '../ui/Icon'
import Badge from '../ui/Badge'
import { gradientFor } from '../../utils/gradients'

const STATUS_BADGE = {
  active: 'green',
  scheduled: 'cyan',
  expired: 'gray',
  pending: 'amber',
}

export default function PromotionCard({ promo }) {
  return (
    <div className="card card-hover card-pad">
      <div className="row-between" style={{ marginBottom: 14 }}>
        <div className="row">
          <span
            className="logo-badge"
            style={{ background: gradientFor(promo.partnerA), width: 40, height: 40, borderRadius: 11 }}
          >
            {promo.partnerA.slice(0, 2).toUpperCase()}
          </span>
          <Icon name="i-arrow-right" size={18} style={{ color: 'var(--text-faint)' }} />
          <span
            className="logo-badge"
            style={{ background: gradientFor(promo.partnerB), width: 40, height: 40, borderRadius: 11 }}
          >
            {promo.partnerB.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <Badge tone={STATUS_BADGE[promo.status] || 'gray'}>{promo.status}</Badge>
      </div>
      <div className="bold" style={{ marginBottom: 6 }}>
        {promo.partnerA} × {promo.partnerB}
      </div>
      <p className="muted small" style={{ marginBottom: 16 }}>
        {promo.offer}
      </p>
      <div className="row-between small">
        <span className="muted">
          <Icon name="i-calendar" size={13} style={{ verticalAlign: -2, marginRight: 5 }} />
          {promo.dates}
        </span>
        <span className="row" style={{ gap: 14 }}>
          <span className="muted">
            <Icon name="i-eye" size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
            {promo.views.toLocaleString()}
          </span>
          <span className="muted">
            <Icon name="i-bookmark-o" size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
            {promo.saves.toLocaleString()}
          </span>
        </span>
      </div>
    </div>
  )
}