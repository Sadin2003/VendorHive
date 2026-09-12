import { useEffect, useState } from 'react'
import SidebarLayout from '../../components/layout/SidebarLayout'
import { useAuth } from '../../utils/useAuth'
import { api } from '../../services/api'

export default function AdminLayout() {
  const { user } = useAuth()
  const [counts, setCounts] = useState({ verification: 0, moderation: 0 })

  useEffect(() => {
    let on = true
    Promise.all([api.admin.verification(), api.admin.reviews('queue')])
      .then(([queue, reviews]) => {
        if (on) {
          setCounts({
            verification: Array.isArray(queue) ? queue.length : 0,
            moderation: Array.isArray(reviews) ? reviews.length : 0,
          })
        }
      })
      .catch(() => {})
    return () => {
      on = false
    }
  }, [])

  const NAV = [
    { to: '/admin', label: 'Dashboard', icon: 'i-layout', end: true },
    { to: '/admin/verification', label: 'Merchant verification', icon: 'i-shield', count: counts.verification },
    { to: '/admin/users', label: 'Users', icon: 'i-users' },
    { to: '/admin/businesses', label: 'Businesses', icon: 'i-store' },
    { to: '/admin/reviews', label: 'Reviews', icon: 'i-star', count: counts.moderation },
    { to: '/admin/analytics', label: 'Analytics', icon: 'i-chart' },
    { to: '/admin/settings', label: 'Settings', icon: 'i-settings' },
  ]

  return (
    <SidebarLayout
      org={{ name: 'VendorHive', sub: 'Admin console', gradient: 'linear-gradient(135deg,#1f3a2c,#6fbf9f)', logoutLabel: 'Log out' }}
      user={{ name: user?.name || 'Admin', sub: user?.email || '' }}
      nav={NAV}
    />
  )
}