import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Accounts from './pages/Accounts'
import Budgets from './pages/Budgets'
import Goals from './pages/Goals'
import Recurring from './pages/Recurring'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import { useTransactions } from './context/TransactionsContext'

export default function App() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'light'
  )
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const { setSearch } = useTransactions()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // storage unavailable, theme just won't persist
    }
  }, [theme])

  // Transactions page chhodte hi search saaf ho jaye
  useEffect(() => {
    if (pathname !== '/transactions') setSearch('')
  }, [pathname, setSearch])

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return (
    <div className="app">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} key={pathname} />
      {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)} />}
      <div className="main">
        <Topbar theme={theme} onToggleTheme={toggleTheme} onMenu={() => setMenuOpen(true)} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/recurring" element={<Recurring />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings theme={theme} onToggleTheme={toggleTheme} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{ style: { background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' } }}
      />
    </div>
  )
}