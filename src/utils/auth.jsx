import { useEffect, useState, useCallback } from 'react'
import { AuthContext } from './authContext'
import { api } from '../services/api'

const STORAGE_KEY = 'vh_user'

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readStored)
  const [initializing, setInitializing] = useState(true)

  const persist = (u) => {
    setUser(u)
    try {
      if (u) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
      else window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore storage errors
    }
  }

  useEffect(() => {
    let active = true
    api.auth
      .me()
      .then((res) => {
        if (active) persist(res.user)
      })
      .catch(() => {
        if (active) persist(null)
      })
      .finally(() => {
        if (active) setInitializing(false)
      })
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (payload) => {
    const res = await api.auth.login(payload)
    persist(res.user)
    return res.user
  }, [])

  const register = useCallback(async (payload) => {
    const res = await api.auth.register(payload)
    persist(res.user)
    return res.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.auth.logout()
    } catch {
      // ignore network errors on logout
    }
    persist(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, initializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
