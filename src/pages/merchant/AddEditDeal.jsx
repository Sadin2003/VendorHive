import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import { Field, Input, Textarea, Select } from '../../components/ui/Fields'
import { gradientFor } from '../../utils/gradients'
import { PageLoading, PageError } from '../../components/ui/Loading'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'
import { useAuth } from '../../utils/useAuth'
import { useToast } from '../../components/ui/useToast'

const TYPE_PLACEHOLDERS = {
  percent: 'e.g. 20% OFF',
  amount: 'e.g. $5 OFF',
  bogo: 'BOGO',
  bundle: 'e.g. $8 duo',
}

const DEFAULT_VALUE = {
  percent: '20% OFF',
  amount: '$5 OFF',
  bogo: 'BOGO',
  bundle: 'BUNDLE',
}

function toYmd(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

function DealForm({ id, editMode, initial }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const today = toYmd(new Date().toISOString())

  const [form, setForm] = useState({
    title: initial?.title || '',
    type: initial?.type || 'percent',
    value: initial?.value || '',
    start: initial?.start ? toYmd(initial.start) : today,
    end: initial?.end ? toYmd(initial.end) : '',
  })
  const [desc, setDesc] = useState(initial?.desc || '')
  const [terms, setTerms] = useState(Array.isArray(initial?.terms) ? initial.terms.join('\n') : '')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const tag = form.value || DEFAULT_VALUE[form.type] || 'DEAL'

  const submit = async (published) => {
    if (!form.title.trim() || !form.start || !form.end) {
      toast('Title, start, and end date are required')
      return
    }
    if (form.end <= form.start) {
      toast('End date must be after start date')
      return
    }
    setBusy(true)
    const payload = {
      title: form.title.trim(),
      type: form.type,
      value: form.type === 'bogo' ? 'BOGO' : (form.value.trim() || DEFAULT_VALUE[form.type]),
      desc: desc.trim(),
      terms: terms.split('\n').map((t) => t.trim()).filter(Boolean),
      start: form.start,
      end: form.end,
      published,
    }
    try {
      if (editMode) {
        await api.merchant.updateDeal(id, payload)
      } else {
        await api.merchant.createDeal(payload)
      }
      toast(published ? 'Deal published!' : 'Saved as draft')
      navigate('/merchant/deals')
    } catch (err) {
      toast(err.message || 'Could not save deal')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <nav className="breadcrumbs" style={{ marginBottom: 8 }}>
            <Link to="/merchant/deals">Deals</Link>
            <Icon name="i-chevron-right" size={13} />
            <span>{editMode ? 'Edit deal' : 'New deal'}</span>
          </nav>
          <h1 style={{ fontSize: '1.6rem' }}>{editMode ? 'Edit deal' : 'Create a deal'}</h1>
        </div>
      </div>

      <div className="grid form-preview" style={{ gap: 24, alignItems: 'start' }}>
        <div className="col" style={{ gap: 20 }}>
          <div className="card card-pad">
            <h4 style={{ marginBottom: 18 }}>Offer details</h4>
            <Field label="Deal title" required hint="Keep it specific — customers scan fast.">
              <Input placeholder="e.g. 20% off your birthday week latte flight" value={form.title} onChange={set('title')} />
            </Field>
            <Field label="Description" required>
              <Textarea placeholder="What's included, when it's valid, why it's worth crossing the street for…" value={desc} onChange={(e) => setDesc(e.target.value)} />
            </Field>
            <div className="form-grid">
              <Field label="Discount type" required>
                <Select value={form.type} onChange={set('type')}>
                  <option value="percent">% off</option>
                  <option value="amount">$ off</option>
                  <option value="bogo">Buy one get one</option>
                  <option value="bundle">Cross-vendor bundle</option>
                </Select>
              </Field>
              {form.type !== 'bogo' && (
                <Field label="Badge text" hint="The short label shown on the deal card.">
                  <Input value={form.value} onChange={set('value')} placeholder={TYPE_PLACEHOLDERS[form.type]} />
                </Field>
              )}
            </div>
            {form.type === 'bundle' && (
              <div className="hint-role">
                <strong>Bundle deal:</strong> you'll add the partner business via Cross-promotions.
              </div>
            )}
          </div>

          <div className="card card-pad">
            <h4 style={{ marginBottom: 18 }}>Dates & terms</h4>
            <div className="form-grid">
              <Field label="Starts" required>
                <Input type="date" value={form.start} onChange={set('start')} />
              </Field>
              <Field label="Ends" required>
                <Input type="date" value={form.end} onChange={set('end')} />
              </Field>
            </div>
            <Field label="Terms & conditions" hint="One line per term — we'll render them as bullets.">
              <Textarea rows={5} placeholder={"Valid after 3pm daily.\nOne redemption per transaction.\nNot valid on delivery."} value={terms} onChange={(e) => setTerms(e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="col" style={{ gap: 14 }}>
          <div className="row-between">
            <h4 style={{ margin: 0 }}>Live preview</h4>
            <span className="badge badge-green">Card preview</span>
          </div>
          <div className="card card-hover deal-card deal-tile">
            <div className="deal-cover" style={{ background: gradientFor(user?.name || 'Store'), height: 140 }}>
              {tag && <span className="deal-tag">{tag}</span>}
              <span className="deal-save"><Icon name="i-bookmark-o" /></span>
            </div>
            <div className="deal-body">
              <div className="merchant">
                <span>{user?.name || 'Your business'}</span>
                <span style={{ opacity: 0.55 }}>·</span>
                <span>{user?.category || 'Category'}</span>
              </div>
              <h4>{form.title || 'Your deal title will appear here'}</h4>
              <p className="small muted" style={{ margin: 0 }}>
                {desc || 'Your description will appear here…'}
              </p>
              <div className="meta" style={{ marginTop: 10 }}>
                <span><Icon name="i-eye" /> —</span>
                <span><Icon name="i-bookmark-o" /> —</span>
                <span><Icon name="i-clock" /> {form.end ? `Ends ${form.end}` : 'Set an end date'}</span>
              </div>
              <div className="foot">
                <span className="badge badge-amber">{tag}</span>
                <span className="btn btn-sm btn-outline">View deal</span>
              </div>
            </div>
          </div>

          <div className="card card-pad">
            <h4 style={{ marginBottom: 12 }}>Publishing</h4>
            <p className="small muted" style={{ marginBottom: 14 }}>
              Drafts are only visible to you. Published deals go live for the whole neighborhood.
            </p>
            <div className="col" style={{ gap: 8 }}>
              <Button variant="outline" disabled={busy} onClick={() => submit(false)}><Icon name="i-file" size={15} /> Save draft</Button>
              <Button variant="primary" disabled={busy} onClick={() => submit(true)}><Icon name="i-zap" size={15} /> {editMode ? 'Save & publish' : 'Publish deal'}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AddEditDeal() {
  const { id } = useParams()
  const editMode = Boolean(id)
  const { data, loading, error } = useApi(() => (editMode ? api.merchant.deal(id) : Promise.resolve(null)), [id, editMode])

  if (editMode && loading) return <div className="card card-pad"><PageLoading text="Loading deal…" /></div>
  if (editMode && error) return <PageError text="Could not load deal." />
  if (editMode && !data) return null

  return <DealForm key={id || 'new'} id={id} editMode={editMode} initial={data} />
}