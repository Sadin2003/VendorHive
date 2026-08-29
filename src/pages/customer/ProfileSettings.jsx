import { useState } from 'react'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import { Field, Input, Toggle } from '../../components/ui/Fields'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/useToast'

const PREF = [
  { id: 'deals', label: 'New deals from businesses you follow', on: true },
  { id: 'promos', label: 'Cross-promotion launches nearby', on: true },
  { id: 'reviews', label: 'Helpful votes & replies to your reviews', on: false },
  { id: 'weekly', label: 'Weekly digest of saved-deal expirations', on: true },
]

export default function ProfileSettings() {
  const toast = useToast()
  const [info, setInfo] = useState({ name: 'Alex Rivera', email: 'alex@example.com', phone: '(555) 010-2233', zip: '51001' })
  const [pw, setPw] = useState({ cur: '', next: '', confirm: '' })
  const [prefs, setPrefs] = useState(PREF)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const set = (obj, k) => (e) => setState(obj, k, e.target.value)
  const setState = (obj, k, v) => {
    const updater = obj === 'info' ? setInfo : setPw
    updater((s) => ({ ...s, [k]: v }))
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
          <form
            className="form-grid"
            onSubmit={(e) => {
              e.preventDefault()
              toast('Personal info saved')
            }}
          >
            <Field label="Full name" required>
              <Input value={info.name} onChange={set('info', 'name')} />
            </Field>
            <Field label="Email" required>
              <Input type="email" value={info.email} onChange={set('info', 'email')} />
            </Field>
            <Field label="Phone">
              <Input value={info.phone} onChange={set('info', 'phone')} />
            </Field>
            <Field label="Home ZIP / neighborhood">
              <Input value={info.zip} onChange={set('info', 'zip')} hint="Used to rank nearby businesses and deals." />
            </Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Button type="submit" size="sm">Save changes</Button>
            </div>
          </form>
        </div>

        <div className="card card-pad">
          <h4 style={{ marginBottom: 18 }}>Change password</h4>
          <form
            className="form-grid"
            onSubmit={(e) => {
              e.preventDefault()
              if (pw.next !== pw.confirm) {
                toast('New passwords do not match')
                return
              }
              toast('Password updated')
              setPw({ cur: '', next: '', confirm: '' })
            }}
          >
            <Field label="Current password" required>
              <Input type="password" value={pw.cur} onChange={set('pw', 'cur')} />
            </Field>
            <Field label="New password" required>
              <Input type="password" value={pw.next} onChange={set('pw', 'next')} />
            </Field>
            <Field label="Confirm new password" required>
              <Input type="password" value={pw.confirm} onChange={set('pw', 'confirm')} />
            </Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Button type="submit" size="sm">Update password</Button>
            </div>
          </form>
        </div>

        <div className="card card-pad">
          <h4 style={{ marginBottom: 18 }}>Notification preferences</h4>
          <div className="col" style={{ gap: 6 }}>
            {prefs.map((p) => (
              <label key={p.id} className="row-between" style={{ padding: '10px 0', cursor: 'pointer' }}>
                <span className="small" style={{ fontWeight: 600 }}>{p.label}</span>
                <Toggle
                  id={p.id}
                  checked={p.on}
                  onChange={() => {
                    setPrefs((ps) => ps.map((x) => (x.id === p.id ? { ...x, on: !x.on } : x)))
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
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
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
            <Button variant="danger" onClick={() => { setConfirmDelete(false); toast("We're sorry to see you go") }}>
              Yes, delete everything
            </Button>
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