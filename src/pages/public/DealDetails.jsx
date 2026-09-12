import { Link, useParams } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import DealCard from '../../components/cards/DealCard'
import { PageLoading, PageError } from '../../components/ui/Loading'
import { gradientFor } from '../../utils/gradients'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'
import { useSavedDeals } from '../../utils/useSavedDeals'
import { useToast } from '../../components/ui/useToast'

function fmt(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  }
}

export default function DealDetails() {
  const { id } = useParams()
  const toast = useToast()
  const { toggle, contains } = useSavedDeals()

  const { data: d, loading, error } = useApi(
    () => (id ? api.public.deal(id) : Promise.reject(new Error('No deal id'))),
    [id]
  )
  const { data: related } = useApi(() => (id ? api.public.relatedDeals(id) : Promise.resolve([])), [id])

  if (loading) return <div className="container page"><PageLoading text="Loading deal…" /></div>
  if (error || !d) return <div className="container page"><PageError title="Deal not found" text="This deal may have expired or been removed." /></div>

  const isSaved = contains(d.id)
  const host = d.businesses?.[0]

  return (
    <div className="container page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <Icon name="i-chevron-right" size={14} />
        <Link to="/deals">Deals</Link>
        <Icon name="i-chevron-right" size={14} />
        <span style={{ color: 'var(--text)' }}>{d.title}</span>
      </nav>

      <div className="grid deal-layout" style={{ gap: 24, alignItems: 'start' }}>
        <div>
          <div className="card card-hover deal-card" style={{ overflow: 'visible' }}>
            <div className="deal-cover" style={{ background: gradientFor(d.coverKey || d.merchant || d.id), borderRadius: 'var(--radius) var(--radius) 0 0', height: 220 }}>
              {d.tag && <span className="deal-tag" style={{ fontSize: '0.95rem', padding: '7px 16px' }}>{d.tag}</span>}
            </div>
            <div className="deal-body" style={{ padding: 26 }}>
              <div className="merchant">
                <span>{d.merchant}</span>
                <span style={{ opacity: 0.55 }}>·</span>
                <span>{d.category}</span>
              </div>
              <h1 style={{ fontSize: '1.8rem', margin: '8px 0 12px' }}>{d.title}</h1>
              <div className="row" style={{ gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                {d.discount && <span className="badge badge-amber" style={{ fontSize: '0.95rem', padding: '6px 16px' }}>{d.discount}</span>}
                <span className="badge badge-green">Verified merchant</span>
              </div>
              {d.desc && <p>{d.desc}</p>}
              <div className="row" style={{ gap: 22, flexWrap: 'wrap', marginTop: 8 }}>
                {d.starts && d.ends && (
                  <span className="muted small"><Icon name="i-calendar" size={15} style={{ verticalAlign: -2, marginRight: 6 }} />{fmt(d.starts)} → {fmt(d.ends)}</span>
                )}
                {Number(d.views) > 0 && (
                  <span className="muted small"><Icon name="i-eye" size={15} style={{ verticalAlign: -2, marginRight: 6 }} />{Number(d.views).toLocaleString()} views</span>
                )}
                {Number(d.saves) > 0 && (
                  <span className="muted small"><Icon name="i-bookmark-o" size={15} style={{ verticalAlign: -2, marginRight: 6 }} />{Number(d.saves).toLocaleString()} saves</span>
                )}
              </div>
              <hr className="divider" />
              <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                <Button variant={isSaved ? 'primary' : 'outline'} onClick={() => toggle(d, !isSaved)}>
                  <Icon name={isSaved ? 'i-bookmark' : 'i-bookmark-o'} />
                  {isSaved ? 'Saved' : 'Save deal'}
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    const ok = await copyText(window.location.href)
                    toast(ok ? 'Link copied to clipboard' : 'Could not copy the link')
                  }}
                >
                  <Icon name="i-share" /> Share
                </Button>
                <Button variant="amber" onClick={() => toast('Show this screen at checkout')}>
                  <Icon name="i-zap" /> Redeem in store
                </Button>
              </div>
            </div>
          </div>

          {/* Participating businesses */}
          {d.businesses && d.businesses.length > 0 && (
            <div className="card card-pad" style={{ marginTop: 24 }}>
              <h4 style={{ marginBottom: 16 }}>
                Participating businesses
                {d.businesses.length > 1 && <Badge tone="cyan" style={{ marginLeft: 10 }}>Cross-promotion</Badge>}
              </h4>
              <div className="col" style={{ gap: 14 }}>
                {d.businesses.map((b) => (
                  <div key={b.id} className="row" style={{ padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
                    <Avatar text={b.name} size="md" />
                    <div className="grow">
                      <div className="bold">{b.name}</div>
                      <div className="small muted">{[b.addr, b.category, Number(b.rating) > 0 ? `${Number(b.rating).toFixed(1)}★ (${b.reviews})` : null].filter(Boolean).join(' · ')}</div>
                    </div>
                    <div className="col" style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Badge tone={b.role === 'Host' ? 'green' : 'amber'}>{b.role}</Badge>
                      <Link to={`/vendors/${b.id}`} className="btn-link tiny">View profile</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Side column */}
        <div className="col" style={{ gap: 20 }}>
          {d.terms && d.terms.length > 0 && (
            <div className="card card-pad">
              <h4 style={{ marginBottom: 12 }}>Terms & conditions</h4>
              <ul style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {d.terms.map((t, i) => (
                  <li key={i} className="small" style={{ color: 'var(--text-2)' }}>{t}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="card card-pad">
            <h4 style={{ marginBottom: 12 }}>How to redeem</h4>
            <div className="kv">
              <dt>1</dt><dd>Save the deal to your account</dd>
              <dt>2</dt><dd>Visit the hosting business</dd>
              <dt>3</dt><dd>Show this page at checkout</dd>
            </div>
          </div>
          {host && (
            <div className="card card-pad" style={{ background: 'var(--primary-800)', border: 'none' }}>
              <div className="row" style={{ gap: 14 }}>
                <Icon name="i-bell" size={26} style={{ color: 'var(--amber)' }} />
                <div>
                  <div className="bold" style={{ color: '#fff' }}>Never miss a deal</div>
                  <p className="small" style={{ color: '#bed0c4', margin: '4px 0 10px' }}>Follow {host.name || 'this business'} and get alerted when new promotions launch.</p>
                  <Button to={`/vendors/${host.id}`} variant="amber" size="sm">Follow business</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Related deals</h2>
            <p>More neighborhood savings</p>
          </div>
          <Link to="/deals" className="section-link">See all →</Link>
        </div>
        {(related || []).length === 0 ? (
          <p className="muted small" style={{ padding: '12px 0' }}>No related deals at the moment.</p>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {(related || []).map((r) => (
              <DealCard key={r.id} deal={r} saved={contains(r.id)} onSave={toggle} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}