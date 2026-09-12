import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { api } from '../services/api'
import { useToast } from '../components/ui/useToast'

// Shared deal save/unsave logic used by pages that render DealCards.
export function useSavedDeals() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [savedIds, setSavedIds] = useState(() => new Set())

  useEffect(() => {
    let on = true
    if (!user) {
      Promise.resolve().then(() => {
        if (on) setSavedIds(new Set())
      })
      return () => {
        on = false
      }
    }
    api.me
      .saved()
      .then((rows) => {
        if (on) setSavedIds(new Set((rows || []).map((r) => r.id)))
      })
      .catch(() => {})
    return () => {
      on = false
    }
  }, [user])

  const toggle = useCallback(
    async (deal, wantSave) => {
      if (!user) {
        toast('Log in to save deals')
        navigate('/login', { state: { from: location.pathname } })
        return
      }
      try {
        if (wantSave) await api.me.saveDeal(deal.id)
        else await api.me.unsaveDeal(deal.id)
        setSavedIds((prev) => {
          const next = new Set(prev)
          if (wantSave) next.add(deal.id)
          else next.delete(deal.id)
          return next
        })
        toast(wantSave ? 'Deal saved!' : 'Deal removed from saved')
      } catch (err) {
        toast(err && err.message ? err.message : 'Could not update saved deals')
      }
    },
    [user, toast, navigate, location.pathname]
  )

  const contains = useCallback((id) => savedIds.has(id), [savedIds])

  return { savedIds, toggle, contains }
}