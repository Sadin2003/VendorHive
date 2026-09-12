import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AuthShell from '../../components/layout/AuthShell'
import { Field, Input } from '../../components/ui/Fields'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import { api } from '../../services/api'
import { useToast } from '../../components/ui/useToast'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const toast = useToast()

  const [token, setToken] = useState(params.get('token') || '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!token.trim()) {
      setError('Please paste the token from your reset link.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setBusy(true)
    try {
      await api.auth.resetPassword({ token: token.trim(), password })
      setDone(true)
      toast('Password updated — you can now log in.')
    } catch (err) {
      setError(err.message || 'Could not reset your password.')
      setBusy(false)
    }
  }

  return (
    <AuthShell>
      <div className="auth-head">
        <h2>Choose a new password</h2>
        <p className="auth-sub">Your reset token has been pre-filled from the link.</p>
      </div>

      {done ? (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <Icon name="i-check" size={40} style={{ color: 'var(--primary-600)' }} />
          <h3 style={{ margin: '16px 0 8px' }}>Password updated</h3>
          <p className="muted small">Log in with your new password.</p>
          <Button to="/login" variant="primary" block size="lg" style={{ marginTop: 18 }}>
            Go to login
          </Button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <Field label="Reset token" required>
            <Input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste the token from your reset link"
              style={{ fontFamily: 'monospace' }}
            />
          </Field>
          <div className="form-grid">
            <Field label="New password" required>
              <div className="input-icon-right">
                <Input
                  type={show ? 'text' : 'password'}
                  required
                  placeholder="8+ characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label="Toggle password visibility">
                  <Icon name={show ? 'i-eye-off' : 'i-eye'} />
                </button>
              </div>
            </Field>
            <Field label="Confirm password" required>
              <Input
                type={show ? 'text' : 'password'}
                required
                placeholder="Repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </Field>
          </div>
          {error && (
            <div style={{ background: 'rgba(192,86,66,.1)', color: 'var(--danger-2)', borderRadius: 10, padding: '10px 14px', fontSize: '0.86rem', marginBottom: 14 }}>
              {error}
            </div>
          )}
          <Button type="submit" block size="lg" disabled={busy}>
            {busy ? 'Resetting…' : 'Reset password'}
          </Button>
        </form>
      )}

      <p className="auth-switch text-center" style={{ marginTop: 20 }}>
        <Link to="/login" style={{ fontWeight: 700 }}>
          Back to login
        </Link>
      </p>
    </AuthShell>
  )
}