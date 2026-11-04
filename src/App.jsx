import { useEffect, useState } from 'react'
import './App.css'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'light'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // storage unavailable, theme just won't persist
    }
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar theme={theme} onToggleTheme={toggleTheme} />
        <Dashboard />
      </div>
    </div>
  )
}
