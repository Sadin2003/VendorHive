import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '../../components/layout/AuthShell'
import { Field, Input } from '../../components/ui/Fields'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import { api } from '../../services/api'
import { useToast } from '../../components/ui/useToast'
import { useAuth } from '../../utils/useAuth'

const CATEGORIES = ['Restaurants', 'Cafés', 'Bakeries', 'Clothing', 'Electronics', 'Services', 'Health & Beauty', 'Gifts & Local']

export default function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const { login } = useAuth()
  const [role, setRole] = useState('customer')
  const [terms, setTerms] = useState(false)
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    name: '',
    business: '',
    owner: '',
    email: '',
    phone: '',
    category: CATEGORIES[0],
    address: '',
    password: '',
    confirm: '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const from = location.state?.from || '/'

  const submit = async (e) => {
    e.preventDefault()
    if (!terms) {
      setError('Please accept the terms to continue.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (role === 'merchant' && !form.business.trim()) {
      setError('Please enter your business name.')
      return
    }
    setError('')
    setBusy(true)
    try {
      const payload =
        role === 'merchant'
          ? {
              role: 'merchant',
              owner: form.owner,
              businessName: form.business,
              category: form.category,
              address: form.address,
              phone: form.phone,
              email: form.email,
              password: form.password,
            }
          : { role: 'customer', name: form.name, phone: form.phone, email: form.email, password: form.password }

      const { user } = await api.auth.register(payload)
      login({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status })

      if (role === 'merchant') {
        toast('Application submitted — we\'ll review it shortly!')
        navigate('/')
      } else {
        toast('Account created — welcome to the hive!')
        navigate(from)
      }
    } catch (err) {
      setError(err.message || 'Could not create your account.')
      setBusy(false)
    }
  }

  return (
    <AuthShell>
      <div className="auth-head">
        <h2>Join the hive</h2>
        <p className="auth-sub">Choose your side of the neighborhood.</p>
      </div>

      <div className="role-cards">
        {[
          { id: 'customer', icon: 'i-user', title: "I'm shopping local", text: 'Save deals, follow shops, get alerts.' },
          { id: 'merchant', icon: 'i-store', title: 'I own a business', text: 'Manage deals and cross-promotions.' },
        ].map((r) => (
          <button key={r.id} type="button" className={`role-card ${role === r.id ? 'active' : ''}`} onClick={() => setRole(r.id)}>
            <span className="r-icon" style={{ background: role === r.id ? 'rgba(60,107,79,.12)' : 'var(--surface-2)', color: role === r.id ? 'var(--primary-600)' : 'var(--text-muted)' }}>
              <Icon name={r.icon} />
            </span>
            <strong>{r.title}</strong>
            <span>{r.text}</span>
          </button>
        ))}
      </div>

      <form onSubmit={submit}>
        {role === 'customer' ? (
          <div className="form-grid">
            <Field label="Full name" required>
              <Input required placeholder="Alex Rivera" value={form.name} onChange={set('name')} />
            </Field>
            <Field label="Phone">
              <Input type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={set('phone')} />
            </Field>
          </div>
        ) : (
          <>
            <div className="form-grid">
              <Field label="Business name" required>
                <Input required placeholder="Bean & Leaf" value={form.business} onChange={set('business')} />
              </Field>
              <Field label="Owner name" required>
                <Input required placeholder="Alex Rivera" value={form.owner} onChange={set('owner')} />
              </Field>
            </div>
            <div className="form-grid">
              <Field label="Category" required>
                <select className="select" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Address" required>
                <Input required placeholder="12 Maple Lane, Hive City" value={form.address} onChange={set('address')} />
              </Field>
            </div>
          </>
        )}
        <Field label="Email" required>
          <Input type="email" required placeholder="you@example.com" value={form.email} onChange={set('email')} />
        </Field>
        <div className="form-grid">
          <Field label="Password" required>
            <div className="input-icon-right">
              <Input type={show ? 'text' : 'password'} required placeholder="8+ characters" value={form.password} onChange={set('password')} />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label="Toggle password visibility">
                <Icon name={show ? 'i-eye-off' : 'i-eye'} />
              </button>
            </div>
          </Field>
          <Field label="Confirm password" required>
            <Input type={show ? 'text' : 'password'} required placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} />
          </Field>
        </div>
        {error && (
          <div style={{ background: 'rgba(192,86,66,.1)', color: 'var(--danger-2)', borderRadius: 10, padding: '10px 14px', fontSize: '0.86rem', marginBottom: 14 }}>
            {error}
          </div>
        )}
        <label className="checkbox" style={{ marginBottom: 18 }}>
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
          I agree to the <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a> and{' '}
          <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
        </label>
        <Button type="submit" block size="lg" disabled={busy}>
          {role === 'merchant' ? (busy ? 'Submitting…' : 'Create merchant account') : busy ? 'Creating…' : 'Create account'}
        </Button>
      </form>
      <p className="auth-switch text-center" style={{ marginTop: 20 }}>
        Already registered?{' '}
        <Link to="/login" style={{ fontWeight: 700 }}>
          Log in
        </Link>
      </p>
    </AuthShell>
  )
}