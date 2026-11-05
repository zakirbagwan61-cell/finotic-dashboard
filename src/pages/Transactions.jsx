import { useMemo, useRef, useState } from 'react'
import { Trash2, Download, Upload, Pencil, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/Modal'
import TransactionForm from '../components/TransactionForm'
import { CATEGORIES } from '../data/finance'
import { useTransactions } from '../context/TransactionsContext'
import { parseCsv } from '../utils/csv'
import { signed, fmtDate } from '../utils/format'

const PAGE_SIZE = 10
const TABS = [['all', 'All'], ['income', 'Income'], ['expense', 'Expense']]
const SORTS = {
  'date-desc': (a, b) => b.date.localeCompare(a.date),
  'date-asc': (a, b) => a.date.localeCompare(b.date),
  'amount-desc': (a, b) => b.amount - a.amount,
  'amount-asc': (a, b) => a.amount - b.amount,
  'name-asc': (a, b) => a.name.localeCompare(b.name),
}

export default function Transactions() {
  const { transactions, accounts, search, remove, toggleStatus, addMany } = useTransactions()
  const [tab, setTab] = useState('all')
  const [category, setCategory] = useState('all')
  const [account, setAccount] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState('date-desc')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null) // null | { editing: tx | null }
  const fileRef = useRef(null)

  const accName = useMemo(() => Object.fromEntries(accounts.map((a) => [a.id, a.name])), [accounts])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return transactions
      .filter((t) => tab === 'all' || t.type === tab)
      .filter((t) => category === 'all' || t.category === category)
      .filter((t) => account === 'all' || t.accountId === account)
      .filter((t) => !from || t.date >= from)
      .filter((t) => !to || t.date <= to)
      .filter((t) => !q || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
      .sort(SORTS[sort])
  }, [transactions, search, tab, category, account, from, to, sort])

  const pages = Math.max(Math.ceil(rows.length / PAGE_SIZE), 1)
  const current = Math.min(page, pages)
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const change = (setter) => (e) => { setter(e.target.value); setPage(1) }
  const hasFilters = category !== 'all' || account !== 'all' || from || to
  const clearFilters = () => { setCategory('all'); setAccount('all'); setFrom(''); setTo(''); setPage(1) }

  const handleDelete = (t) => {
    if (!window.confirm(`Delete "${t.name}"?`)) return
    remove(t.id)
    toast.success('Transaction deleted')
  }

  const exportCsv = () => {
    const q = (v) => `"${String(v).replace(/"/g, '""')}"`
    const head = 'Name,Category,Type,Date,Status,Amount,Account'
    const body = rows.map((t) =>
      [t.name, t.category, t.type, t.date, t.status, t.amount, accName[t.accountId] || ''].map(q).join(',')
    )
    const blob = new Blob([[head, ...body].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'transactions.csv'
    a.click()
    URL.revokeObjectURL(a.href)
    toast.success('CSV exported')
  }

  const importCsv = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const [head, ...body] = parseCsv(await file.text())
    if (!head) return toast.error('File khali hai')
    const col = head.map((h) => h.trim().toLowerCase())
    const idx = (n) => col.indexOf(n)
    if (['name', 'type', 'date', 'amount'].some((n) => idx(n) < 0)) {
      return toast.error('CSV mein Name, Type, Date, Amount columns chahiye')
    }
    const get = (r, n) => (r[idx(n)] || '').trim()
    const list = []
    body.forEach((r) => {
      const amount = parseFloat(get(r, 'amount'))
      const date = get(r, 'date')
      const type = get(r, 'type').toLowerCase()
      const name = get(r, 'name')
      if (!name || !(amount > 0) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !['income', 'expense'].includes(type)) return
      const cat = get(r, 'category')
      const acc = accounts.find((a) => a.name.toLowerCase() === get(r, 'account').toLowerCase())
      list.push({
        name, amount, date, type,
        category: CATEGORIES.includes(cat) ? cat : 'Other',
        status: get(r, 'status').toLowerCase() === 'pending' ? 'pending' : 'completed',
        accountId: acc ? acc.id : accounts[0].id,
      })
    })
    if (!list.length) return toast.error('Koi valid row nahi mili (date format YYYY-MM-DD hona chahiye)')
    addMany(list)
    const skipped = body.length - list.length
    toast.success(`${list.length} transactions import hue${skipped ? `, ${skipped} skip` : ''}`)
  }

  return (
    <main className="content">
      <div className="page-head page-head-row">
        <div>
          <h1>Transactions</h1>
          <p>Add, search and manage all your transactions.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ editing: null })}>
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      <div className="card filters">
        <select value={category} onChange={change(setCategory)} aria-label="Category">
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={account} onChange={change(setAccount)} aria-label="Account">
          <option value="all">All accounts</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <input type="date" value={from} onChange={change(setFrom)} aria-label="From date" />
        <input type="date" value={to} onChange={change(setTo)} aria-label="To date" />
        <select value={sort} onChange={change(setSort)} aria-label="Sort">
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="amount-desc">Amount: high to low</option>
          <option value="amount-asc">Amount: low to high</option>
          <option value="name-asc">Name A-Z</option>
        </select>
        {hasFilters && <button className="btn" onClick={clearFilters}>Clear</button>}
      </div>

      <div className="card">
        <div className="card-head">
          <div className="tabs">
            {TABS.map(([k, l]) => (
              <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => { setTab(k); setPage(1) }}>{l}</button>
            ))}
          </div>
          <div className="row-actions">
            <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={importCsv} />
            <button className="btn" onClick={() => fileRef.current?.click()}><Upload size={14} /> Import CSV</button>
            <button className="btn" onClick={exportCsv} disabled={!rows.length}><Download size={14} /> Export CSV</button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Category</th><th>Account</th><th>Date</th><th>Status</th><th>Amount</th><th /></tr>
            </thead>
            <tbody>
              {visible.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td className="muted">{t.category}</td>
                  <td className="muted">{accName[t.accountId] || '-'}</td>
                  <td className="muted">{fmtDate(t.date)}</td>
                  <td>
                    <button className={`badge status-btn ${t.status === 'completed' ? 'done' : 'pending'}`} onClick={() => toggleStatus(t.id)} title="Click to toggle">
                      {t.status === 'completed' ? 'Completed' : 'Pending'}
                    </button>
                  </td>
                  <td className={`amount ${t.type === 'income' ? 'green' : 'red'}`}>{signed(t)}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => setModal({ editing: t })} aria-label="Edit"><Pencil size={14} /></button>
                      <button className="icon-btn danger" onClick={() => handleDelete(t)} aria-label="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan="7" className="empty">No transactions found.</td></tr>}
            </tbody>
          </table>
        </div>

        {rows.length > PAGE_SIZE && (
          <div className="pagination">
            <button className="btn" disabled={current === 1} onClick={() => setPage(current - 1)}>Prev</button>
            <span className="muted">Page {current} of {pages} · {rows.length} results</span>
            <button className="btn" disabled={current === pages} onClick={() => setPage(current + 1)}>Next</button>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal.editing ? 'Edit Transaction' : 'Add Transaction'} onClose={() => setModal(null)}>
          <TransactionForm key={modal.editing?.id || 'new'} editing={modal.editing} onDone={() => setModal(null)} />
        </Modal>
      )}
    </main>
  )
}