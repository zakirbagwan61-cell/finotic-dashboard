import { useState } from 'react'
import { Plus, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { CATEGORIES } from '../data/finance'
import { useTransactions } from '../context/TransactionsContext'

const today = () => new Date().toISOString().slice(0, 10)
const blank = () => ({ name: '', amount: '', type: 'expense', category: 'Food', date: today() })

export default function TransactionForm({ editing, onDone }) {
  const { add, update } = useTransactions()
  const [f, setF] = useState(
    editing
      ? { name: editing.name, amount: String(editing.amount), type: editing.type, category: editing.category, date: editing.date }
      : blank()
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
    const data = { ...f, name: f.name.trim(), amount: parseFloat(f.amount) }
    if (editing) {
      update(editing.id, data)
      toast.success('Transaction updated')
      onDone?.()
    } else {
      add({ ...data, status: 'completed' })
      toast.success('Transaction added')
      setF(blank())
    }
  }

  return (
    <form className="card form-grid" onSubmit={submit} noValidate>
      <input className={errors.name ? 'invalid' : ''} placeholder="Name (e.g. Coffee)" value={f.name} onChange={set('name')} />
      <input className={errors.amount ? 'invalid' : ''} type="number" step="0.01" placeholder="Amount" value={f.amount} onChange={set('amount')} />
      <select value={f.type} onChange={set('type')}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <select value={f.category} onChange={set('category')}>
        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
      </select>
      <input className={errors.date ? 'invalid' : ''} type="date" value={f.date} onChange={set('date')} />
      <div className="form-actions">
        <button className="btn btn-primary" type="submit">
          {editing ? <><Save size={16} /> Save</> : <><Plus size={16} /> Add</>}
        </button>
        {editing && (
          <button className="btn" type="button" onClick={onDone}><X size={16} /> Cancel</button>
        )}
      </div>
      {Object.values(errors).length > 0 && (
        <p className="form-error">{Object.values(errors).join(' · ')}</p>
      )}
    </form>
  )
}