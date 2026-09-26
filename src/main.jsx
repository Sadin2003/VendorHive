import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './router/Routes.jsx'
import { ToastProvider } from './components/ui/Toast'
import AuthProvider from './utils/auth'
import CarbonFootprintDisplay from './components/ui/CarbonFootprintDisplay'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
        <CarbonFootprintDisplay />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
)