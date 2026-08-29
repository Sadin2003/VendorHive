import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { gradientFor } from '../../utils/gradients'
import { useToast } from '../../components/ui/useToast'

const INITIAL = [
  { id: 'd7', merchant: 'Bean & Leaf × Sunflower Bakehouse', title: 'Bundle: cappuccino + croissant duo for $9', discount: '$9 duo', expires: 'Sep 10, 2026', coverKey: 'Bean & Leaf × Sunflower Bakehouse Deal' },
  { id: 'd2', merchant: 'Ember & Oak Grill', title: '20% off the Tuesday steak night menu', discount: '20% off', expires: 'Aug 31, 2026', coverKey: 'Ember & Oak Grill' },
  { id: 'd6', merchant: 'The Copper Studio', title: '15% off your first cut + free beard trim', discount: '15% off', expires: 'Sep 12, 2026', coverKey: 'The Copper Studio' },
]

export default function SavedDeals() {
  const [deals, setDeals] = useState(INITIAL)
  const toast = useToast()

  const remove = (id) => {
    setDeals((d) => d.filter((x) => x.id !== id))
    toast('Deal removed from saved')
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Saved deals</h1>
          <p>{deals.length} deal{deals.length === 1 ? '' : 's'} ready to redeem</p>
        </div>
        <Button to="/deals" variant="outline"><Icon name="i-plus" size={15} /> Browse deals</Button>
      </div>

      {deals.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="i-bookmark-o"
            title="No saved deals yet"
            text="When you spot an offer worth keeping, hit the bookmark on any deal card and it will wait for you here."
            action={{
              to: '/deals',
              variant: 'primary',
              children: 'Find deals to save',
            }}
          />
        </div>
      ) : (
        <div className="col" style={{ gap: 14 }}>
          {deals.map((d) => (
            <div key={d.id} className="card card-hover">
              <div className="row" style={{ padding: 14, gap: 16 }}>
                <Link
                  to={`/deals/${d.id}`}
                  style={{ flex: 'none', width: 92, height: 76, borderRadius: 12, background: gradientFor(d.coverKey), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22 }}
                >
                  <Icon name="i-tag" size={22} />
                </Link>
                <div className="grow">
                  <div className="small muted">{d.merchant}</div>
                  <Link to={`/deals/${d.id}`} style={{ color: 'inherit' }}>
                    <div className="bold" style={{ fontSize: '0.98rem' }}>{d.title}</div>
                  </Link>
                  <div className="row" style={{ gap: 16, marginTop: 5 }}>
                    <span className="badge badge-amber">{d.discount}</span>
                    <span className="small muted">
                      <Icon name="i-clock" size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
                      Expires {d.expires}
                    </span>
                  </div>
                </div>
                <div className="row" style={{ alignSelf: 'center', gap: 8 }}>
                  <Button to={`/deals/${d.id}`} variant="primary" size="sm">View</Button>
                  <Button variant="ghost" size="sm" className="btn-icon" onClick={() => remove(d.id)} aria-label="Remove deal" title="Remove">
                    <Icon name="i-trash" size={15} style={{ color: 'var(--danger)' }} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}