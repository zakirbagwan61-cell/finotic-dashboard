import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { SEED, MAIN_ACCOUNT, DEFAULT_ACCOUNTS, DEFAULT_BUDGETS, DEFAULT_GOALS } from '../data/finance'
import { setFormatCurrency, monthKey, pad } from '../utils/format'

const Ctx = createContext(null)

const K = {
  tx: 'finotic-transactions',
  accounts: 'finotic-accounts',
  transfers: 'finotic-transfers',
  budgets: 'finotic-budgets',
  goals: 'finotic-goals',
  recurring: 'finotic-recurring',
  settings: 'finotic-settings',
}

const DEFAULT_SETTINGS = { currency: 'USD', countPending: false, name: 'Rehan', email: '' }

const uid = () => Date.now() + '-' + Math.random().toString(36).slice(2, 7)
const sum = (list, type) =>
  list.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0)

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

// Create this month's transaction for each recurring rule that is due and hasn't run yet
function applyRecurring(transactions, recurring) {
  const now = new Date()
  const key = monthKey(now)
  const added = []
  const rules = recurring.map((r) => {
    if (r.lastRun === key || now.getDate() < r.day) return r
    added.push({
      id: uid(), name: r.name, amount: r.amount, type: r.type, category: r.category,
      accountId: r.accountId, date: `${key}-${pad(r.day)}`, status: 'completed', recurringId: r.id,
    })
    return { ...r, lastRun: key }
  })
  return { transactions: added.length ? [...added, ...transactions] : transactions, recurring: rules }
}

// Pure function: reads data from localStorage (safe even if StrictMode runs it twice)
function bootstrap() {
  const tx = read(K.tx, SEED).map((t) => ({ ...t, accountId: t.accountId || MAIN_ACCOUNT }))
  const applied = applyRecurring(tx, read(K.recurring, []))
  return {
    transactions: applied.transactions,
    recurring: applied.recurring,
    accounts: read(K.accounts, DEFAULT_ACCOUNTS),
    transfers: read(K.transfers, []),
    budgets: read(K.budgets, DEFAULT_BUDGETS),
    goals: read(K.goals, DEFAULT_GOALS),
    settings: { ...DEFAULT_SETTINGS, ...read(K.settings, {}) },
  }
}

function usePersisted(key, initial) {
  const state = useState(initial)
  const value = state[0]
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
  }, [key, value])
  return state
}

