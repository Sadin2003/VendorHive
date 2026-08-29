import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import Icon from '../ui/Icon'
import { useAuth } from '../../utils/useAuth'

const LINKS = [
  { to: '/explore', label: 'Explore' },
  { to: '/deals', label: 'Deals' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

const PORTAL = { customer: '/account', merchant: '/merchant', admin: '/admin' }
const NOTIFS = { customer: '/account/notifications', merchant: '/merchant/notifications' }

export default function PublicNavbar() {
  const { user } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const from = location.pathname + location.search
  const isAdmin = user?.role === 'admin'
  const links = isAdmin ? [] : LINKS
  const profileTo = isAdmin ? '/admin' : user ? PORTAL[user.role] || '/account' : '/register'
  const notifTo = user ? NOTIFS[user.role] : null
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Logo />
        <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className={`nav-actions ${open ? 'open' : ''}`}>
          {user ? (
            <>
              {notifTo && open && (
                <Button to={notifTo} variant="outline" onClick={() => setOpen(false)}>
                  <Icon name="i-bell" size={16} />
                  Notifications
                </Button>
              )}
              {notifTo && (
                <Button to={notifTo} variant="ghost" className="btn-icon hide-sm" aria-label="Notifications" title="Notifications">
                  <Icon name="i-bell" size={18} />
                </Button>
              )}
              {open && (
                <Button to={profileTo} variant="primary" onClick={() => setOpen(false)}>
                  Profile
                </Button>
              )}
              <Button to={profileTo} variant="primary" className="hide-sm">
                Profile
              </Button>
            </>
          ) : (
            <>
              {open && (
                <Button to="/login" variant="outline" onClick={() => setOpen(false)}>
                  Log in
                </Button>
              )}
              <Button to="/login" variant="ghost" className="hide-sm" state={{ from }}>
                Log in
              </Button>
              <Button to="/register" variant="primary" state={{ from }}>
                Sign up
              </Button>
            </>
          )}
        </div>
        <button type="button" className="nav-burger" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          <Icon name={open ? 'i-x' : 'i-menu'} />
        </button>
      </div>
    </header>
  )
}