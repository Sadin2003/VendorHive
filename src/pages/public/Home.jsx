import { Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import SearchInput from '../../components/ui/SearchInput'
import BusinessCard from '../../components/cards/BusinessCard'
import DealCard from '../../components/cards/DealCard'
import { gradientFor } from '../../utils/gradients'

const CATEGORIES = [
  { name: 'Restaurants', icon: '🍽', count: 128 },
  { name: 'Cafés', icon: '☕', count: 84 },
  { name: 'Bakeries', icon: '🥐', count: 46 },
  { name: 'Clothing', icon: '👕', count: 61 },
  { name: 'Electronics', icon: '🔌', count: 39 },
  { name: 'Services', icon: '✂️', count: 97 },
  { name: 'Health & Beauty', icon: '💆', count: 73 },
  { name: 'Gifts & Local', icon: '🎁', count: 58 },
]

const FEATURED = [
  { id: 'm1', name: 'Bean & Leaf', category: 'Cafés', address: '12 Maple Lane', rating: 4.8, reviews: 214, verified: true, featured: true, openNow: true, emoji: '☕' },
  { id: 'm2', name: 'Ember & Oak Grill', category: 'Restaurants', address: '88 Coal Street', rating: 4.6, reviews: 342, verified: true, featured: true, openNow: true, emoji: '🍖' },
  { id: 'm3', name: 'Sunflower Bakehouse', category: 'Bakeries', address: '3 Meadow Road', rating: 4.9, reviews: 176, verified: true, featured: true, openNow: false, emoji: '🥐' },
  { id: 'm5', name: 'The Copper Studio', category: 'Services', address: '27 Foundry Ave', rating: 4.7, reviews: 158, verified: true, featured: true, openNow: true, emoji: '✂️' },
]

const DEALS = [
  { id: 'd1', merchant: 'Bean & Leaf', category: 'Cafés', title: 'BOGO any signature brew after 3pm', tag: 'BOGO', discount: 'Buy 1 Get 1', views: 4210, saves: 1180, expiresIn: '6 days left' },
  { id: 'd2', merchant: 'Ember & Oak Grill', category: 'Restaurants', title: '20% off the Tuesday steak night menu', tag: '20% OFF', discount: '20% off', views: 3310, saves: 940, expiresIn: '3 days left' },
  { id: 'd5', merchant: 'Volt City Repairs', category: 'Electronics', title: 'Free diagnostics with any repair over $50', tag: 'FREE', discount: 'Free check-up', views: 1890, saves: 520, expiresIn: '9 days left' },
]

const STEPS = [
  { icon: 'i-search', title: 'Discover nearby gems', text: 'Browse verified local businesses on an interactive map and filter by category, hours, or active deals.' },
  { icon: 'i-bookmark', title: 'Save the deals you love', text: 'Bookmark cross-vendor bundles and follow merchants to get instant alerts when new promotions drop.' },
  { icon: 'i-megaphone', title: 'Grow the local hive', text: 'Merchants team up on joint promotions while you enjoy bigger, exclusive neighborhood rewards.' },
]

const FEATURE_ICONS = [
  { icon: 'i-map-pin', color: 'var(--primary-600)', bg: 'rgba(60,107,79,.12)', title: 'Hyper-local first', text: 'Discovery ranked by real proximity — the block you are on beats the chain across town.' },
  { icon: 'i-shield', color: 'var(--cyan-2)', bg: 'rgba(96,144,192,.14)', title: 'Verified businesses', text: 'Every merchant account passes a manual review before their deals can go live.' },
  { icon: 'i-sparkles', color: '#8a5a14', bg: 'rgba(240,192,120,.28)', title: 'Personalized picks', text: 'Recommendations learn from your saved deals, favorite categories, and browsing history.' },
  { icon: 'i-refresh', color: 'var(--danger-2)', bg: 'rgba(192,86,66,.12)', title: 'Reviews that matter', text: 'Helpful-vote reviews surface real feedback, so you choose with confidence.' },
]

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-blob a" />
        <div className="hero-blob b" />
        <div className="container">
          <span className="badge badge-green" style={{ padding: '6px 14px', fontSize: '0.78rem', marginBottom: 18 }}>
            🌱 {CATEGORIES.reduce((a, c) => a + c.count, 0)}+ local businesses on VendorHive
          </span>
          <h1>
            Discover local. <span style={{ color: 'var(--primary)' }}>Deal big.</span>
          </h1>
          <p className="sub">
            VendorHive connects you with verified neighborhood businesses and bundles
            cross-vendor deals — one deal at the café, a discount at the barber, savings all block round.
          </p>
          <form
            className="hero-search"
            onSubmit={(e) => {
              e.preventDefault()
              window.location.href = '/explore'
            }}
          >
            <SearchInput placeholder="Search businesses, deals, or categories…" onChange={() => {}} />
            <Button type="submit">
              <Icon name="i-search" />
              Search
            </Button>
          </form>
          <div className="hero-popular">
            <span>Popular:</span>
            {['Restaurants', 'Cafés', 'Bakeries', 'Electronics'].map((c) => (
              <Link key={c} to={`/explore?cat=${encodeURIComponent(c)}`} className="pill">
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container page" style={{ paddingTop: 12 }}>
        {/* Categories */}
        <div className="section">
          <div className="section-head">
            <div>
              <h2>Browse by category</h2>
              <p>Eight ways to shop your neighborhood</p>
            </div>
            <Link to="/explore" className="section-link">
              Explore all →
            </Link>
          </div>
          <div className="grid grid-4">
            {CATEGORIES.map((c) => (
              <Link key={c.name} to={`/explore?cat=${encodeURIComponent(c.name)}`} className="card card-hover category-card">
                <span className="cat-icon" style={{ background: gradientFor(c.name), color: '#fff' }}>
                  {c.icon}
                </span>
                <div>
                  <div className="cat-name">{c.name}</div>
                  <div className="cat-count">{c.count} businesses</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured businesses */}
        <div className="section">
          <div className="section-head">
            <div>
              <h2>Featured businesses</h2>
              <p>Loved spots from the Hive community</p>
            </div>
            <Link to="/explore" className="section-link">
              View all →
            </Link>
          </div>
          <div className="carousel">
            {FEATURED.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        </div>

        {/* Popular deals */}
        <div className="section">
          <div className="section-head">
            <div>
              <h2>Popular deals right now</h2>
              <p>Bundle-ready offers from verified merchants</p>
            </div>
            <Link to="/deals" className="section-link">
              See all deals →
            </Link>
          </div>
          <div className="grid grid-3">
            {DEALS.map((d) => (
              <DealCard key={d.id} deal={d} />
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="section">
          <div className="section-head" style={{ justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ marginBottom: 4 }}>How VendorHive works</h2>
              <p>Three steps from “where do I eat?” to “what a local deal”</p>
            </div>
          </div>
          <div className="grid grid-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="card card-pad step-card">
                <span className="step-num">{i + 1}</span>
                <Icon name={s.icon} size={30} style={{ color: 'var(--primary-600)', marginBottom: 12 }} />
                <h4>{s.title}</h4>
                <p className="muted small">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why choose us */}
        <div className="section">
          <div className="section-head">
            <div>
              <h2>Why choose VendorHive</h2>
              <p>Built for the block, not the boardroom</p>
            </div>
          </div>
          <div className="grid grid-2">
            {FEATURE_ICONS.map((f) => (
              <div key={f.title} className="card card-hover feature-card">
                <span className="f-icon" style={{ background: f.bg, color: f.color }}>
                  <Icon name={f.icon} />
                </span>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Merchant CTA */}
        <div className="section">
          <div className="cta-band">
            <div className="blob" />
            <div style={{ position: 'relative' }}>
              <h2>Own a business? Grow with your neighbors.</h2>
              <p>
                List your shop, launch cross-promotions with nearby partners, and reach
                customers who already love the block.
              </p>
            </div>
            <div className="row" style={{ position: 'relative', flexWrap: 'wrap' }}>
              <Button to="/register" variant="amber" size="lg">
                Become a merchant
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}