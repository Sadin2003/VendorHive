import { useCallback, useState } from 'react'
import Icon from './Icon'
import { ToastCtx } from './useToast'

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const push = useCallback((msg) => {
    const id = `t${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    setToasts((t) => [...t, { id, msg }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-wrap" role="status">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>
            <Icon name="i-check-circle" size={18} />
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}