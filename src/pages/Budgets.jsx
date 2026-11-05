import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { CATEGORIES } from '../data/finance'
import { useTransactions } from '../context/TransactionsContext'
import { money } from '../utils/format'

const EXPENSE_CATS = CATEGORIES.filter((c) => !['Salary', 'Freelance'].includes(c))

export default function Budgets() {
  const { budgetUsage, setBudget, removeBudget } = useTransactions()
  const [category, setCategory] = useState(EXPENSE_CATS[0])
  const [limit, setLimit] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const v = parseFloat(limit)
    if (!(v > 0)) return toast.error('Limit 0 se zyada honi chahiye')
    setBudget(category, v)
    setLimit('')
    toast.success('Budget saved')
  }

  return (
    <main className="content">
      <div className="page-head">
        <h1>Budgets</h1>
        <p>Is mahine ki category-wise spending limits.</p>
      </div>

      <form className="card inline-form" onSubmit={submit}>
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          {EXPENSE_CATS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input type="number" step="0.01" placeholder="Monthly limit" value={limit} onChange={(e) => setLimit(e.target.value)} />
        <button className="btn btn-primary" type="submit">Set budget</button>
      </form>

      <div className="card">
        <div className="cat-list">
          {budgetUsage.map((b) => (
            <div key={b.id}>
              <div className="cat-row">
                <span>{b.category}</span>
                <span className="muted">
                  {money(b.spent)} / {money(b.limit)} · {b.pct}%
                  <button className="icon-btn danger inline-icon" onClick={() => removeBudget(b.id)} aria-label={`Remove ${b.category} budget`}><Trash2 size={13} /></button>
                </span>
              </div>
              <div className="progress">
                <div className={b.pct >= 100 ? 'over' : b.pct >= 80 ? 'warn' : ''} style={{ width: `${Math.min(b.pct, 100)}%` }} />
              </div>
            </div>
          ))}
          {!budgetUsage.length && <p className="empty">Koi budget set nahi hai.</p>}
        </div>
      </div>
    </main>
  )
}