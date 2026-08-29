import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import { Field, Input, Textarea, Select } from '../../components/ui/Fields'
import { gradientFor } from '../../utils/gradients'
import { useToast } from '../../components/ui/useToast'

export default function AddEditDeal() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const editMode = Boolean(id)

  const [form, setForm] = useState({
    title: editMode ? 'BOGO any signature brew after 3pm' : '',
    type: 'percent',
    value: editMode ? '50' : '',
    start: editMode ? '2026-08-12' : '2026-08-28',
    end: editMode ? '2026-09-06' : '',
  })
  const [desc, setDesc] = useState(editMode ? 'Beat the afternoon slump — after 3pm every day, get any signature brew and the second one free.' : '')
  const [terms, setTerms] = useState(editMode ? 'Valid after 3pm daily. One per transaction.' : '')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const typeLabel = {
    percent: `${form.value || 0}% off`,
    amount: `$${form.value || 0} off`,
    bogo: 'Buy 1, Get 1',
    bundle: 'Cross-vendor bundle',
  }[form.type]

  const tag = {
    percent: `${form.value || 0}% OFF`,
    amount: `$${form.value || 0} OFF`,
    bogo: 'BOGO',
    bundle: 'BUNDLE',
  }[form.type]

  const publish = (status) => {
    toast(status === 'published' ? 'Deal published!' : 'Saved as draft')
    navigate('/merchant/deals')
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
                <Field label={form.type === 'percent' ? 'Discount value (%)' : 'Discount value ($)'} required>
                  <Input type="number" min="1" value={form.value} onChange={set('value')} placeholder={form.type === 'percent' ? 'e.g. 20' : 'e.g. 5'} />
                </Field>
              )}
            </div>
            {form.type === 'bundle' && (
              <div className="hint-role">
                <strong>Bundle deal:</strong> you'll add the partner business in the next step (or via Cross-promotions).
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

        {/* Live preview */}
        <div className="col" style={{ gap: 14 }}>
          <div className="row-between">
            <h4 style={{ margin: 0 }}>Live preview</h4>
            <span className="badge badge-green">Card preview</span>
          </div>
          <div className="card card-hover deal-card deal-tile">
            <div className="deal-cover" style={{ background: gradientFor('Bean & Leaf'), height: 140 }}>
              {tag && <span className="deal-tag">{tag}</span>}
              <span className="deal-save"><Icon name="i-bookmark-o" /></span>
            </div>
            <div className="deal-body">
              <div className="merchant">
                <span>Bean & Leaf</span>
                <span style={{ opacity: 0.55 }}>·</span>
                <span>Cafés</span>
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
                <span className="badge badge-amber">{typeLabel}</span>
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
              <Button variant="outline" onClick={() => publish('draft')}><Icon name="i-file" size={15} /> Save draft</Button>
              <Button variant="primary" onClick={() => publish('published')}><Icon name="i-zap" size={15} /> Publish deal</Button>
              {editMode && (
                <Button variant="ghost" onClick={() => { toast('Changes copied to draft'); navigate('/merchant/deals') }}>Discard edits</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}