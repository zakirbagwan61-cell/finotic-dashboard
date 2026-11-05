import { useMemo, useRef, useState } from 'react'
import { Trash2, Download, Upload, Pencil, Plus, Inbox } from 'lucide-react'
import toast from 'react-hot-toast'
import TransactionDrawer from '../components/TransactionDrawer'
import CategoryBadge from '../components/CategoryBadge'
import EmptyState from '../components/EmptyState'
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
  const {
    transactions, accounts, search, setSearch, remove, removeMany, updateMany,
    restore, toggleStatus, addMany, setTxModal,
  } = useTransactions()
  const [tab, setTab] = useState('all')
  const [category, setCategory] = useState('all')
  const [account, setAccount] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState('date-desc')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState([])
  const [viewId, setViewId] = useState(null)
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
      .filter(
        (t) =>
          !q ||
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.note || '').toLowerCase().includes(q) ||
          (t.tags || []).some((g) => g.toLowerCase().includes(q))
      )
      .sort(SORTS[sort])
  }, [transactions, search, tab, category, account, from, to, sort])

  const pages = Math.max(Math.ceil(rows.length / PAGE_SIZE), 1)
  const current = Math.min(page, pages)
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  // Bulk actions only touch selected rows that are still visible under the current filters
  const selRows = rows.filter((t) => selected.includes(t.id))
  const selIds = selRows.map((t) => t.id)
  const allVisibleSelected = visible.length > 0 && visible.every((t) => selected.includes(t.id))

  const viewed = transactions.find((t) => t.id === viewId)

  const change = (setter) => (e) => { setter(e.target.value); setPage(1); setSelected([]) }
  const hasFilters = category !== 'all' || account !== 'all' || from || to
  const clearFilters = () => { setCategory('all'); setAccount('all'); setFrom(''); setTo(''); setPage(1); setSelected([]) }

  const toggleOne = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const toggleAll = () =>
    setSelected((s) =>
      allVisibleSelected
        ? s.filter((id) => !visible.some((t) => t.id === id))
        : [...new Set([...s, ...visible.map((t) => t.id)])]
    )

  const undoToast = (label, items) =>
    toast(
      (t) => (
        <span className="undo-toast">
          {label}
          <button className="link" onClick={() => { restore(items); toast.dismiss(t.id) }}>Undo</button>
        </span>
      ),
      { duration: 6000 }
    )

  const handleDelete = (t) => {
    remove(t.id)
    setSelected((s) => s.filter((id) => id !== t.id))
    if (viewId === t.id) setViewId(null)
    undoToast('Transaction deleted', [t])
  }

  const bulkDelete = () => {
    const items = selRows
    removeMany(selIds)
    setSelected([])
    undoToast(`${items.length} transactions deleted`, items)
  }
  const bulkStatus = (status) => {
    updateMany(selIds, { status })
    toast.success(`${selIds.length} marked ${status}`)
    setSelected([])
  }
  const bulkCategory = (e) => {
    const c = e.target.value
    if (!c) return
    updateMany(selIds, { category: c })
    toast.success(`${selIds.length} moved to ${c}`)
    setSelected([])
  }

  const exportCsv = () => {
    const q = (v) => `"${String(v).replace(/"/g, '""')}"`
    const head = 'Name,Category,Type,Date,Status,Amount,Account,Note,Tags'
    const body = rows.map((t) =>
      [t.name, t.category, t.type, t.date, t.status, t.amount, accName[t.accountId] || '', t.note || '', (t.tags || []).join(';')]
        .map(q).join(',')
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
    if (!head) return toast.error('The file is empty')
    const col = head.map((h) => h.trim().toLowerCase())
    const idx = (n) => col.indexOf(n)
    if (['name', 'type', 'date', 'amount'].some((n) => idx(n) < 0)) {
      return toast.error('CSV must include Name, Type, Date and Amount columns')
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
        note: get(r, 'note'),
        tags: get(r, 'tags').split(';').map((s) => s.trim()).filter(Boolean),
      })
    })
    if (!list.length) return toast.error('No valid rows found (date format must be YYYY-MM-DD)')
    addMany(list)
    const skipped = body.length - list.length
    toast.success(`${list.length} transactions imported${skipped ? `, ${skipped} skipped` : ''}`)
  }

  return (
    <main className="content">
      <div className="page-head page-head-row">
        <div>
          <h1>Transactions</h1>
          <p>Add, search and manage all your transactions.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setTxModal({ editing: null })}>
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
              <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => { setTab(k); setPage(1); setSelected([]) }}>{l}</button>
            ))}
          </div>
          <div className="row-actions">
            <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={importCsv} />
            <button className="btn" onClick={() => fileRef.current?.click()}><Upload size={14} /> Import CSV</button>
            <button className="btn" onClick={exportCsv} disabled={!rows.length}><Download size={14} /> Export CSV</button>
          </div>
        </div>

        {selRows.length > 0 && (
          <div className="bulk-bar">
            <b>{selRows.length} selected</b>
            <button className="btn" onClick={() => bulkStatus('completed')}>Mark completed</button>
            <button className="btn" onClick={() => bulkStatus('pending')}>Mark pending</button>
            <select className="text-input" value="" onChange={bulkCategory} aria-label="Change category">
              <option value="">Change category...</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <button className="btn btn-danger" onClick={bulkDelete}><Trash2 size={14} /> Delete</button>
            <button className="btn" onClick={() => setSelected([])}>Clear</button>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="check-col">
                  <input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} aria-label="Select all on this page" />
                </th>
                <th>Name</th><th>Category</th><th>Account</th><th>Date</th><th>Status</th><th>Amount</th><th />
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => (
                <tr key={t.id} className="clickable" onClick={() => setViewId(t.id)}>
                  <td className="check-col" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggleOne(t.id)} aria-label={`Select ${t.name}`} />
                  </td>
                  <td>
                    <div className="name-cell">
                      <span>{t.name}</span>
                      {(t.tags || []).slice(0, 2).map((g) => <span key={g} className="tag">#{g}</span>)}
                    </div>
                  </td>
                  <td><CategoryBadge category={t.category} /></td>
                  <td className="muted">{accName[t.accountId] || '-'}</td>
                  <td className="muted">{fmtDate(t.date)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button className={`badge status-btn ${t.status === 'completed' ? 'done' : 'pending'}`} onClick={() => toggleStatus(t.id)} title="Click to toggle">
                      {t.status === 'completed' ? 'Completed' : 'Pending'}
                    </button>
                  </td>
                  <td className={`amount ${t.type === 'income' ? 'green' : 'red'}`}>{signed(t)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => setTxModal({ editing: t })} aria-label="Edit"><Pencil size={14} /></button>
                      <button className="icon-btn danger" onClick={() => handleDelete(t)} aria-label="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan="8">
                    <EmptyState
                      icon={Inbox}
                      title="No transactions found"
                      text="Try changing your filters, or add a new transaction."
                      action={<button className="btn btn-primary" onClick={() => setTxModal({ editing: null })}><Plus size={14} /> Add Transaction</button>}
                    />
                  </td>
                </tr>
              )}
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

      {viewed && (
        <TransactionDrawer
          tx={viewed}
          onClose={() => setViewId(null)}
          onEdit={() => { setTxModal({ editing: viewed }); setViewId(null) }}
          onDelete={() => handleDelete(viewed)}
          onTag={(tag) => { setSearch(tag); setViewId(null) }}
        />
      )}
    </main>
  )
}