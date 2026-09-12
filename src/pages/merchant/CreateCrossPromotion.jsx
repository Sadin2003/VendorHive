import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import Stepper from '../../components/ui/Stepper'
import { Field, Input, Textarea } from '../../components/ui/Fields'
import { gradientFor } from '../../utils/gradients'
import { PageLoading, PageError } from '../../components/ui/Loading'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'
import { useAuth } from '../../utils/useAuth'
import { useToast } from '../../components/ui/useToast'

const STEPS = ['Your business', 'Partner', 'Offer', 'Dates & terms', 'Preview']

function toYmd(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export default function CreateCrossPromotion() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const { data: partners, loading, error } = useApi(() => api.merchant.partners(), [], [])
  const today = toYmd(new Date().toISOString())

  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    partner: null,
    offer: '',
    start: today,
    end: '',
    terms: '',
  })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const submit = async () => {
    if (!form.partner || !form.offer.trim() || !form.start || !form.end) {
      toast('Partner, offer, start, and end are required')
      return
    }
    if (form.end <= form.start) {
      toast('End date must be after start date')
      return
    }
    setBusy(true)
    try {
      await api.merchant.createPromotion({
        partnerId: form.partner.id,
        offer: form.offer.trim(),
        terms: form.terms.split('\n').map((t) => t.trim()).filter(Boolean),
        start: form.start,
        end: form.end,
      })
      toast('Promotion request sent — your partner has been notified')
      navigate('/merchant/promotions')
    } catch (err) {
      toast(err.message || 'Could not send promotion request')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="card card-pad"><PageLoading text="Finding partners…" /></div>
  if (error) return <PageError text="Could not load partner businesses." />

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Create cross-promotion</h1>
          <p>Team up with a neighbor to grow the whole street.</p>
        </div>
      </div>

      <Stepper steps={STEPS} current={step} />

      <div className="card card-pad" style={{ maxWidth: 820 }}>
        {step === 0 && (
          <div className="col" style={{ gap: 14 }}>
            <h4>Which business is offering this promotion?</h4>
            <div className="role-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span className="logo-badge" style={{ background: gradientFor(user?.name || 'Me'), width: 38, height: 38, borderRadius: 11 }}>
                {(user?.name || 'Me').slice(0, 2)}
              </span>
              <span className="bold">{user?.name || 'Your business'}</span>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="col" style={{ gap: 12 }}>
            <h4>Choose your partner business</h4>
            <p className="small muted" style={{ marginTop: -8 }}>
              Live merchants only — tap a shop to select it. You'll see their public rating.
            </p>
            {(partners || []).length === 0 ? (
              <p className="small muted">No other live merchants found yet.</p>
            ) : (
              (partners || []).map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className="role-card row"
                  style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}
                  onClick={() => setForm((f) => ({ ...f, partner: n }))}
                >
                  <span className="logo-badge" style={{ background: gradientFor(n.name), width: 38, height: 38, borderRadius: 11 }}>{n.name.slice(0, 2)}</span>
                  <span className="grow" style={{ textAlign: 'left' }}>
                    <strong style={{ display: 'block' }}>{form.partner?.id === n.id ? `✓ ${n.name}` : n.name}</strong>
                    <span>{n.category} · {n.addr} · {Number(n.rating || 0).toFixed(1)}★</span>
                  </span>
                  <span className="radio">
                    <input type="radio" readOnly checked={form.partner?.id === n.id} style={{ accentColor: 'var(--primary)', width: 17, height: 17 }} />
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        {step === 2 && (
          <div className="col" style={{ gap: 14 }}>
            <h4>Shape the offer</h4>
            {form.partner && (
              <span className="badge badge-green" style={{ width: 'fit-content' }}>
                Partner: {form.partner.name}
              </span>
            )}
            <Field label="What does the customer get?" required hint="Example: “Buy a cappuccino at Bean & Leaf, get 15% off any haircut at The Copper Studio.”">
              <Textarea placeholder="Describe the combined offer across both businesses…" value={form.offer} onChange={set('offer')} />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="col" style={{ gap: 14 }}>
            <h4>Set the window & terms</h4>
            <div className="form-grid">
              <Field label="Starts" required>
                <Input type="date" value={form.start} onChange={set('start')} />
              </Field>
              <Field label="Ends" required>
                <Input type="date" value={form.end} onChange={set('end')} />
              </Field>
            </div>
            <Field label="Terms" hint="Line per term — rendered as bullets on the deal page.">
              <Textarea rows={4} value={form.terms} onChange={set('terms')} placeholder={'Voucher must be used within 72 hours.\nSingle redemption per customer.'} />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="col" style={{ gap: 16 }}>
            <h4>Preview your cross-promotion</h4>
            <div className="card card-hover deal-card deal-tile">
              <div className="deal-cover" style={{ background: gradientFor(`${user?.name || 'Me'} + ${form.partner?.name || 'Partner'}`), height: 120 }}>
                <span className="deal-tag">BUNDLE</span>
                <span className="deal-save saved"><Icon name="i-bookmark" /></span>
              </div>
              <div className="deal-body">
                <div className="merchant">
                  <span>{user?.name || 'Your business'}</span>
                  <span style={{ opacity: 0.55 }}>×</span>
                  <span>{form.partner?.name || '…'}</span>
                </div>
                <h4>{form.offer || 'Your offer text goes here'}</h4>
                <div className="meta">
                  <span><Icon name="i-clock" /> {form.start} → {form.end || '—'}</span>
                </div>
                <div className="foot">
                  <span className="badge badge-amber">Bundle</span>
                  <span className="btn btn-sm btn-outline">View deal</span>
                </div>
              </div>
            </div>
            <div className="hint-role" style={{ marginTop: 0 }}>
              Your partner will be asked to accept. Once they do, the bundle appears in the deals feed with both shops listed.
            </div>
          </div>
        )}

        <hr className="divider" />
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <Button variant="ghost" onClick={back} disabled={step === 0}>
            <Icon name="i-chevron-left" size={15} /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>
              Next step <Icon name="i-chevron-right" size={15} />
            </Button>
          ) : (
            <Button variant="primary" disabled={busy} onClick={submit}>
              <Icon name="i-check" size={15} /> {busy ? 'Sending…' : 'Send request'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}