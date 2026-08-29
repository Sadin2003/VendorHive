import SidebarLayout from '../../components/layout/SidebarLayout'

const NAV = [
  { to: '/merchant', label: 'Dashboard', icon: 'i-layout', end: true },
  { to: '/merchant/profile', label: 'Business profile', icon: 'i-store' },
  { to: '/merchant/deals', label: 'Deals', icon: 'i-tag', count: 3 },
  { to: '/merchant/promotions', label: 'Cross-promotions', icon: 'i-megaphone', count: 1 },
  { to: '/merchant/reviews', label: 'Reviews', icon: 'i-star' },
  { to: '/merchant/notifications', label: 'Notifications', icon: 'i-bell', count: 4 },
]

export default function MerchantLayout() {
  return (
    <SidebarLayout
org={{ name: 'Bean & Leaf', sub: 'Specialty café · Maple Lane', gradient: 'linear-gradient(135deg,#294637,#d9a878)', logoutLabel: 'Log out' }}
    user={{ name: 'Maya Chen', sub: 'Owner · Bean & Leaf' }}
    nav={NAV}
    topActions={
        <span className="badge badge-green" style={{ fontSize: '0.76rem' }}>
          Verified merchant
        </span>
      }
    />
  )
}