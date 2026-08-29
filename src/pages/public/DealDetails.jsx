import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import DealCard from '../../components/cards/DealCard'
import { gradientFor } from '../../utils/gradients'
import { useToast } from '../../components/ui/useToast'

const DEALS = {
  d1: {
    id: 'd1', merchant: 'Bean & Leaf', category: 'Cafés', title: 'BOGO any signature brew after 3pm', tag: 'BOGO', discount: 'Buy 1 Get 1',
    desc: 'Beat the afternoon slump — after 3pm every day, buy any signature brew (double espresso, oat latte, cold drip) and get a second one free. Perfect for a study date or a walk around Maple Lane.',
    terms: ['Valid after 3:00 pm, daily, at the Maple Lane location only.', 'One free drink per transaction; reward cannot be combined with the cross-vendor bundle deal.', 'Voucher must be shown at the counter — no screenshots, no problem either.', 'Not valid on delivery; takeaway and dine-in welcome.', 'No cash value and expires with the campaign.'],
    businesses: [{ id: 'm1', name: 'Bean & Leaf', category: 'Cafés', addr: '12 Maple Lane', rating: 4.8, reviews: 214, role: 'Host' }],
    starts: 'Aug 12, 2026', ends: 'Sep 6, 2026', views: 4210, saves: 1180, coverKey: 'Bean & Leaf',
  },
  d2: {
    id: 'd2', merchant: 'Ember & Oak Grill', category: 'Restaurants', title: '20% off the Tuesday steak night menu', tag: '20% OFF', discount: '20% off',
    desc: 'Every Tuesday, the wood-fired team grills a 21-day dry-aged flat iron with local chimichurri. VendorHive members get 20% off the entire steak-night menu.',
    terms: ['Tuesdays only, 5:00 – 10:00 pm.', '20% applies to the steak night menu; excludes drinks and gratuity.', 'Show your VendorHive voucher at booking or on arrival.', 'Limited tables — reservations strongly recommended.', 'Not valid on public holidays.'],
    businesses: [{ id: 'm2', name: 'Ember & Oak Grill', category: 'Restaurants', addr: '88 Coal Street', rating: 4.6, reviews: 342, role: 'Host' }],
    starts: 'Aug 5, 2026', ends: 'Aug 31, 2026', views: 3310, saves: 940, coverKey: 'Ember & Oak Grill',
  },
  d7: {
    id: 'd7', merchant: 'Bean & Leaf × Sunflower Bakehouse', category: 'Cafés', title: 'Bundle: cappuccino + croissant duo for $9', tag: 'BUNDLE', discount: '$9 duo',
    desc: 'The classic neighborhood pairing. Grab a cappuccino from Bean & Leaf and a butter croissant from Sunflower Bakehouse — split across two shops for one bundled price of $9. A true cross-promotion, savings across the street.',
    terms: ['One voucher = one coffee + one croissant, $9 total.', 'Visit Bean & Leaf first to redeem the coffee side.', 'The croissant side must be used within 72 hours of the coffee.', 'Voucher valid for single redemption only.', 'Not stackable with the after-3pm BOGO.'],
    businesses: [
      { id: 'm1', name: 'Bean & Leaf', category: 'Cafés', addr: '12 Maple Lane', rating: 4.8, reviews: 214, role: 'Partner A' },
      { id: 'm3', name: 'Sunflower Bakehouse', category: 'Bakeries', addr: '3 Meadow Road', rating: 4.9, reviews: 176, role: 'Partner B' },
    ],
    starts: 'Aug 10, 2026', ends: 'Sep 10, 2026', views: 5120, saves: 1734, coverKey: 'Bean & Leaf × Sunflower Bakehouse',
  },
}

const FALLBACK_DEAL = {
  id: 'd-x', merchant: 'Co-op Special', category: 'Local', title: 'Exclusive neighborhood offer', tag: 'LOCAL', discount: 'Local deal',
  desc: 'A limited-time offer from a verified neighborhood merchant. Grab it before it expires and tell your neighbors about it.',
  terms: ['Redeem directly with the participating business.', 'One redemption per customer per campaign.', 'See the business page for full details.'],
  businesses: [{ id: 'm1', name: 'Bean & Leaf', category: 'Cafés', addr: '12 Maple Lane', rating: 4.8, reviews: 214, role: 'Host' }],
  starts: 'Aug 1, 2026', ends: 'Aug 31, 2026', views: 999, saves: 200, coverKey: 'Bean & Leaf',
}

const RELATED = [
  { id: 'd1', merchant: 'Bean & Leaf', category: 'Cafés', title: 'BOGO any signature brew after 3pm', tag: 'BOGO', discount: 'Buy 1 Get 1', views: 4210, saves: 1180, expiresIn: '6 days left' },
  { id: 'd3', merchant: 'Sunflower Bakehouse', category: 'Bakeries', title: 'Free dozen rolls with any custom cake order', tag: 'FREE', discount: 'Free dozen rolls', views: 2140, saves: 610, expiresIn: '10 days left' },
  { id: 'd5', merchant: 'Volt City Repairs', category: 'Electronics', title: 'Free diagnostics with any repair over $50', tag: 'FREE', discount: 'Free check-up', views: 1890, saves: 520, expiresIn: '9 days left' },
]

