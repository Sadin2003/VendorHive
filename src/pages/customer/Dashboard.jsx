import { Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import DealCard from '../../components/cards/DealCard'
import BusinessCard from '../../components/cards/BusinessCard'
import Avatar from '../../components/ui/Avatar'

const RECOMMENDED = [
  { id: 'd7', merchant: 'Bean & Leaf × Sunflower Bakehouse', category: 'Cafés', title: 'Bundle: cappuccino + croissant duo for $9', tag: 'BUNDLE', discount: '$9 duo', views: 5120, saves: 1734, expiresIn: '7 days left' },
  { id: 'd6', merchant: 'The Copper Studio', category: 'Services', title: '15% off your first cut + free beard trim', tag: '15% OFF', discount: '15% off', views: 2475, saves: 703, expiresIn: '12 days left' },
  { id: 'd9', merchant: 'Glow & Grace Spa', category: 'Health & Beauty', title: '25% off the seasonal body ritual package', tag: '25% OFF', discount: '25% off', views: 1720, saves: 488, expiresIn: '8 days left' },
]

const NEARBY = [
  { id: 'm1', name: 'Bean & Leaf', category: 'Cafés', address: '12 Maple Lane', rating: 4.8, reviews: 214, verified: true, openNow: true, emoji: '☕' },
  { id: 'm2', name: 'Ember & Oak Grill', category: 'Restaurants', address: '88 Coal Street', rating: 4.6, reviews: 342, verified: true, openNow: true, emoji: '🍖' },
  { id: 'm5', name: 'The Copper Studio', category: 'Services', address: '27 Foundry Ave', rating: 4.7, reviews: 158, verified: true, openNow: true, emoji: '✂️' },
  { id: 'm4', name: 'Petal & Stem Florist', category: 'Gifts & Local', address: '45 Garden Walk', rating: 4.7, reviews: 98, verified: true, openNow: true, emoji: '💐' },
]

const ACTIVITY = [
  { icon: 'i-bookmark', tone: { bg: 'rgba(240,192,120,.28)', c: '#8a5a14' }, text: 'You saved the <b>Bean & Leaf × Sunflower Bakehouse</b> bundle deal.', time: '2h ago' },
  { icon: 'i-heart', tone: { bg: 'rgba(192,86,66,.12)', c: 'var(--danger-2)' }, text: 'You followed <b>The Copper Studio</b> — new promos will alert you.', time: 'Yesterday' },
  { icon: 'i-star', tone: { bg: 'rgba(60,107,79,.12)', c: 'var(--primary-600)' }, text: 'Your review of <b>Ember & Oak Grill</b> was marked helpful 6 times.', time: '2 days ago' },
  { icon: 'i-bell', tone: { bg: 'rgba(96,144,192,.14)', c: 'var(--cyan-2)' }, text: '<b>Glow & Grace Spa</b> launched a new 25% off promotion.', time: '4 days ago' },
]

export default function CustomerDashboard() {
  return (
    <div>
      <div className="card card-pad" style={{ marginBottom: 26, background: 'var(--primary-800)', border: 'none' }}>
        <div className="row-between" style={{ flexWrap: 'wrap', gap: 14 }}>
          <div className="row">
            <Avatar text="Alex Rivera" size="lg" gradient="linear-gradient(135deg,#3c6b4f,#d9a878)" />
            <div>
              <div className="small" style={{ color: '#b9c9bf' }}>Good evening,</div>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.5rem' }}>Alex Rivera</h2>
            </div>
          </div>
          <div className="row" style={{ gap: 22 }}>
            <div><b style={{ color: '#fff', fontSize: '1.3rem', display: 'block' }}>12</b><span style={{ color: '#9fb2a6', fontSize: '0.8rem' }}>deals saved</span></div>
            <div><b style={{ color: '#fff', fontSize: '1.3rem', display: 'block' }}>8</b><span style={{ color: '#9fb2a6', fontSize: '0.8rem' }}>following</span></div>
            <div><b style={{ color: '#fff', fontSize: '1.3rem', display: 'block' }}>23</b><span style={{ color: '#9fb2a6', fontSize: '0.8rem' }}>reviews</span></div>
          </div>
        </div>
      </div>

      <div className="section-head">
        <div>
          <h2>Recommended for you</h2>
          <p>Tailored from the categories you save most</p>
        </div>
        <Link to="/deals" className="section-link">See all deals →</Link>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {RECOMMENDED.map((d) => (
          <DealCard key={d.id} deal={d} saved={d.id === 'd7'} />
        ))}
      </div>

      <div className="section-head" style={{ marginTop: 40 }}>
        <div>
          <h2>Nearby businesses</h2>
          <p>Within a short walk of your saved address</p>
        </div>
        <Link to="/explore" className="section-link">Open map →</Link>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
        {NEARBY.map((b) => (
          <BusinessCard key={b.id} business={b} />
        ))}
      </div>

      <div className="section-head" style={{ marginTop: 40 }}>
        <div>
          <h2>Recent activity</h2>
          <p>Everything happening in your hive</p>
        </div>
        <Link to="/account/notifications" className="section-link">Notifications →</Link>
      </div>
      <div className="card">
        {ACTIVITY.map((a, i) => (
          <div key={i} className="notif">
            <span className="n-icon" style={{ background: a.tone.bg, color: a.tone.c }}>
              <Icon name={a.icon} />
            </span>
            <span className="n-text" dangerouslySetInnerHTML={{ __html: a.text }} />
            <span className="n-time">{a.time}</span>
          </div>
        ))}
      </div>

      <div className="section" style={{ marginTop: 34 }}>
        <Button to="/explore" variant="outline">
          <Icon name="i-search" size={16} />
          Discover more local businesses
        </Button>
      </div>
    </div>
  )
}