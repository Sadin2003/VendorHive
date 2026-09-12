import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import StarRating from '../../components/ui/StarRating'
import EmptyState from '../../components/ui/EmptyState'
import { PageLoading, PageError } from '../../components/ui/Loading'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'
import { useToast } from '../../components/ui/useToast'

export default function Following() {
  const toast = useToast()
  const [removed, setRemoved] = useState(() => new Set())
  const { data, loading, error } = useApi(() => api.me.following(), [], [])
  const list = (data || []).filter((b) => !removed.has(b.id))

  const unfollow = async (id) => {
    setRemoved((prev) => new Set(prev).add(id))
    toast('Unfollowed — you will no longer get alerts')
    try {
      await api.me.unfollow(id)
    } catch {
      setRemoved((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      toast('Could not unfollow')
    }
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Following</h1>
          <p>{list.length} businesses you alert on</p>
        </div>
        <Button to="/explore" variant="outline"><Icon name="i-plus" size={15} /> Follow more</Button>
      </div>

      {loading ? (
        <div className="card card-pad"><PageLoading text="Loading businesses…" /></div>
      ) : error ? (
        <PageError text="Could not load your followed businesses." />
      ) : list.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="i-heart"
            title="You're not following anyone yet"
            text="Follow the shops you visit so their newest promotions land straight in your feed."
            action={{ to: '/explore', variant: 'primary', children: 'Discover businesses' }}
          />
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {list.map((b) => (
            <div key={b.id} className="card card-hover card-pad">
              <div className="row" style={{ marginBottom: 12 }}>
                <Avatar text={b.name} size="md" />
                <div className="grow">
                  <Link to={`/vendors/${b.id}`} className="bold" style={{ fontSize: '0.98rem' }}>{b.name}</Link>
                  <div className="small muted">{b.category}{b.address ? ` · ${b.address}` : ''}</div>
                </div>
              </div>
              <div className="row-between" style={{ marginBottom: 14 }}>
                <span className="rating-line">
                  <StarRating value={b.rating} size={13} />
                  <span className="avg">{Number(b.rating).toFixed(1)}</span>
                  <span className="count">({b.reviews})</span>
                </span>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <Button to={`/vendors/${b.id}`} variant="outline" size="sm" className="grow">View profile</Button>
                <Button variant="ghost" size="sm" onClick={() => unfollow(b.id)}>
                  <Icon name="i-x" size={14} /> Unfollow
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}