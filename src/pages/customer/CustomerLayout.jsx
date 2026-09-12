import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SidebarLayout from '../../components/layout/SidebarLayout'
import { useAuth } from '../../utils/useAuth'
import { api } from '../../services/api'

export default function CustomerLayout() {
  const { user } = useAuth()
  const [counts, setCounts] = useState({ saved: 0, unread: 0 })

  useEffect(() => {
    let on = true
    Promise.all([api.me.saved(), api.me.notifications()])
      .then(([saved, notifs]) => {
        if (on) {
          setCounts({
            saved: Array.isArray(saved) ? saved.length : 0,
            unread: (Array.isArray(notifs) ? notifs : []).filter((n) => n.unread).length,
          })
        }
      })
      .catch(() => {})
    return () => {
      on = false
    }
  }, [])

  const NAV = [
    { to: '/account', label: 'Dashboard', icon: 'i-layout', end: true },
    { to: '/account/saved-deals', label: 'Saved deals', icon: 'i-bookmark', count: counts.saved },
    { to: '/account/following', label: 'Following', icon: 'i-heart' },
    { to: '/account/reviews', label: 'My reviews', icon: 'i-star' },
    { to: '/account/notifications', label: 'Notifications', icon: 'i-bell', count: counts.unread },
    { to: '/account/settings', label: 'Settings', icon: 'i-settings' },
  ]

  return (
    <SidebarLayout
      org={{ name: user?.name || 'Customer', sub: 'Customer account', gradient: 'linear-gradient(135deg,#3c6b4f,#d9a878)', logoutLabel: 'Log out' }}
      user={{ name: user?.name || '', sub: user?.email || '' }}
      nav={NAV}
      topActions={
        <Link to="/" style={{ fontSize: '0.82rem', fontWeight: 600 }}>← Back to site</Link>
      }
    />
  )
}