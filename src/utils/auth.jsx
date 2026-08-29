import { useEffect, useState } from 'react'
import { AuthContext } from './authContext'

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

  useEffect(() => {
    try {
      if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      else window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore storage errors
    }
  }, [user])

  const login = (u) => setUser(u)
  const logout = () => setUser(null)

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}