import { Link } from 'react-router-dom'
import Logo from '../ui/Logo'
import Icon from '../ui/Icon'

const COLUMNS = [
  {
    title: 'Discover',
    links: [
      { to: '/explore', label: 'Browse businesses' },
      { to: '/deals', label: 'Active deals' },
      { to: '/about', label: 'About VendorHive' },
      { to: '/contact', label: 'Contact us' },
    ],
  },
  {
    title: 'For merchants',
    links: [{ to: '/register', label: 'Join VendorHive' }],
  },
  {
    title: 'Support',
    links: [
      { to: '/contact', label: 'Help center' },
      { to: '/about', label: 'Our mission' },
      { to: '/login', label: 'Log in' },
      { to: '/register', label: 'Create account' },
    ],
  },
]

export default function PublicFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Logo>
              <span style={{ color: '#fff' }}>VendorHive</span>
            </Logo>
            <p className="footer-about" style={{ marginTop: 16 }}>
              The neighborhood co-op directory. Discover verified local businesses, stack
              cross-vendor deals, and grow together with the merchants around you.
            </p>
            <div className="social-links" style={{ marginTop: 18 }}>
              <a href="#instagram" aria-label="Instagram"><Icon name="i-camera" /></a>
              <a href="#facebook" aria-label="Facebook"><Icon name="i-globe" /></a>
              <a href="#x" aria-label="X"><Icon name="i-message" /></a>
              <a href="#youtube" aria-label="YouTube"><Icon name="i-play" /></a>
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} VendorHive. Shop local, grow together.</span>
          <span>Hive City, Capital District</span>
        </div>
      </div>
    </footer>
  )
}