import { Navigate } from 'react-router-dom'
import { useAuth } from '../utils/useAuth'

const HOME = { customer: '/account', merchant: '/merchant', admin: '/admin' }

function Loading() {
  return <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
}

export function AdminOnly({ children }) {
  const { user, initializing } = useAuth()
  if (initializing) return <Loading />
  if (user?.role === 'admin') return <Navigate to="/admin" replace />
  return children
}

export default function RequireRole({ role, children }) {
  const { user, initializing } = useAuth()
  if (initializing) return <Loading />
  if (!user || user.role === role) return children
  return <Navigate to={HOME[user.role] || '/account'} replace />
}