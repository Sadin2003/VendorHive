import { Navigate } from 'react-router-dom'
import { useAuth } from '../utils/useAuth'

const HOME = { customer: '/account', merchant: '/merchant', admin: '/admin' }

export function AdminOnly({ children }) {
  const { user } = useAuth()
  if (user?.role === 'admin') return <Navigate to="/admin" replace />
  return children
}

export default function RequireRole({ role, children }) {
  const { user } = useAuth()
  if (!user || user.role === role) return children
  return <Navigate to={HOME[user.role] || '/account'} replace />
}