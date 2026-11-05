import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, LayoutDashboard, Wallet, ArrowLeftRight, Target, PiggyBank,
  Repeat, PieChart, Settings, Plus, Moon, Sun, Receipt,
} from 'lucide-react'
import { useTransactions } from '../context/TransactionsContext'
import { signed } from '../utils/format'

export default function CommandPalette({ onClose, theme, onToggleTheme }) {
  const navigate = useNavigate()
  const { transactions, setSearch, setTxModal } = useTransactions()
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)

  const items = useMemo(() => {
    const go = (label, to, icon) => ({ id: to, label, icon, hint: 'Go to page', run: () => navigate(to) })
    const base = [
      { id: 'add', label: 'Add transaction', icon: Plus, hint: 'Action', run: () => setTxModal({ editing: null }) },
      {
        id: 'theme',
        label: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
        icon: theme === 'dark' ? Sun : Moon,
        hint: 'Action',
        run: onToggleTheme,
      },
      go('Dashboard', '/', LayoutDashboard),
      go('Accounts', '/accounts', Wallet),
      go('Transactions', '/transactions', ArrowLeftRight),
      go('Budgets', '/budgets', Target),
      go('Goals', '/goals', PiggyBank),
      go('Recurring', '/recurring', Repeat),
      go('Reports', '/reports', PieChart),
      go('Settings', '/settings', Settings),
    ]
    const query = q.trim().toLowerCase()
    const cmds = query ? base.filter((i) => i.label.toLowerCase().includes(query)) : base
    const txs =
      query.length >= 2
        ? transactions
            .filter((t) => t.name.toLowerCase().includes(query) || t.category.toLowerCase().includes(query))
            .slice(0, 5)
            .map((t) => ({
              id: 'tx-' + t.id,
              label: t.name,
              icon: Receipt,
              hint: `${signed(t)} · ${t.category}`,
              run: () => { setSearch(t.name); navigate('/transactions') },
            }))
        : []
    return [...cmds, ...txs]
  }, [q, theme, transactions, navigate, onToggleTheme, setSearch, setTxModal])

  const idx = Math.min(active, Math.max(items.length - 1, 0))
  const run = (item) => { onClose(); item.run() }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') return onClose()
    if (!items.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((idx + 1) % items.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((idx - 1 + items.length) % items.length) }
    else if (e.key === 'Enter') { e.preventDefault(); run(items[idx]) }
  }

  return (
    <div className="palette-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="palette card" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="palette-search">
          <Search size={16} />
          <input
            autoFocus
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0) }}
            onKeyDown={onKeyDown}
            placeholder="Search pages, actions or transactions..."
            aria-label="Command search"
          />
          <span className="kbd">Esc</span>
        </div>
        <div className="palette-list">
          {items.map((item, i) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`palette-item ${i === idx ? 'active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => run(item)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                <small className="muted">{item.hint}</small>
              </button>
            )
          })}
          {!items.length && <p className="empty">No results</p>}
        </div>
      </div>
    </div>
  )
}