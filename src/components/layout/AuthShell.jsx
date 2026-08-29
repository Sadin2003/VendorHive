import { LogoMark } from '../ui/Logo'
import Icon from '../ui/Icon'

const BULLETS = [
  { icon: 'i-map-pin', title: 'Find hidden neighborhood gems', text: 'Interactive map with verified local shops, open now.' },
  { icon: 'i-bookmark', title: 'Save deals that stack', text: 'Bundle cross-vendor offers and get alert when new ones drop.' },
  { icon: 'i-megaphone', title: 'Merchants grow together', text: 'Co-op promotions that help the whole street win.' },
]

export default function AuthShell({ children }) {
  return (
    <div className="auth-shell">
      <aside className="auth-brand">
        <a href="/" className="brand" aria-label="VendorHive home">
          <LogoMark size={40} />
          <span>VendorHive</span>
        </a>
        <h1>Shop local. Grow together.</h1>
        <p className="lede">
          One neighborhood account for discovering businesses, stacking deals, and
          following the shops you actually visit.
        </p>
        <div className="auth-bullets">
          {BULLETS.map((b) => (
            <div key={b.title} className="row">
              <span className="b-icon">
                <Icon name={b.icon} size={19} />
              </span>
              <div>
                <strong>{b.title}</strong>
                <span>{b.text}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="auth-stats">
          <div><b>2,400+</b><span>local businesses</span></div>
          <div><b>18k</b><span>deals saved</span></div>
          <div><b>31</b><span>neighborhoods</span></div>
        </div>
      </aside>
      <main className="auth-main">
        <div className="auth-card">{children}</div>
      </main>
    </div>
  )
}