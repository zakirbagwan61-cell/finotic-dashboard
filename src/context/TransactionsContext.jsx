import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { SEED, OPENING_BALANCE } from '../data/finance'

const Ctx = createContext(null)
const KEY = 'finotic-transactions'

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : SEED
  } catch {
    return SEED
  }
}

export function TransactionsProvider({ children }) {
  const [transactions, setTransactions] = useState(load)
  const [search, setSearch] = useState('')

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(transactions)) } catch { /* ignore */ }
  }, [transactions])

  const add = (t) =>
    setTransactions((p) => [{ ...t, id: Date.now() + '-' + Math.random().toString(36).slice(2, 7) }, ...p])
  const remove = (id) => setTransactions((p) => p.filter((t) => t.id !== id))
  const toggleStatus = (id) =>
    setTransactions((p) =>
      p.map((t) => (t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t))
    )
  const resetDemo = () => setTransactions(SEED)
  const clearAll = () => setTransactions([])

  const stats = useMemo(() => {
    const done = transactions.filter((t) => t.status === 'completed')
    const income = done.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = done.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const savings = Math.max(income - expense, 0)
    return {
      income,
      expense,
      savings,
      balance: OPENING_BALANCE + income - expense,
      savingsRate: income ? Math.round((savings / income) * 100) : 0,
      incomeCount: done.filter((t) => t.type === 'income').length,
      expenseCount: done.filter((t) => t.type === 'expense').length,
    }
  }, [transactions])

  const monthly = useMemo(() => {
    const now = new Date()
    const out = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
      const amount = transactions
        .filter((t) => t.type === 'expense' && t.date.startsWith(key))
        .reduce((s, t) => s + t.amount, 0)
      out.push({ key, month: d.toLocaleString('en-US', { month: 'short' }), amount })
    }
    return out
  }, [transactions])

  const value = { transactions, search, setSearch, add, remove, toggleStatus, resetDemo, clearAll, stats, monthly }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTransactions = () => useContext(Ctx)
