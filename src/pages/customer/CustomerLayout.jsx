import SidebarLayout from '../../components/layout/SidebarLayout'

const NAV = [
  { to: '/account', label: 'Dashboard', icon: 'i-layout', end: true },
  { to: '/account/saved-deals', label: 'Saved deals', icon: 'i-bookmark', count: 3 },
  { to: '/account/following', label: 'Following', icon: 'i-heart' },
  { to: '/account/reviews', label: 'My reviews', icon: 'i-star' },
  { to: '/account/notifications', label: 'Notifications', icon: 'i-bell', count: 2 },
  { to: '/account/settings', label: 'Settings', icon: 'i-settings' },
]

export default function CustomerLayout() {
  return (
    <SidebarLayout
      org={{ name: 'Alex Rivera', sub: 'Customer account', gradient: 'linear-gradient(135deg,#3c6b4f,#d9a878)', logoutLabel: 'Log out' }}
      user={{ name: 'Alex Rivera', sub: 'alex@example.com' }}
      nav={NAV}
      topActions={
        <a href="/" style={{ fontSize: '0.82rem', fontWeight: 600 }}>← Back to site</a>
      }
    />
  )
}