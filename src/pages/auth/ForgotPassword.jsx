import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthShell from '../../components/layout/AuthShell'
import { Field, Input } from '../../components/ui/Fields'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import { api } from '../../services/api'
import { useToast } from '../../components/ui/useToast'

export default function ForgotPassword() {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address.')
      return
    }
    setError('')
    setBusy(true)
    try {
      await api.auth.forgotPassword({ email })
      setSent(true)
      toast('If that account exists, a reset link was sent.')
    } catch (err) {
      setError(err.message || 'Could not request a reset link.')
      setBusy(false)
    }
  }

  return (
    <AuthShell>
      <div className="auth-head">
        <h2>Reset your password</h2>
        <p className="auth-sub">Enter your account email and we'll email you a reset link.</p>
      </div>

      {sent ? (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <Icon name="i-mail" size={40} style={{ color: 'var(--primary-600)' }} />
          <h3 style={{ margin: '16px 0 8px' }}>Check your inbox</h3>
          <p className="muted small">If an account exists for <b>{email}</b>, a reset link is on its way.<br />Open it to choose a new password.</p>
          <div className="row" style={{ justifyContent: 'center', gap: 10, marginTop: 18 }}>
            <Button to="/login" variant="outline">Back to login</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          <Field label="Email" required>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </Field>
          {error && (
            <div style={{ background: 'rgba(192,86,66,.1)', color: 'var(--danger-2)', borderRadius: 10, padding: '10px 14px', fontSize: '0.86rem', marginBottom: 14 }}>
              {error}
            </div>
          )}
          <Button type="submit" block size="lg" disabled={busy}>
            {busy ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}

      <p className="auth-switch text-center" style={{ marginTop: 20 }}>
        Remembered it after all?{' '}
        <Link to="/login" style={{ fontWeight: 700 }}>
          Log in
        </Link>
      </p>
    </AuthShell>
  )
}