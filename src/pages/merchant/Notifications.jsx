import { useState } from 'react'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import NotificationItem from '../../components/cards/NotificationItem'
import { PageLoading, PageError } from '../../components/ui/Loading'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'
import { useAuth } from '../../utils/useAuth'
import { useToast } from '../../components/ui/useToast'

export default function Notifications() {
  const toast = useToast()
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(() => new Set())
  const { data, loading, error, refetch } = useApi(() => api.me.notifications(), [], [])
  const items = (data || []).filter((n) => !dismissed.has(n.id))
  const unread = items.filter((n) => n.unread).length

  const markAll = async () => {
    try {
      await api.me.markAllNotificationsRead()
      toast('All marked as read')
      refetch()
    } catch {
      toast('Could not update notifications')
    }
  }

  const dismiss = async (id) => {
    setDismissed((prev) => new Set(prev).add(id))
    toast('Notification dismissed')
    try {
      await api.me.dismissNotification(id)
    } catch {
      setDismissed((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      toast('Could not dismiss notification')
    }
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Notifications</h1>
          <p>{unread ? `${unread} unread for ${user?.name || 'your business'}` : "You're all caught up"}</p>
        </div>
        <Button variant="outline" disabled={!unread} onClick={markAll}>
          Mark all as read
        </Button>
      </div>

      {loading ? (
        <div className="card card-pad"><PageLoading text="Loading notifications…" /></div>
      ) : error ? (
        <PageError text="Could not load notifications." />
      ) : items.length === 0 ? (
        <div className="card">
          <EmptyState icon="i-bell" title="Nothing here yet" text="New saves, reviews, and partner requests will land here." />
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {items.map((n) => (
            <div key={n.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <NotificationItem notif={n} onRead={dismiss} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}