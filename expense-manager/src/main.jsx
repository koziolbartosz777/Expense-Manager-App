import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { useThemeStore } from './store/useThemeStore'
import { useAuthStore } from './store/useAuthStore'

// Inicjalizuj motyw przed renderowaniem
useThemeStore.getState().initTheme()

// Inicjalizuj sesję auth
useAuthStore.getState().initAuth()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
