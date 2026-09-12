import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import Tabs from '../../components/ui/Tabs'
import PromotionCard from '../../components/cards/PromotionCard'
import EmptyState from '../../components/ui/EmptyState'
import { PageLoading, PageError } from '../../components/ui/Loading'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'
import { useToast } from '../../components/ui/useToast'

export default function CrossPromotions() {
  const toast = useToast()
  const { data, loading, error, refetch } = useApi(() => api.merchant.promotions(), [], [])
  const [tab, setTab] = useState('pending')
  const [busyId, setBusyId] = useState(null)
  const groups = useMemo(() => {
    const ds = data || []
    const pending = ds.filter((p) => p.rawStatus === 'awaiting')
    const active = ds.filter((p) => p.status === 'active' || p.status === 'scheduled')
    const history = ds.filter((p) => p.status === 'expired' || p.status === 'declined' || p.status === 'accepted')
    return { pending, active, history }
  }, [data])

  const list = groups[tab] || []

  const summaryViews = groups.active.reduce((s, p) => s + (p.views || 0), 0)
  const tabsCount = { pending: groups.pending.length, active: groups.active.length, history: groups.history.length }

  const act = async (fn, id, message) => {
    setBusyId(id)
    try {
      await fn(id)
      toast(message)
      refetch()
    } catch (err) {
      toast(err.message || 'Action failed')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <div className="card card-pad"><PageLoading text="Loading promotions…" /></div>
  if (error) return <PageError text="Could not load promotions." />

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Cross-promotions</h1>
          <p>Co-op campaigns with your neighbors · {summaryViews.toLocaleString()} combined views</p>
        </div>
        <Button to="/merchant/promotions/new"><Icon name="i-plus" size={15} /> Create promotion</Button>
      </div>

      <Tabs
        items={[
          { id: 'pending', label: 'Pending', count: tabsCount.pending },
          { id: 'active', label: 'Active & scheduled', count: tabsCount.active },
          { id: 'history', label: 'History', count: tabsCount.history },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tabsCount.pending > 0 && tab === 'pending' && (
        <div className="hint-role" style={{ marginBottom: 18 }}>
          <strong>Awaiting action:</strong> accept requests you receive, or cancel the ones you sent.
        </div>
      )}

      {list.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="i-megaphone"
            title={tab === 'pending' ? 'No pending invites' : tab === 'active' ? 'No live promotions' : 'No past promotions'}
            text="Team up with a complementary shop nearby and split the cost of winning new regulars."
            action={{ to: '/merchant/promotions/new', variant: 'primary', children: 'Start a promotion' }}
          />
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: 18 }}>
          {list.map((p) => (
            <PromotionCard key={p.id} promo={p}>
              {p.rawStatus === 'awaiting' && (
                <div className="row" style={{ gap: 8, marginTop: 16 }}>
                  {!p.mine ? (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={busyId === p.id}
                        onClick={() => act(api.merchant.acceptPromotion, p.id, 'Promotion accepted')}
                      >
                        <Icon name="i-check" size={14} /> Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === p.id}
                        onClick={() => act(api.merchant.declinePromotion, p.id, 'Promotion declined')}
                      >
                        Decline
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busyId === p.id}
                      onClick={() => act(api.merchant.deletePromotion, p.id, 'Request cancelled')}
                    >
                      <Icon name="i-x" size={14} /> Cancel request
                    </Button>
                  )}
                </div>
              )}
            </PromotionCard>
          ))}
        </div>
      )}

      <div className="card card-pad" style={{ marginTop: 30, background: 'var(--surface-2)' }}>
        <h4 style={{ marginBottom: 8 }}>
          <Icon name="i-info" size={16} style={{ verticalAlign: -3, marginRight: 6, color: 'var(--primary)' }} />
          How cross-promotions work
        </h4>
        <p className="small muted" style={{ margin: 0, maxWidth: 860 }}>
          You choose a partner business, agree on an offer that benefits both sides, and VendorHive bundles
          it into a single voucher. Customers save across both shops; you both share the reach. Unclaimed,
          your deal costs nothing.
        </p>
      </div>
    </div>
  )
}