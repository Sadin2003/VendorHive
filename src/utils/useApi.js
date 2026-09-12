import { useCallback, useEffect, useRef, useState } from 'react'

// Small read-fetching helper: runs `fn` on mount and whenever `deps` change.
// Returns { data, loading, error, refetch }.
export function useApi(fn, deps = [], initial = null) {
  const [data, setData] = useState(initial)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fnRef = useRef(fn)
  const genRef = useRef(0)

  useEffect(() => {
    fnRef.current = fn
  }, [fn])

  const load = useCallback(async (...args) => {
    const gen = ++genRef.current
    setLoading(true)
    setError(null)
    try {
      const res = await fnRef.current(...args)
      if (gen === genRef.current) {
        setData(res)
        setLoading(false)
      }
      return res
    } catch (err) {
      if (gen === genRef.current) {
        setError(err)
        setLoading(false)
      }
      throw err
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => load()).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, refetch: load }
}