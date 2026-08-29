import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '../../components/layout/AuthShell'
import { Field, Input } from '../../components/ui/Fields'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import { useToast } from '../../components/ui/useToast'
import { useAuth } from '../../utils/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const from = location.state?.from || '/'

  const submit = (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter both your email and password.')
      return
    }
    setError('')
    const role = email.includes('admin') ? 'admin' : email.includes('merchant') ? 'merchant' : 'customer'
    login({ name: email.split('@')[0] || 'Hive member', email, role })
    toast('Welcome back to the hive!')
    const home = { admin: '/admin', merchant: '/merchant', customer: '/account' }
    navigate(role === 'customer' ? from : home[role])
  }

  return (
    <AuthShell>
      <div className="auth-head">
        <h2>Welcome back</h2>
        <p className="auth-sub">Log in to see today's local deals.</p>
      </div>
      <form onSubmit={submit}>
        <Field label="Email" required>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </Field>
        <Field label="Password" required>
          <div className="input-icon-right">
            <Input
              type={show ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
              <Icon name={show ? 'i-eye-off' : 'i-eye'} />
            </button>
          </div>
        </Field>
        {error && (
          <div style={{ background: 'rgba(192,86,66,.1)', color: 'var(--danger-2)', borderRadius: 10, padding: '10px 14px', fontSize: '0.86rem', marginBottom: 14 }}>
            {error}
          </div>
        )}
        <div className="row-between" style={{ marginBottom: 20 }}>
          <label className="checkbox">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me
          </label>
          <button
            type="button"
            className="btn-link"
            onClick={() => toast('Password reset link sent to your email.')}
          >
            Forgot password?
          </button>
        </div>
        <Button type="submit" block size="lg">
          Log in
        </Button>
      </form>
      <p className="auth-switch text-center" style={{ marginTop: 20 }}>
        New to VendorHive?{' '}
        <Link to="/register" style={{ fontWeight: 700 }}>
          Create an account
        </Link>
      </p>
      <p className="hint-role">
        <strong>Demo tip:</strong> log in with <b>admin@vendorhive.app</b> → admin portal,
        <b> name@merchant.com</b> → merchant portal, anything else → customer dashboard.
      </p>
    </AuthShell>
  )
}