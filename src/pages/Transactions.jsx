import { useMemo, useState } from 'react'
import { Trash2, Download, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import TransactionForm from '../components/TransactionForm'
import { useTransactions } from '../context/TransactionsContext'
import { signed, fmtDate } from '../utils/format'

const TABS = [['all', 'All'], ['income', 'Income'], ['expense', 'Expense']]

export default function Transactions() {
  const { transactions, search, remove, toggleStatus } = useTransactions()
  const [tab, setTab] = useState('all')
  const [editing, setEditing] = useState(null)

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return [...transactions]
      .filter((t) => tab === 'all' || t.type === tab)
      .filter((t) => !q || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions, search, tab])

  const handleDelete = (t) => {
    if (!window.confirm(`Delete "${t.name}"?`)) return
    remove(t.id)
    if (editing?.id === t.id) setEditing(null)
    toast.success('Transaction deleted')
  }

  const handleEdit = (t) => {
    setEditing(t)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const exportCsv = () => {
    const head = 'Name,Category,Type,Date,Status,Amount'
    const body = rows.map((t) => [t.name, t.category, t.type, t.date, t.status, t.amount].map((v) => `"${v}"`).join(','))
    const blob = new Blob([[head, ...body].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'transactions.csv'
    a.click()
    URL.revokeObjectURL(a.href)
    toast.success('CSV exported')
  }

  return (
    <main className="content">
      <div className="page-head">
        <h1>{editing ? 'Edit Transaction' : 'Transactions'}</h1>
        <p>{editing ? `Editing "${editing.name}"` : 'Add, search and manage all your transactions.'}</p>
      </div>

      <TransactionForm
        key={editing ? editing.id : 'new'}
        editing={editing}
        onDone={() => setEditing(null)}
      />

      <div className="card">
        <div className="card-head">
          <div className="tabs">
            {TABS.map(([k, l]) => (
              <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>
          <button className="btn" onClick={exportCsv} disabled={!rows.length}><Download size={14} /> Export CSV</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Category</th><th>Date</th><th>Status</th><th>Amount</th><th /></tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td className="muted">{t.category}</td>
                  <td className="muted">{fmtDate(t.date)}</td>
                  <td>
                    <button className={`badge status-btn ${t.status === 'completed' ? 'done' : 'pending'}`} onClick={() => toggleStatus(t.id)} title="Click to toggle">
                      {t.status === 'completed' ? 'Completed' : 'Pending'}
                    </button>
                  </td>
                  <td className={`amount ${t.type === 'income' ? 'green' : 'red'}`}>{signed(t)}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => handleEdit(t)} aria-label="Edit"><Pencil size={14} /></button>
                      <button className="icon-btn danger" onClick={() => handleDelete(t)} aria-label="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan="6" className="empty">No transactions found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}