import { useState } from 'react'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import NotificationItem from '../../components/cards/NotificationItem'
import EmptyState from '../../components/ui/EmptyState'
import { useToast } from '../../components/ui/useToast'

const FEED = [
  { id: 'n1', type: 'review', icon: 'i-star', text: '<b>Aisha K.</b> left a 5-star review. Reply to say thanks.', time: '2 h ago', unread: true },
  { id: 'n2', type: 'deal', icon: 'i-bookmark', text: 'Your bundle <b>d7</b> just hit <b>1,700 saves</b> — recent follower spike from Explore.', time: '5 h ago', unread: true },
  { id: 'n3', type: 'promotion', icon: 'i-megaphone', text: '<b>Sunflower Bakehouse</b> accepted your cross-promotion request. It goes live Aug 28.', time: 'Yesterday', unread: true },
  { id: 'n4', type: 'deal', icon: 'i-clock', text: 'Your deal <b>d1</b> expires in <b>3 days</b>. Consider extending it for the fall menu.', time: 'Yesterday', unread: false },
  { id: 'n5', type: 'system', icon: 'i-eye', text: 'Profile views are up <b>+18%</b> this month. Nice work!', time: '3 days ago', unread: false },
  { id: 'n6', type: 'system', icon: 'i-wallet', text: 'Next payout of <b>$412.65</b> arrives on the 5th.', time: '5 days ago', unread: false },
]

export default function Notifications() {
  const [items, setItems] = useState(FEED)
  const toast = useToast()
  const unread = items.filter((n) => n.unread).length

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Notifications</h1>
          <p>{unread ? `${unread} unread for ${'Bean & Leaf'}` : "You're all caught up"}</p>
        </div>
        {unread > 0 && (
          <Button
            variant="ghost"
            onClick={() => {
              setItems((ns) => ns.map((n) => ({ ...n, unread: false })))
              toast('All marked as read')
            }}
          >
            <Icon name="i-check" size={14} /> Mark all read
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card">
          <EmptyState icon="i-bell" title="Nothing here yet" text="New saves, reviews, and partner requests will land here." />
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