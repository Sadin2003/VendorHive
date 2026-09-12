import { useState } from 'react'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import { Field, Input, Textarea, Select } from '../../components/ui/Fields'
import { gradientFor } from '../../utils/gradients'
import { PageLoading, PageError } from '../../components/ui/Loading'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'
import { useToast } from '../../components/ui/useToast'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const CATEGORIES = ['Cafés', 'Restaurants', 'Bakeries', 'Clothing', 'Electronics', 'Services', 'Health & Beauty', 'Gifts & Local']

function ProfileBody({ data, onSaved }) {
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [info, setInfo] = useState({
    businessName: data.businessName || '',
    tagline: data.tagline || '',
    category: data.category || '',
    phone: data.phone || '',
    email: data.email || '',
    address: data.address || '',
    about: data.about || '',
    emoji: data.emoji || '🏪',
  })
  const [hours, setHours] = useState(() => {
    const base = {}
    for (const d of DAYS) base[d] = (data.hours && data.hours[d]) || ''
    return base
  })

  const setI = (k) => (e) => setInfo((s) => ({ ...s, [k]: e.target.value }))

  const save = async () => {
    setSaving(true)
    try {
      await api.merchant.updateProfile({ ...info, hours })
      toast('Profile saved')
      onSaved()
    } catch (err) {
      toast(err.message || 'Could not save profile')
    } finally {
      setSaving(false)
    }
  }

  const uploadCover = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('cover', file)
    try {
      const res = await api.merchant.uploadCover(fd)
      toast('Cover updated')
      if (res && res.cover) onSaved()
    } catch (err) {
      toast(err.message || 'Could not upload cover')
    }
  }

  const uploadGallery = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 8)
    if (!files.length) return
    const fd = new FormData()
    for (const f of files) fd.append('gallery', f)
    try {
      await api.merchant.uploadGallery(fd)
      toast('Photos added')
      onSaved()
    } catch (err) {
      toast(err.message || 'Could not upload photos')
    }
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Business profile</h1>
          <p>Keep this fresh — it's the first thing new customers see.</p>
        </div>
        <Button variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
      </div>

      <div className="card" style={{ overflow: 'hidden', marginBottom: 22 }}>
        <div style={{ height: 150, background: gradientFor(info.businessName || 'Storefront'), position: 'relative' }}>
          {data.cover ? (
            <img src={data.cover} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <span style={{ position: 'absolute', fontSize: 58, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>{info.emoji}</span>
          )}
          <label className="btn btn-sm" style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(255,255,255,.92)', color: 'var(--text)' }}>
            <Icon name="i-camera" size={14} /> Change cover
            <input type="file" accept="image/*" hidden onChange={uploadCover} />
          </label>
        </div>
      </div>

      <div className="grid-2" style={{ display: 'grid', gap: 20, alignItems: 'start' }}>
        <div className="col" style={{ gap: 20 }}>
          <div className="card card-pad">
            <h4 style={{ marginBottom: 18 }}>Basic info</h4>
            <div className="form-grid">
              <Field label="Business name" required>
                <Input value={info.businessName} onChange={setI('businessName')} />
              </Field>
              <Field label="Category" required>
                <Select value={info.category} onChange={setI('category')}>
                  {!info.category && <option value="">Select…</option>}
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Tagline" hint="Shown under your business name on cards.">
              <Input value={info.tagline} onChange={setI('tagline')} />
            </Field>
            <Field label="About / description" required>
              <Textarea value={info.about} onChange={setI('about')} />
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
                    placeholder={hours[d] === '' ? 'Closed' : ''}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setHours((h) => ({ ...h, [d]: h[d] ? '' : 'Open 24 hours' }))}
                  >
                    {hours[d] ? 'Close' : 'Set'}
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
          </div>

          <div className="card card-pad">
            <h4 style={{ marginBottom: 14 }}>Gallery</h4>
            <div className="gallery-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {(data.gallery || []).map((url, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={url} alt={`Gallery ${i + 1}`} className="tile" style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
              <label className="tile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, cursor: 'pointer', border: '2px dashed var(--border-strong)', borderRadius: 9, color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
                <Icon name="i-upload" size={20} />
                Add photo
                <input type="file" accept="image/*" multiple hidden onChange={uploadGallery} />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="row" style={{ justifyContent: 'flex-end', marginTop: 20 }}>
        <Button variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
      </div>
    </div>
  )
}

export default function BusinessProfile() {
  const { data, loading, error, refetch } = useApi(() => api.merchant.profile(), [], [])

  if (loading) return <div className="card card-pad"><PageLoading text="Loading profile…" /></div>
  if (error) return <PageError text="Could not load profile." />
  if (!data) return null

  return <ProfileBody key={data.id} data={data} onSaved={refetch} />
}