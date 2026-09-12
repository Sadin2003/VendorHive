import { useEffect, useState } from 'react'
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

function persist(user) {
  try {
    if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore storage errors
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readStored)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const restore = async () => {
      try {
        const stored = readStored()
        if (!stored) {
          setReady(true)
          return
        }
        const { user: fresh } = await api.auth.me()
        if (!cancelled) {
          setUser(fresh)
          setReady(true)
        }
      } catch {
        if (!cancelled) {
          setUser(null)
          persist(null)
          setReady(true)
        }
      }
    }

    restore()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    persist(user)
  }, [user])

  const login = (u) => setUser(u)

  const logout = async () => {
    try {
      await api.auth.logout()
    } catch {
      // server session may already be gone — clear locally regardless
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, ready }}>{children}</AuthContext.Provider>
  )
}