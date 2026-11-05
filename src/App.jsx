import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import Modal from './components/Modal'
import TransactionForm from './components/TransactionForm'
import CommandPalette from './components/CommandPalette'
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
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('finotic-collapsed') === '1' } catch { return false }
  })
  const { pathname } = useLocation()
  const { setSearch, txModal, setTxModal } = useTransactions()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // storage unavailable, theme just won't persist
    }
  }, [theme])

  useEffect(() => {
    try { localStorage.setItem('finotic-collapsed', collapsed ? '1' : '0') } catch { /* ignore */ }
  }, [collapsed])

  // Clear the search when leaving the Transactions page
  useEffect(() => {
    if (pathname !== '/transactions') setSearch('')
  }, [pathname, setSearch])

  // Ctrl+K / Cmd+K opens the command palette
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return (
    <div className="app">
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        key={pathname}
      />
      {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)} />}
      <div className="main">
        <Topbar
          theme={theme}
          onToggleTheme={toggleTheme}
          onMenu={() => setMenuOpen(true)}
          onPalette={() => setPaletteOpen(true)}
        />
        <div className="page-anim" key={pathname}>
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
      </div>

      {paletteOpen && (
        <CommandPalette onClose={() => setPaletteOpen(false)} theme={theme} onToggleTheme={toggleTheme} />
      )}

      {txModal && (
        <Modal title={txModal.editing ? 'Edit Transaction' : 'Add Transaction'} onClose={() => setTxModal(null)}>
          <TransactionForm
            key={txModal.editing?.id || 'new'}
            editing={txModal.editing}
            onDone={() => setTxModal(null)}
          />
        </Modal>
      )}

      <Toaster
        position="bottom-right"
        toastOptions={{ style: { background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' } }}
      />
    </div>
  )
}