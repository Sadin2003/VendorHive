import { useState } from 'react'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import NotificationItem from '../../components/cards/NotificationItem'
import { useToast } from '../../components/ui/useToast'

const INITIAL = [
  { id: 'n1', type: 'deal', text: 'The <b>Bean & Leaf × Sunflower Bakehouse</b> bundle you saved only has 7 days left.', time: '2 hours ago', unread: true },
  { id: 'n2', type: 'promotion', text: '<b>The Copper Studio</b> launched a new cross-promotion with Ember & Oak Grill.', time: 'Yesterday at 4:20 pm', unread: true },
  { id: 'n3', type: 'review', text: 'You review of <b>Ember & Oak Grill</b> was marked Helpful 12 times.', time: '2 days ago', unread: true },
  { id: 'n4', type: 'system', text: 'Welcome to VendorHive! Set your location to improve deal recommendations.', time: 'Aug 20', unread: false },
  { id: 'n5', type: 'promotion', text: '<b>Glow & Grace Spa</b> launched: 25% off the seasonal body ritual package.', time: 'Aug 16', unread: false },
]

export default function Notifications() {
  const [items, setItems] = useState(INITIAL)
  const toast = useToast()
  const unread = items.filter((n) => n.unread).length

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Notifications</h1>
          <p>{unread ? `${unread} unread notification${unread === 1 ? '' : 's'}` : "You're all caught up"}</p>
        </div>
        <Button variant="outline" disabled={!unread} onClick={() => { setItems((i) => i.map((n) => ({ ...n, unread: false }))); toast('All marked as read') }}>
          Mark all as read
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="card">
          <EmptyState icon="i-bell" title="No notifications" text="Promotion alerts, helpful-vote updates, and new deals will show up here." />
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {items.map((n) => (
            <div key={n.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <NotificationItem
                notif={n}
                onRead={(id) => {
                  setItems((i) => i.filter((x) => x.id !== id))
                  toast('Notification dismissed')
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}