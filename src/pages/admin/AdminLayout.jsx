import SidebarLayout from '../../components/layout/SidebarLayout'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: 'i-layout', end: true },
  { to: '/admin/verification', label: 'Merchant verification', icon: 'i-shield', count: 4 },
  { to: '/admin/users', label: 'Users', icon: 'i-users' },
  { to: '/admin/businesses', label: 'Businesses', icon: 'i-store' },
  { to: '/admin/reviews', label: 'Reviews', icon: 'i-star', count: 3 },
  { to: '/admin/analytics', label: 'Analytics', icon: 'i-chart' },
  { to: '/admin/settings', label: 'Settings', icon: 'i-settings' },
]

export default function AdminLayout() {
  return (
    <SidebarLayout
      org={{ name: 'VendorHive', sub: 'Admin console', gradient: 'linear-gradient(135deg,#1f3a2c,#6fbf9f)', logoutLabel: 'Log out' }}
      user={{ name: 'Dara Osei', sub: 'Community lead' }}
      nav={NAV}
      footerNote="Serving 1,208 businesses in Hive City"
    />
  )
}