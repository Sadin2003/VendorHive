import { useState } from 'react'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import Tabs from '../../components/ui/Tabs'
import PromotionCard from '../../components/cards/PromotionCard'
import EmptyState from '../../components/ui/EmptyState'

const ACTIVE = [
  { id: 'p1', a: 'Bean & Leaf', b: 'Sunflower Bakehouse', offer: 'Buy a cappuccino at Bean & Leaf, get a free butter croissant at Sunflower — $9 total across both shops.', status: 'active', dates: 'Aug 10 – Sep 10', views: 5120, saves: 1734 },
  { id: 'p2', a: 'Bean & Leaf', b: 'Page & Plume Books', offer: 'Show your coffee receipt to get a 10% discount on any book all September.', status: 'scheduled', dates: 'Sep 1 – Oct 1', views: 0, saves: 0 },
]

const HISTORY = [
  { id: 'p3', a: 'Bean & Leaf', b: 'The Copper Studio', offer: 'Post-haircut cold brew $3 flat at Bean & Leaf with a Copper Studio receipt.', status: 'expired', dates: 'May 2 – Jun 2', views: 3880, saves: 902 },
  { id: 'p4', a: 'Bean & Leaf', b: 'Ember & Oak Grill', offer: 'Coffee + dessert pairing: 15% off espresso martinis on steak night.', status: 'expired', dates: 'Mar 12 – Apr 12', views: 2640, saves: 511 },
]

export default function CrossPromotions() {
  const [tab, setTab] = useState('active')
  const list = tab === 'active' ? ACTIVE : HISTORY
  const summary = ACTIVE.reduce((a, p) => a + p.views, 0)

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Cross-promotions</h1>
          <p>Co-op campaigns with your neighbors · {summary.toLocaleString()} combined views</p>
        </div>
        <Button to="/merchant/promotions/new"><Icon name="i-plus" size={15} /> Create promotion</Button>
      </div>

      <Tabs
        items={[
          { id: 'active', label: 'Active & scheduled', count: ACTIVE.length },
          { id: 'history', label: 'History', count: HISTORY.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {list.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="i-megaphone"
            title="No cross-promotions yet"
            text="Team up with a complementary shop nearby and split the cost of winning new regulars."
            action={{ to: '/merchant/promotions/new', variant: 'primary', children: 'Start a promotion' }}
          />
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: 18 }}>
          {list.map((p) => (
            <PromotionCard key={p.id} promo={{ id: p.id, partnerA: p.a, partnerB: p.b, offer: p.offer, status: p.status, dates: p.dates, views: p.views, saves: p.saves }} />
          ))}
        </div>
      )}

      <div className="card card-pad" style={{ marginTop: 30, background: 'var(--surface-2)' }}>
        <h4 style={{ marginBottom: 8 }}>
          <Icon name="i-info" size={16} style={{ verticalAlign: -3, marginRight: 6, color: 'var(--primary)' }} />
          How cross-promotions work
        </h4>
        <p className="small muted" style={{ margin: 0, maxWidth: 860 }}>
          You choose a partner business, agree on an offer that benefits both sides, and VendorHive bundles
          it into a single voucher. Customers save across both shops; you both share the reach. Unclaimed,
          your deal costs nothing.
        </p>
      </div>
    </div>
  )
}