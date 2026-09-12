import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SidebarLayout from '../../components/layout/SidebarLayout'
import { useAuth } from '../../utils/useAuth'
import { api } from '../../services/api'
import { gradientFor } from '../../utils/gradients'

export default function MerchantLayout() {
  const { user } = useAuth()
  const [meta, setMeta] = useState({ name: '', id: '', grade: '', counts: { deals: 0, promotions: 0, unread: 0 } })

  useEffect(() => {
    let on = true
    Promise.all([
      api.merchant.profile(),
      api.merchant.deals(),
      api.merchant.promotions(),
      api.me.notifications(),
    ])
      .then(([profile, deals, promotions, notifs]) => {
        if (on) {
          setMeta({
            name: profile?.businessName || user?.name || 'Business',
            id: profile?.id || '',
            grade: gradientFor(profile?.businessName || user?.name || 'Me'),
            counts: {
              deals: Array.isArray(deals) ? deals.length : 0,
              promotions: (Array.isArray(promotions) ? promotions : []).filter((p) => p.status === 'awaiting').length,
              unread: (Array.isArray(notifs) ? notifs : []).filter((n) => n.unread).length,
            },
          })
        }
      })
      .catch(() => {})
    return () => {
      on = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const NAV = [
    { to: '/merchant', label: 'Dashboard', icon: 'i-layout', end: true },
    { to: '/merchant/profile', label: 'Business profile', icon: 'i-store' },
    { to: '/merchant/deals', label: 'Deals', icon: 'i-tag', count: meta.counts.deals },
    { to: '/merchant/promotions', label: 'Cross-promotions', icon: 'i-megaphone', count: meta.counts.promotions },
    { to: '/merchant/reviews', label: 'Reviews', icon: 'i-star' },
    { to: '/merchant/notifications', label: 'Notifications', icon: 'i-bell', count: meta.counts.unread },
  ]

  return (
    <SidebarLayout
      org={{ name: meta.name, sub: user?.category || 'Merchant account', gradient: meta.grade, logoutLabel: 'Log out' }}
      user={{ name: user?.name || '', sub: user?.email || '' }}
      nav={NAV}
      topActions={
        meta.id ? (
          <Link to={`/businesses/${meta.id}`} style={{ fontSize: '0.82rem', fontWeight: 600 }}>
            View storefront →
          </Link>
        ) : null
      }
    />
  )
}