import { useEffect, useState } from 'react'
import SidebarLayout from '../../components/layout/SidebarLayout'
import { api } from '../../services/api'
import { useAuth } from '../../utils/useAuth'

export default function AdminLayout() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ pendingVerification: 0, flaggedReviews: 0 })

  useEffect(() => {
    let active = true
    api.admin
      .stats()
      .then((res) => {
        if (!active || !res.data) return
        setStats({ pendingVerification: res.data.pendingVerification || 0, flaggedReviews: res.data.flaggedReviews || 0 })
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  const NAV = [
    { to: '/admin', label: 'Dashboard', icon: 'i-layout', end: true },
    { to: '/admin/verification', label: 'Merchant verification', icon: 'i-shield', count: stats.pendingVerification },
    { to: '/admin/users', label: 'Users', icon: 'i-users' },
    { to: '/admin/businesses', label: 'Businesses', icon: 'i-store' },
    { to: '/admin/reviews', label: 'Reviews', icon: 'i-star', count: stats.flaggedReviews },
    { to: '/admin/analytics', label: 'Analytics', icon: 'i-chart' },
    { to: '/admin/settings', label: 'Settings', icon: 'i-settings' },
  ]

  return (
    <SidebarLayout
      org={{ name: 'VendorHive', sub: 'Admin console', gradient: 'linear-gradient(135deg,#1f3a2c,#6fbf9f)', logoutLabel: 'Log out' }}
      user={{ name: user?.name || 'Admin', sub: 'Community lead' }}
      nav={NAV}
      footerNote="Serving businesses in Hive City"
    />
  )
}