export default function DealDetails() {
  const { id } = useParams()
  const d = DEALS[id] || FALLBACK_DEAL
  const toast = useToast()
  const [saved, setSaved] = useState(false)

  return (
    <div className="container page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <Icon name="i-chevron-right" size={14} />
        <Link to="/deals">Deals</Link>
        <Icon name="i-chevron-right" size={14} />
        <span style={{ color: 'var(--text)' }}>{d.title}</span>
      </nav>

      <div className="grid deal-layout" style={{ gap: 24, alignItems: 'start' }}>
        <div>
          <div className="card card-hover deal-card" style={{ overflow: 'visible' }}>
            <div className="deal-cover" style={{ background: gradientFor(d.coverKey), borderRadius: 'var(--radius) var(--radius) 0 0', height: 220 }}>
              <span className="deal-tag" style={{ fontSize: '0.95rem', padding: '7px 16px' }}>{d.tag}</span>
            </div>
            <div className="deal-body" style={{ padding: 26 }}>
              <div className="merchant">
                <span>{d.merchant}</span>
                <span style={{ opacity: 0.55 }}>·</span>
                <span>{d.category}</span>
              </div>
              <h1 style={{ fontSize: '1.8rem', margin: '8px 0 12px' }}>{d.title}</h1>
              <div className="row" style={{ gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <span className="badge badge-amber" style={{ fontSize: '0.95rem', padding: '6px 16px' }}>{d.discount}</span>
                <span className="badge badge-green">Verified merchant</span>
              </div>
              <p>{d.desc}</p>
              <div className="row" style={{ gap: 22, flexWrap: 'wrap', marginTop: 8 }}>
                <span className="muted small"><Icon name="i-calendar" size={15} style={{ verticalAlign: -2, marginRight: 6 }} />{d.starts} → {d.ends}</span>
                <span className="muted small"><Icon name="i-eye" size={15} style={{ verticalAlign: -2, marginRight: 6 }} />{d.views.toLocaleString()} views</span>
                <span className="muted small"><Icon name="i-bookmark-o" size={15} style={{ verticalAlign: -2, marginRight: 6 }} />{d.saves.toLocaleString()} saves</span>
              </div>
              <hr className="divider" />
              <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                <Button variant={saved ? 'primary' : 'outline'} onClick={() => { setSaved((s) => !s); toast(saved ? 'Deal removed from saved' : 'Deal saved!') }}>
                  <Icon name={saved ? 'i-bookmark' : 'i-bookmark-o'} />
                  {saved ? 'Saved' : 'Save deal'}
                </Button>
                <Button variant="outline" onClick={() => toast('Link copied')}><Icon name="i-share" /> Share</Button>
                <Button variant="amber" onClick={() => toast('Show this screen at checkout')}><Icon name="i-zap" /> Redeem in store</Button>
              </div>
            </div>
          </div>

          {/* Participating businesses */}
          <div className="card card-pad" style={{ marginTop: 24 }}>
            <h4 style={{ marginBottom: 16 }}>
              Participating businesses
              {d.businesses.length > 1 && <Badge tone="cyan" style={{ marginLeft: 10 }}>Cross-promotion</Badge>}
            </h4>
            <div className="col" style={{ gap: 14 }}>
              {d.businesses.map((b) => (
                <div key={b.id} className="row" style={{ padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
                  <Avatar text={b.name} size="md" />
                  <div className="grow">
                    <div className="bold">{b.name}</div>
                    <div className="small muted">{b.addr} · {b.category} · {b.rating.toFixed(1)}★ ({b.reviews})</div>
                  </div>
                  <div className="col" style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Badge tone={b.role === 'Host' ? 'green' : 'amber'}>{b.role}</Badge>
                    <Link to={`/vendors/${b.id}`} className="btn-link tiny">View profile</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side column */}
        <div className="col" style={{ gap: 20 }}>
          <div className="card card-pad">
            <h4 style={{ marginBottom: 12 }}>Terms & conditions</h4>
            <ul style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {d.terms.map((t) => (
                <li key={t} className="small" style={{ color: 'var(--text-2)' }}>{t}</li>
              ))}
            </ul>
          </div>
          <div className="card card-pad">
            <h4 style={{ marginBottom: 12 }}>How to redeem</h4>
            <div className="kv">
              <dt>1</dt><dd>Save the deal to your account</dd>
              <dt>2</dt><dd>Visit the hosting business</dd>
              <dt>3</dt><dd>Show this page at checkout</dd>
            </div>
          </div>
          <div className="card card-pad" style={{ background: 'var(--primary-800)', border: 'none' }}>
            <div className="row" style={{ gap: 14 }}>
              <Icon name="i-bell" size={26} style={{ color: 'var(--amber)' }} />
              <div>
                <div className="bold" style={{ color: '#fff' }}>Never miss a deal</div>
                <p className="small" style={{ color: '#bed0c4', margin: '4px 0 10px' }}>Follow {d.businesses[0]?.name || 'this business'} and get alerted when new promotions launch.</p>
                <Button to={`/vendors/${d.businesses[0]?.id || 'm1'}`} variant="amber" size="sm">Follow business</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Related deals</h2>
            <p>More neighborhood savings</p>
          </div>
          <Link to="/deals" className="section-link">See all →</Link>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {RELATED.map((r) => (
            <DealCard key={r.id} deal={r} />
          ))}
        </div>
      </div>
    </div>
  )
}