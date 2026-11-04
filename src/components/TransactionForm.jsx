import { useState } from 'react'
import { Plus } from 'lucide-react'
import { CATEGORIES } from '../data/finance'
import { useTransactions } from '../context/TransactionsContext'

const today = () => new Date().toISOString().slice(0, 10)
const empty = { name: '', amount: '', type: 'expense', category: 'Food', date: today() }

export default function TransactionForm() {
  const { add } = useTransactions()
  const [f, setF] = useState(empty)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    const amount = parseFloat(f.amount)
    if (!f.name.trim() || !(amount > 0)) return
    add({ ...f, name: f.name.trim(), amount, status: 'completed' })
    setF({ ...empty, date: today() })
  }

  return (
    <form className="card form-grid" onSubmit={submit}>
      <input placeholder="Name (e.g. Coffee)" value={f.name} onChange={set('name')} required />
      <input type="number" step="0.01" min="0.01" placeholder="Amount" value={f.amount} onChange={set('amount')} required />
      <select value={f.type} onChange={set('type')}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <select value={f.category} onChange={set('category')}>
        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
      </select>
      <input type="date" value={f.date} onChange={set('date')} required />
      <button className="btn btn-primary" type="submit"><Plus size={16} /> Add</button>
    </form>
  )
}