export function TransactionsProvider({ children }) {
  const [init] = useState(bootstrap)
  const [transactions, setTransactions] = usePersisted(K.tx, init.transactions)
  const [accounts, setAccounts] = usePersisted(K.accounts, init.accounts)
  const [transfers, setTransfers] = usePersisted(K.transfers, init.transfers)
  const [budgets, setBudgets] = usePersisted(K.budgets, init.budgets)
  const [goals, setGoals] = usePersisted(K.goals, init.goals)
  const [recurring, setRecurring] = usePersisted(K.recurring, init.recurring)
  const [settings, setSettings] = usePersisted(K.settings, init.settings)
  const [search, setSearch] = useState('')
  const [txModal, setTxModal] = useState(null) // null | { editing: tx | null }

  // money() needs to know the currency (set before render)
  setFormatCurrency(settings.currency)

  // ---- transactions ----
  const add = (t) =>
    setTransactions((p) => [{ status: 'completed', accountId: MAIN_ACCOUNT, ...t, id: uid() }, ...p])
  const addMany = (list) =>
    setTransactions((p) => [...list.map((t) => ({ ...t, id: uid() })), ...p])
  const remove = (id) => setTransactions((p) => p.filter((t) => t.id !== id))
  const removeMany = (ids) => setTransactions((p) => p.filter((t) => !ids.includes(t.id)))
  const update = (id, patch) =>
    setTransactions((p) => p.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  const updateMany = (ids, patch) =>
    setTransactions((p) => p.map((t) => (ids.includes(t.id) ? { ...t, ...patch } : t)))
  const restore = (items) => setTransactions((p) => [...items, ...p]) // undo delete (keeps original ids)
  const toggleStatus = (id) =>
    setTransactions((p) =>
      p.map((t) => (t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t))
    )

  // ---- accounts ----
  const addAccount = (a) => setAccounts((p) => [...p, { ...a, id: uid() }])
  const updateAccount = (id, patch) =>
    setAccounts((p) => p.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  const removeAccount = (id) => {
    const used =
      transactions.some((t) => t.accountId === id) ||
      transfers.some((t) => t.from === id || t.to === id)
    if (used || accounts.length <= 1) return false
    setAccounts((p) => p.filter((a) => a.id !== id))
    return true
  }
  const addTransfer = (t) => setTransfers((p) => [{ ...t, id: uid() }, ...p])

  // ---- budgets ----
  const setBudget = (category, limit) =>
    setBudgets((p) =>
      p.some((b) => b.category === category)
        ? p.map((b) => (b.category === category ? { ...b, limit } : b))
        : [...p, { id: uid(), category, limit }]
    )
  const removeBudget = (id) => setBudgets((p) => p.filter((b) => b.id !== id))

  // ---- goals ----
  const addGoal = (g) => setGoals((p) => [...p, { ...g, id: uid() }])
  const fundGoal = (id, amount) =>
    setGoals((p) => p.map((g) => (g.id === id ? { ...g, saved: g.saved + amount } : g)))
  const removeGoal = (id) => setGoals((p) => p.filter((g) => g.id !== id))

  // ---- recurring ----
  const addRecurring = (r) =>
    setRecurring((p) => [
      ...p,
      // If this month's day has already passed, the first run happens next month
      { ...r, id: uid(), lastRun: new Date().getDate() >= r.day ? monthKey() : '' },
    ])
  const removeRecurring = (id) => setRecurring((p) => p.filter((r) => r.id !== id))

  // ---- settings / data ----
  const updateSettings = (patch) => setSettings((p) => ({ ...p, ...patch }))
  const resetDemo = () => {
    setTransactions(SEED.map((t) => ({ ...t, accountId: MAIN_ACCOUNT })))
    setAccounts(DEFAULT_ACCOUNTS)
    setTransfers([])
    setBudgets(DEFAULT_BUDGETS)
    setGoals(DEFAULT_GOALS)
    setRecurring([])
  }
  const clearAll = () => {
    setTransactions([])
    setTransfers([])
  }

  // ---- backup / restore ----
  const exportData = () => ({
    version: 1, transactions, accounts, transfers, budgets, goals, recurring, settings,
  })
  const importData = (d) => {
    const isArr = Array.isArray
    const validTx =
      d && isArr(d.transactions) &&
      d.transactions.every(
        (t) => t && typeof t.amount === 'number' && typeof t.date === 'string' && ['income', 'expense'].includes(t.type)
      )
    if (!validTx || !isArr(d.accounts) || d.accounts.length === 0) return false
    setTransactions(d.transactions.map((t) => ({ ...t, accountId: t.accountId || MAIN_ACCOUNT })))
    setAccounts(d.accounts)
    setTransfers(isArr(d.transfers) ? d.transfers : [])
    setBudgets(isArr(d.budgets) ? d.budgets : [])
    setGoals(isArr(d.goals) ? d.goals : [])
    setRecurring(isArr(d.recurring) ? d.recurring : [])
    setSettings({ ...DEFAULT_SETTINGS, ...(d.settings || {}) })
    return true
  }

  // ---- derived ----
  const counted = useMemo(
    () => (settings.countPending ? transactions : transactions.filter((t) => t.status === 'completed')),
    [transactions, settings.countPending]
  )

  const balances = useMemo(() => {
    const map = {}
    accounts.forEach((a) => { map[a.id] = a.opening })
    counted.forEach((t) => {
      if (t.accountId in map) map[t.accountId] += t.type === 'income' ? t.amount : -t.amount
    })
    transfers.forEach((t) => {
      if (t.from in map) map[t.from] -= t.amount
      if (t.to in map) map[t.to] += t.amount
    })
    return map
  }, [accounts, counted, transfers])

  const stats = useMemo(() => {
    const income = sum(counted, 'income')
    const expense = sum(counted, 'expense')
    const savings = Math.max(income - expense, 0)
    return {
      income,
      expense,
      savings,
      balance: Object.values(balances).reduce((s, v) => s + v, 0),
      savingsRate: income ? Math.round((savings / income) * 100) : 0,
      incomeCount: counted.filter((t) => t.type === 'income').length,
      expenseCount: counted.filter((t) => t.type === 'expense').length,
      pendingCount: transactions.filter((t) => t.status === 'pending').length,
    }
  }, [counted, transactions, balances])

  const monthly = useMemo(() => {
    const now = new Date()
    const out = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = monthKey(d)
      const inMonth = counted.filter((t) => t.date.startsWith(key))
      out.push({
        key,
        month: d.toLocaleString('en-US', { month: 'short' }),
        amount: sum(inMonth, 'expense'),
        income: sum(inMonth, 'income'),
      })
    }
    return out
  }, [counted])

  const budgetUsage = useMemo(() => {
    const mk = monthKey()
    return budgets.map((b) => {
      const spent = counted
        .filter((t) => t.type === 'expense' && t.category === b.category && t.date.startsWith(mk))
        .reduce((s, t) => s + t.amount, 0)
      return { ...b, spent, pct: Math.round((spent / b.limit) * 100) }
    })
  }, [budgets, counted])

  const value = {
    transactions, counted, search, setSearch, txModal, setTxModal,
    add, addMany, update, updateMany, remove, removeMany, restore, toggleStatus,
    accounts, balances, transfers, addAccount, updateAccount, removeAccount, addTransfer,
    budgets, budgetUsage, setBudget, removeBudget,
    goals, addGoal, fundGoal, removeGoal,
    recurring, addRecurring, removeRecurring,
    settings, updateSettings, resetDemo, clearAll, exportData, importData,
    stats, monthly,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTransactions = () => useContext(Ctx)