import { useState } from 'react'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import { Field, Input, Textarea, Select } from '../../components/ui/Fields'
import { gradientFor } from '../../utils/gradients'
import { useToast } from '../../components/ui/useToast'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const DEFAULT_HOURS = {
  Mon: '7:00 am – 6:00 pm',
  Tue: '7:00 am – 6:00 pm',
  Wed: '7:00 am – 6:00 pm',
  Thu: '7:00 am – 8:00 pm',
  Fri: '7:00 am – 8:00 pm',
  Sat: '8:00 am – 7:00 pm',
  Sun: '9:00 am – 4:00 pm',
}

export default function BusinessProfile() {
  const toast = useToast()
  const [info, setInfo] = useState({
    name: 'Bean & Leaf',
    tagline: 'Specialty coffee, roasted in-house.',
    category: 'Cafés',
    phone: '(555) 010-2211',
    email: 'hello@beanandleaf.co',
    address: '12 Maple Lane, Hive City',
  })
  const [about, setAbout] = useState(
    'A neighborhood espresso bar that roasts in-house twice a week. We serve single-origin brews, seasonal pastries from Sunflower Bakehouse, and pour the best cold drip on Maple Lane.'
  )
  const [hours, setHours] = useState(DEFAULT_HOURS)
  const [gallery, setGallery] = useState(['counter', 'seating', 'patio', 'evening', 'roastery', 'menu'])

  const setI = (k) => (e) => setInfo((s) => ({ ...s, [k]: e.target.value }))

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Business profile</h1>
          <p>Keep this fresh — it's the first thing new customers see.</p>
        </div>
        <Button variant="primary" onClick={() => toast('Profile saved')}>Save changes</Button>
      </div>

      <div className="card" style={{ overflow: 'hidden', marginBottom: 22 }}>
        <div style={{ height: 150, background: gradientFor('Bean & Leaf'), position: 'relative' }}>
          <span style={{ position: 'absolute', fontSize: 58, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>☕</span>
          <label className="btn btn-sm" style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(255,255,255,.92)', color: 'var(--text)' }}>
            <Icon name="i-camera" size={14} /> Change cover
            <input type="file" accept="image/*" hidden />
          </label>
        </div>
      </div>

      <div className="grid-2" style={{ display: 'grid', gap: 20, alignItems: 'start' }}>
        <div className="col" style={{ gap: 20 }}>
          <div className="card card-pad">
            <h4 style={{ marginBottom: 18 }}>Basic info</h4>
            <div className="form-grid">
              <Field label="Business name" required>
                <Input value={info.name} onChange={setI('name')} />
              </Field>
              <Field label="Category" required>
                <Select value={info.category} onChange={setI('category')}>
                  {['Cafés', 'Restaurants', 'Bakeries', 'Clothing', 'Electronics', 'Services', 'Health & Beauty', 'Gifts & Local'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Tagline" hint="Shown under your business name on cards.">
              <Input value={info.tagline} onChange={setI('tagline')} />
            </Field>
            <Field label="About / description" required>
              <Textarea value={about} onChange={(e) => setAbout(e.target.value)} />
            </Field>
          </div>

          <div className="card card-pad">
            <h4 style={{ marginBottom: 18 }}>Opening hours</h4>
            <div className="col" style={{ gap: 10 }}>
              {DAYS.map((d) => (
                <div key={d} className="row" style={{ gap: 12 }}>
                  <span className="badge badge-gray" style={{ width: 46, justifyContent: 'center' }}>{d}</span>
                  <Input
                    className="grow"
                    value={hours[d]}
                    onChange={(e) => setHours((h) => ({ ...h, [d]: e.target.value }))}
                    list={`hours-${d}`}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setHours((h) => ({ ...h, [d]: h[d] === 'Closed' ? DEFAULT_HOURS[d] : 'Closed' }))}
                  >
                    {hours[d] === 'Closed' ? 'Open it' : 'Close'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col" style={{ gap: 20 }}>
          <div className="card card-pad">
            <h4 style={{ marginBottom: 18 }}>Contact & location</h4>
            <Field label="Phone" required>
              <Input value={info.phone} onChange={setI('phone')} />
            </Field>
            <Field label="Public email" required>
              <Input value={info.email} onChange={setI('email')} />
            </Field>
            <Field label="Address" required hint="Used for proximity ranking — customers won't see your full address unless you choose to.">
              <Input value={info.address} onChange={setI('address')} />
            </Field>
            <Field label="Map pin">
              <div style={{ height: 150, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-2)', position: 'relative', overflow: 'hidden' }}>
                <div className="map-ph" style={{ border: 'none', minHeight: 150 }}>
                  <div className="map-bg" />
                  <span className="map-pin" style={{ left: '58%', top: '52%' }}>
                    <svg viewBox="0 0 24 24" style={{ overflow: 'visible' }}>
                      <path fill="var(--primary-600)" stroke="#fff" strokeWidth="1.4" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" fill="#fff" />
                    </svg>
                  </span>
                </div>
              </div>
            </Field>
          </div>

          <div className="card card-pad">
            <h4 style={{ marginBottom: 14 }}>Gallery</h4>
            <div className="gallery-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {gallery.map((g, i) => (
                <div key={g} style={{ position: 'relative' }}>
                  <div className="tile" style={{ background: gradientFor(`Bean & Leaf ${g}`), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                    {['☕', '🌿', '🛋️', '🌇', '✨', '🍰'][i]}
                  </div>
                  <button
                    type="button"
                    className="btn btn-icon"
                    style={{ position: 'absolute', top: 6, right: 6, width: 28, height: 28, padding: 0, borderRadius: 8, background: 'rgba(32,45,38,.7)', color: '#fff' }}
                    onClick={() => setGallery((gList) => gList.filter((x) => x !== g))}
                    aria-label="Remove image"
                  >
                    <Icon name="i-x" size={13} />
                  </button>
                </div>
              ))}
              <label className="tile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', border: '2px dashed var(--border-strong)', borderRadius: 9, color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, flexDirection: 'column' }}>
                <Icon name="i-upload" size={20} />
                Add photo
                <input type="file" accept="image/*" hidden />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="row" style={{ justifyContent: 'flex-end', marginTop: 20, gap: 10 }}>
        <Button variant="ghost" onClick={() => toast('Changes discarded')}>Discard</Button>
        <Button variant="primary" onClick={() => toast('Profile saved')}>Save changes</Button>
      </div>
    </div>
  )
}