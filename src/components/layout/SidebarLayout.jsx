import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import Icon from '../ui/Icon'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import { useAuth } from '../../utils/useAuth'

export default function SidebarLayout({ org, user, nav, topActions }) {
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <div className="shell">
      <div className={`sidebar-backdrop ${open ? 'open' : ''}`} onClick={close} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {org && (
          <div className="sidebar-org">
            <Avatar text={org.name} size="md" gradient={org.gradient} />
            <div className="grow">
              <div className="s-name">{org.name}</div>
              <div className="s-sub">{org.sub}</div>
            </div>
          </div>
        )}
        <nav className="s-nav" aria-label="Sidebar">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={close}
            >
              <Icon name={item.icon} />
              {item.label}
              {typeof item.count === 'number' && item.count > 0 && <span className="count">{item.count}</span>}
            </NavLink>
          ))}
        </nav>
        {(org?.logoutLabel || user) && (
          <div className="sidebar-user">
            {user && (
              <>
                <Avatar text={user.name} size="sm" gradient={user.gradient} />
                <div className="grow">
                  <div className="s-name">{user.name}</div>
                  <div className="s-sub">{user.sub}</div>
                </div>
              </>
            )}
            {org?.logoutLabel && (
              <Button
                to="/"
                variant="ghost"
                className="btn-icon"
                onClick={() => {
                  logout()
                  close()
                }}
                aria-label="Log out"
                title="Log out"
              >
                <Icon name="i-log-out" size={18} style={{ color: 'var(--text-muted)' }} />
              </Button>
            )}
          </div>
        )}
      </aside>
      <div className="shell-main">
        <main className="shell-body">
          <div className="row-between" style={{ marginBottom: 8 }}>
            <button type="button" className="btn btn-outline btn-sm sidebar-toggle" onClick={() => setOpen(true)}>
              <Icon name="i-menu" size={15} />
              Menu
            </button>
            {topActions}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  )
}