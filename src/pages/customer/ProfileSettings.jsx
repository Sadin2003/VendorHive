import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import { Field, Input, Toggle } from '../../components/ui/Fields'
import Modal from '../../components/ui/Modal'
import { PageLoading, PageError } from '../../components/ui/Loading'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'
import { useAuth } from '../../utils/useAuth'
import { useToast } from '../../components/ui/useToast'

const PREF_DEFS = [
  { key: 'dealAlerts', label: 'New deals from businesses you follow' },
  { key: 'promoAlerts', label: 'Cross-promotion launches nearby' },
  { key: 'reviewAlerts', label: 'Helpful votes & replies to your reviews' },
  { key: 'activityDigest', label: 'Weekly digest of saved-deal expirations' },
  { key: 'newsletter', label: 'Occasional VendorHive newsletter' },
]

export default function ProfileSettings() {
  const { data, loading, error } = useApi(() => api.me.profile(), [], null)

  if (loading) return <PageLoading text="Loading your settings…" />
  if (error || !data) return <PageError text="Could not load your settings." />

  return <Settings key={data.id} profile={data} />
}

function Settings({ profile }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, login, logout } = useAuth()

  const [info, setInfo] = useState({ name: profile.name || '', email: profile.email || '', phone: profile.phone || '', zip: profile.zip || '' })
  const [prefs, setPrefs] = useState(() => PREF_DEFS.map((p) => ({ ...p, on: !!profile.prefs?.[p.key] })))
  const [pw, setPw] = useState({ cur: '', next: '', confirm: '' })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState('')

  const setInfoK = (k) => (e) => setInfo((s) => ({ ...s, [k]: e.target.value }))
  const setPwK = (k) => (e) => setPw((s) => ({ ...s, [k]: e.target.value }))

  const saveInfo = async (e) => {
    e.preventDefault()
    setBusy('info')
    try {
      const res = await api.me.updateProfile({ name: info.name, email: info.email, phone: info.phone, zip: info.zip })
      if (res?.user) login({ ...(user || {}), ...res.user })
      toast(res?.message || 'Personal info saved')
    } catch (err) {
      toast(err?.message || 'Could not save personal info')
    } finally {
      setBusy('')
    }
  }

  const savePrefs = async () => {
    setBusy('prefs')
    try {
      const payload = {}
      for (const p of prefs) payload[p.key] = p.on
      await api.me.updateProfile({ prefs: payload })
      toast('Preferences saved')
    } catch (err) {
      toast(err?.message || 'Could not save preferences')
    } finally {
      setBusy('')
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    if (pw.next !== pw.confirm) {
      toast('New passwords do not match')
      return
    }
    if (!pw.cur) {
      toast('Enter your current password')
      return
    }
    setBusy('pw')
    try {
      const res = await api.me.changePassword({ current: pw.cur, next: pw.next })
      setPw({ cur: '', next: '', confirm: '' })
      toast(res?.message || 'Password updated')
    } catch (err) {
      toast(err?.message || 'Could not update password')
    } finally {
      setBusy('')
    }
  }

  const doDelete = async () => {
    setConfirmDelete(false)
    setBusy('delete')
    try {
      await api.me.deleteAccount()
      logout()
      navigate('/')
    } catch (err) {
      setBusy('')
      toast(err?.message || 'Could not delete your account')
    }
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Profile settings</h1>
          <p>Manage your personal info and notification preferences</p>
        </div>
      </div>

      <div className="col" style={{ gap: 22 }}>
        <div className="card card-pad">
          <h4 style={{ marginBottom: 18 }}>Personal information</h4>
          <form className="form-grid" onSubmit={saveInfo}>
            <Field label="Full name" required>
              <Input value={info.name} onChange={setInfoK('name')} />
            </Field>
            <Field label="Email" required>
              <Input type="email" value={info.email} onChange={setInfoK('email')} />
            </Field>
            <Field label="Phone">
              <Input value={info.phone} onChange={setInfoK('phone')} />
            </Field>
            <Field label="Home ZIP / neighborhood">
              <Input value={info.zip} onChange={setInfoK('zip')} hint="Used to rank nearby businesses and deals." />
            </Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Button type="submit" size="sm" disabled={busy === 'info'}>{busy === 'info' ? 'Saving…' : 'Save changes'}</Button>
            </div>
          </form>
        </div>

        <div className="card card-pad">
          <h4 style={{ marginBottom: 18 }}>Change password</h4>
          <form className="form-grid" onSubmit={savePassword}>
            <Field label="Current password" required>
              <Input type="password" value={pw.cur} onChange={setPwK('cur')} />
            </Field>
            <Field label="New password" required>
              <Input type="password" value={pw.next} onChange={setPwK('next')} />
            </Field>
            <Field label="Confirm new password" required>
              <Input type="password" value={pw.confirm} onChange={setPwK('confirm')} />
            </Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Button type="submit" size="sm" disabled={busy === 'pw'}>{busy === 'pw' ? 'Updating…' : 'Update password'}</Button>
            </div>
          </form>
        </div>

        <div className="card card-pad">
          <div className="row-between" style={{ marginBottom: 8 }}>
            <h4 style={{ margin: 0 }}>Notification preferences</h4>
            <Button variant="outline" size="sm" onClick={savePrefs} disabled={busy === 'prefs'}>{busy === 'prefs' ? 'Saving…' : 'Save preferences'}</Button>
          </div>
          <div className="col" style={{ gap: 6 }}>
            {prefs.map((p) => (
              <label key={p.key} className="row-between" style={{ padding: '10px 0', cursor: 'pointer' }}>
                <span className="small" style={{ fontWeight: 600 }}>{p.label}</span>
                <Toggle
                  id={p.key}
                  checked={p.on}
                  onChange={() => {
                    setPrefs((ps) => ps.map((x) => (x.key === p.key ? { ...x, on: !x.on } : x)))
                  }}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="card card-pad" style={{ borderColor: 'rgba(192,86,66,.3)', background: 'rgba(192,86,66,.03)' }}>
          <div className="row-between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h4 style={{ color: 'var(--danger-2)', marginBottom: 4 }}>Delete account</h4>
              <p className="small muted" style={{ margin: 0 }}>Permanently remove your profile, saved deals, and reviews. This can't be undone.</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} disabled={busy === 'delete'}>
              <Icon name="i-trash" size={14} /> Delete account
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete your account?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Keep my account</Button>
            <Button variant="danger" onClick={doDelete}>Yes, delete everything</Button>
          </>
        }
      >
        <p className="muted" style={{ margin: 0 }}>
          This will permanently remove your account, saved deals, followed businesses, and all of your reviews.
        </p>
      </Modal>
    </div>
  )
}