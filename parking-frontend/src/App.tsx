import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes'
import { AuthProvider } from './hooks/useAuth'
import { Toaster } from 'react-hot-toast'
import React from 'react'
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
