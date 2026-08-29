import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'

const HELP_BUSINESS = [
  { icon: 'i-megaphone', bg: 'rgba(60,107,79,.12)', c: 'var(--primary-600)', title: 'Lower acquisition costs', text: 'Join promotions with complementary shops and split the cost of winning a new regular.' },
  { icon: 'i-sparkles', bg: 'rgba(240,192,120,.28)', c: '#8a5a14', title: 'Hyper-local reach', text: 'Appear in front of neighbors already looking for exactly what you offer.' },
  { icon: 'i-shield', bg: 'rgba(96,144,192,.14)', c: 'var(--cyan-2)', title: 'Verification you trust', text: 'A clean, reviewed profile builds instant trust with every new customer.' },
  { icon: 'i-chart', bg: 'rgba(192,86,66,.12)', c: 'var(--danger-2)', title: 'Real performance data', text: 'Track views, saves, and redemptions so you know what actually works.' },
]

const VALUES = [
  'Local first — the shop across the street beats the chain across town.',
  'Small businesses win by working together, not by being everywhere.',
  'Trust is earned: verified profiles, helpful reviews, honest deals.',
  'The neighborhood is an economy. We help it circulate.',
]

export default function About() {
  return (
    <div className="container page page-narrow" style={{ maxWidth: 1000 }}>
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <span className="badge badge-green">Our mission</span>
        <h1 style={{ fontSize: '2.4rem', maxWidth: 760, margin: '18px auto 14px' }}>
          Every street deserves a thriving local economy.
        </h1>
        <p className="muted" style={{ maxWidth: 620, marginInline: 'auto', fontSize: '1.05rem' }}>
          VendorHive is a co-op directory and cross-promotion platform that helps independent
          shops compete together — by teaming up on deals instead of going it alone.
        </p>
      </div>

      <div className="card card-pad" style={{ padding: 34, marginBottom: 40 }}>
        <h3 style={{ marginBottom: 12 }}>Why we built this</h3>
        <p>
          Big platforms give chains an unfair edge: analytics, marketing muscle, and reach.
          Independent businesses rarely have those tools — but they have something better:
          neighbors who care. VendorHive exists to convert local goodwill into actual sales,
          through bundled cross-vendor promotions, personal recommendations, and alerts
          that put a shop's best offers back in front of the people who already love the block.
        </p>
        <div className="quote" style={{ marginBottom: 0 }}>“Spend $20 at the café, get 15% off at the barber” — that's a local economy working.</div>
      </div>

      <div className="section" style={{ marginTop: 0, marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>How it helps businesses</h2>
        <div className="grid grid-2">
          {HELP_BUSINESS.map((f) => (
            <div key={f.title} className="card card-hover feature-card">
              <span className="f-icon" style={{ background: f.bg, color: f.c }}>
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

      <div className="card card-pad" style={{ marginBottom: 40 }}>
        <h3 style={{ marginBottom: 16 }}>What we believe</h3>
        <div className="col" style={{ gap: 14 }}>
          {VALUES.map((v) => (
            <div key={v} className="row" style={{ gap: 12 }}>
              <Icon name="i-check-circle" size={20} style={{ color: 'var(--primary)', flex: 'none' }} />
              <span>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: 20 }}>
        <div className="card card-pad">
          <h4 style={{ marginBottom: 8 }}>
            <Icon name="i-mail" size={16} style={{ verticalAlign: -3, marginRight: 8, color: 'var(--primary)' }} />
            Contact info
          </h4>
          <div className="kv">
            <dt><Icon name="i-map-pin" size={15} style={{ verticalAlign: -2 }} /></dt><dd>14 Hive Court, Hive City</dd>
            <dt><Icon name="i-phone" size={15} style={{ verticalAlign: -2 }} /></dt><dd>(555) 010-1400</dd>
            <dt><Icon name="i-mail" size={15} style={{ verticalAlign: -2 }} /></dt><dd>hello@vendorhive.app</dd>
          </div>
          <Button to="/contact" variant="outline" style={{ marginTop: 16 }}>
            Reach out
          </Button>
        </div>
        <div className="card card-pad" style={{ background: 'var(--primary-800)', border: 'none' }}>
          <h4 style={{ color: '#fff' }}>Run a local business?</h4>
          <p className="small" style={{ color: '#bed0c4' }}>
            Join hundreds of neighbors already growing together on VendorHive.
          </p>
          <Button to="/register" variant="amber">Become a merchant</Button>
        </div>
      </div>
    </div>
  )
}