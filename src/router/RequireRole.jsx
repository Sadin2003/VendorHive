import { Navigate } from 'react-router-dom'
import { useAuth } from '../utils/useAuth'

const HOME = { customer: '/account', merchant: '/merchant', admin: '/admin' }

export function Splash() {
  return (
    <div className="shell-body" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div className="text-center">
        <div
          aria-hidden="true"
          style={{
            width: 34,
            height: 34,
            margin: '0 auto',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p className="hint-role" style={{ marginTop: 12 }}>Loading your hive…</p>
      </div>
    </div>
  )
}

export function AdminOnly({ children }) {
  const { user, ready } = useAuth()
  if (!ready) return <Splash />
  if (user?.role === 'admin') return <Navigate to="/admin" replace />
  return children
}

export default function RequireRole({ role, children }) {
  const { user, ready } = useAuth()
  if (!ready) return <Splash />
  if (!user || user.role === role) return children
  return <Navigate to={HOME[user.role] || '/account'} replace />
}