import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AuthProvider from '../../src/utils/auth.jsx'
import { AuthContext } from '../../src/utils/authContext.js'
import { useAuth } from '../../src/utils/useAuth.js'
import RequireRole, { Splash } from '../../src/router/RequireRole.jsx'
import { ToastCtx } from '../../src/components/ui/useToast.js'
import Login from '../../src/pages/auth/Login.jsx'
import { api } from '../../src/services/api.js'

const STORAGE_KEY = 'vh_user'

vi.mock('../../src/services/api.js', () => ({
  api: {
    auth: {
      me: vi.fn(),
      login: vi.fn(),
      logout: vi.fn().mockResolvedValue(undefined),
    },
  },
}))

function Probe() {
  const { user, ready, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="ready">{ready ? 'yes' : 'no'}</span>
      <span data-testid="user">{user ? `${user.name}:${user.role}` : 'none'}</span>
      <button onClick={() => login({ id: '1', name: 'Aisha', role: 'customer' })}>do-login</button>
      <button onClick={() => logout()}>do-logout</button>
    </div>
  )
}

beforeEach(() => {
  window.localStorage.clear()
  vi.clearAllMocks()
})

describe('useAuth', () => {
  it('throws outside of AuthProvider', () => {
    const Boom = () => {
      useAuth()
      return null
    }
    expect(() => render(<Boom />)).toThrow('useAuth must be used within AuthProvider')
  })
})

describe('AuthProvider restore', () => {
  it('becomes ready with no stored user and never pings the session', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )
    expect(await screen.findByTestId('ready')).toHaveTextContent('yes')
    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(api.auth.me).not.toHaveBeenCalled()
  })

  it('restores a stored session from the live /me response', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: 'x', name: 'Old', role: 'customer' }))
    api.auth.me.mockResolvedValue({ user: { id: 'u1', name: 'Aisha', role: 'customer', status: 'active' } })
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )
    expect(await screen.findByText('Aisha:customer')).toBeInTheDocument()
  })

  it('clears a stale session when /me fails', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: 'x', name: 'Old', role: 'customer' }))
    api.auth.me.mockRejectedValue(new Error('gone'))
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )
    expect(await screen.findByTestId('user')).toHaveTextContent('none')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})

describe('AuthProvider login / logout', () => {
  it('logs in and out through the context', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )
    await screen.findByTestId('ready')
    fireEvent.click(screen.getByText('do-login'))
    expect(screen.getByTestId('user')).toHaveTextContent('Aisha:customer')

    fireEvent.click(screen.getByText('do-logout'))
    expect(await screen.findByText('none')).toBeInTheDocument()
    expect(api.auth.logout).toHaveBeenCalledTimes(1)
  })
})

describe('RequireRole', () => {
  const renderGuarded = (user, role) =>
    render(
      <AuthContext.Provider value={{ user, ready: true, login: vi.fn(), logout: vi.fn() }}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <RequireRole role={role}>
                  <div>Protected Content</div>
                </RequireRole>
              }
            />
            <Route path="/account" element={<div>Customer Home</div>} />
            <Route path="/merchant" element={<div>Merchant Home</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    )

  it('renders children for the matching role', () => {
    renderGuarded({ id: '1', role: 'merchant' }, 'merchant')
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects a customer away from merchant routes', () => {
    renderGuarded({ id: '1', role: 'customer' }, 'merchant')
    expect(screen.getByText('Customer Home')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})

describe('Splash', () => {
  it('shows the loading gate', () => {
    render(<Splash />)
    expect(screen.getByText('Loading your hive…')).toBeInTheDocument()
  })
})

describe('Login page', () => {
  const renderLogin = () => {
    const toast = vi.fn()
    render(
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: '/account' } }]}>
        <AuthProvider>
          <ToastCtx.Provider value={toast}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/account" element={<div>Account Home</div>} />
            </Routes>
          </ToastCtx.Provider>
        </AuthProvider>
      </MemoryRouter>
    )
    return toast
  }

  it('shows a validation error for empty fields', async () => {
    renderLogin()
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))
    expect(await screen.findByText('Please enter both your email and password.')).toBeInTheDocument()
  })

  it('logs in a customer and navigates home', async () => {
    const toast = renderLogin()
    api.auth.login.mockResolvedValue({
      user: { id: 'u1', name: 'Aisha', email: 'a@x.co', role: 'customer', status: 'active' },
    })
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'aisha@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText('Account Home')).toBeInTheDocument()
    expect(api.auth.login).toHaveBeenCalledWith({ email: 'aisha@example.com', password: 'password123' })
    expect(toast).toHaveBeenCalledWith('Welcome back to the hive!')
  })

  it('surfaces a bad-credentials error', async () => {
    renderLogin()
    api.auth.login.mockRejectedValue(new Error('Invalid credentials'))
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'aisha@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument()
  })
})