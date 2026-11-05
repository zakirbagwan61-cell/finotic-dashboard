import { useState } from 'react'
import { Plus, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { CATEGORIES } from '../data/finance'
import { useTransactions } from '../context/TransactionsContext'
import { toISODate } from '../utils/format'

const blank = (accountId) => ({
  name: '', amount: '', type: 'expense', category: 'Food',
  accountId, date: toISODate(), status: 'completed', tags: '', note: '',
})

export default function TransactionForm({ editing, onDone }) {
  const { add, update, accounts } = useTransactions()
  const [f, setF] = useState(() =>
    editing
      ? {
          name: editing.name, amount: String(editing.amount), type: editing.type,
          category: editing.category, accountId: editing.accountId,
          date: editing.date, status: editing.status,
          tags: (editing.tags || []).join(', '), note: editing.note || '',
        }
      : blank(accounts[0]?.id)
  )
  const [errors, setErrors] = useState({})
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const validate = () => {
    const e = {}
    if (!f.name.trim()) e.name = 'Name is required'
    if (!(parseFloat(f.amount) > 0)) e.amount = 'Amount must be greater than 0'
    if (!f.date) e.date = 'Date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const data = {
      ...f,
      name: f.name.trim(),
      amount: parseFloat(f.amount),
      note: f.note.trim(),
      tags: f.tags.split(',').map((s) => s.trim().replace(/^#/, '')).filter(Boolean),
    }
    if (editing) {
      update(editing.id, data)
      toast.success('Transaction updated')
    } else {
      add(data)
      toast.success('Transaction added')
    }
    onDone?.()
  }

  return (
    <form className="modal-form" onSubmit={submit} noValidate>
      <label className="full">Name
        <input className={errors.name ? 'invalid' : ''} placeholder="e.g. Coffee" value={f.name} onChange={set('name')} autoFocus />
      </label>
      <label>Amount
        <input className={errors.amount ? 'invalid' : ''} type="number" step="0.01" placeholder="0.00" value={f.amount} onChange={set('amount')} />
      </label>
      <label>Type
        <select value={f.type} onChange={set('type')}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </label>
      <label>Category
        <select value={f.category} onChange={set('category')}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label>Account
        <select value={f.accountId} onChange={set('accountId')}>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </label>
      <label>Date
        <input className={errors.date ? 'invalid' : ''} type="date" value={f.date} onChange={set('date')} />
      </label>
      <label>Status
        <select value={f.status} onChange={set('status')}>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </label>
      <label className="full">Tags (comma separated)
        <input placeholder="e.g. trip, work" value={f.tags} onChange={set('tags')} />
      </label>
      <label className="full">Notes
        <textarea rows="3" placeholder="Anything to remember about this transaction" value={f.note} onChange={set('note')} />
      </label>
      {Object.values(errors).length > 0 && (
        <p className="form-error">{Object.values(errors).join(' · ')}</p>
      )}
      <div className="form-actions full">
        <button className="btn btn-primary" type="submit">
          {editing ? <><Save size={16} /> Save</> : <><Plus size={16} /> Add</>}
        </button>
        <button className="btn" type="button" onClick={onDone}><X size={16} /> Cancel</button>
      </div>
    </form>
  )
}