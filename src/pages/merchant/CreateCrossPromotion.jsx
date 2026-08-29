import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import Stepper from '../../components/ui/Stepper'
import { Field, Input, Textarea } from '../../components/ui/Fields'
import { gradientFor } from '../../utils/gradients'
import { useToast } from '../../components/ui/useToast'

const STEPS = ['Your business', 'Partner', 'Offer', 'Dates & terms', 'Preview']

const NEIGHBORS = [
  { id: 'm3', name: 'Sunflower Bakehouse', category: 'Bakeries', addr: '3 Meadow Road', rating: 4.9 },
  { id: 'm2', name: 'Ember & Oak Grill', category: 'Restaurants', addr: '88 Coal Street', rating: 4.6 },
  { id: 'm9', name: 'Page & Plume Books', category: 'Gifts & Local', addr: '7 Quill Court', rating: 4.8 },
  { id: 'm5', name: 'The Copper Studio', category: 'Services', addr: '27 Foundry Ave', rating: 4.7 },
  { id: 'm4', name: 'Petal & Stem Florist', category: 'Gifts & Local', addr: '45 Garden Walk', rating: 4.7 },
]

export default function CreateCrossPromotion() {
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    mine: 'Bean & Leaf',
    partner: null,
    offer: '',
    value: '',
    start: '2026-08-28',
    end: '',
    terms: '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

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
            {['Bean & Leaf', 'Sunflower Bakehouse', 'Page & Plume Books'].map((name) => (
              <label key={name} className="role-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <input type="radio" name="mine" checked={form.mine === name} onChange={() => setForm((f) => ({ ...f, mine: name }))} style={{ accentColor: 'var(--primary)', width: 17, height: 17 }} />
                <span className="logo-badge" style={{ background: gradientFor(name), width: 38, height: 38, borderRadius: 11 }}>{name.slice(0, 2)}</span>
                <span className="bold">{name}</span>
              </label>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="col" style={{ gap: 12 }}>
            <h4>Choose your partner business</h4>
            <p className="small muted" style={{ marginTop: -8 }}>
              Browsing this list only — tap a shop to select it. You'll see their public rating and distance.
            </p>
            {NEIGHBORS.map((n) => (
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
                  <span>{n.category} · {n.addr} · {n.rating.toFixed(1)}★</span>
                </span>
                <span className={`radio`}>
                  <input type="radio" readOnly checked={form.partner?.id === n.id} style={{ accentColor: 'var(--primary)', width: 17, height: 17 }} />
                </span>
              </button>
            ))}
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
            <Field label="Discount note" hint="Shown as the flashy badge on the card.">
              <Input placeholder="e.g. $9 duo / 15% off / BOGO" value={form.value} onChange={set('value')} />
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
              <div className="deal-cover" style={{ background: gradientFor(`${form.mine} × ${form.partner?.name || 'Partner'}`), height: 120 }}>
                <span className="deal-tag">BUNDLE</span>
                <span className="deal-save saved"><Icon name="i-bookmark" /></span>
              </div>
              <div className="deal-body">
                <div className="merchant">
                  <span>{form.mine}</span>
                  <span style={{ opacity: 0.55 }}>×</span>
                  <span>{form.partner?.name || '…'}</span>
                </div>
                <h4>{form.offer || 'Your offer text goes here'}</h4>
                <div className="meta">
                  <span><Icon name="i-clock" /> {form.start} → {form.end || '—'}</span>
                </div>
                <div className="foot">
                  <span className="badge badge-amber">{form.value || 'Bundle'}</span>
                  <span className="btn btn-sm btn-outline">View deal</span>
                </div>
              </div>
            </div>
            <div className="hint-role" style={{ marginTop: 0 }}>
              Once published, both businesses get notified and the bundle appears in the deals feed with both shops listed.
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
            <Button
              variant="primary"
              onClick={() => {
                toast('Cross-promotion published — partners notified!')
                navigate('/merchant/promotions')
              }}
            >
              <Icon name="i-check" size={15} /> Publish promotion
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}