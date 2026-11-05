import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { CATEGORIES } from '../data/finance'
import { useTransactions } from '../context/TransactionsContext'
import { money } from '../utils/format'

export default function Recurring() {
  const { recurring, accounts, addRecurring, removeRecurring } = useTransactions()
  const [f, setF] = useState({
    name: '', amount: '', type: 'expense', category: 'Bills', accountId: accounts[0]?.id, day: '1',
  })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const accName = (id) => accounts.find((a) => a.id === id)?.name || '-'

  const submit = (e) => {
    e.preventDefault()
    const amount = parseFloat(f.amount)
    const day = parseInt(f.day, 10)
    if (!f.name.trim()) return toast.error('Naam likho')
    if (!(amount > 0)) return toast.error('Amount 0 se zyada hona chahiye')
    if (!(day >= 1 && day <= 28)) return toast.error('Din 1 se 28 ke beech rakho')
    addRecurring({ name: f.name.trim(), amount, type: f.type, category: f.category, accountId: f.accountId, day })
    setF({ ...f, name: '', amount: '' })
    toast.success('Recurring rule add ho gaya')
  }

  return (
    <main className="content">
      <div className="page-head">
        <h1>Recurring</h1>
        <p>Rent, Netflix, salary jaise har mahine ke transactions apne aap add hote hain (app kholne par).</p>
      </div>

      <form className="card inline-form" onSubmit={submit}>
        <input placeholder="Name (e.g. Rent)" value={f.name} onChange={set('name')} />
        <input type="number" step="0.01" placeholder="Amount" value={f.amount} onChange={set('amount')} />
        <select value={f.type} onChange={set('type')}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <select value={f.category} onChange={set('category')}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={f.accountId} onChange={set('accountId')}>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <input type="number" min="1" max="28" value={f.day} onChange={set('day')} aria-label="Day of month" title="Mahine ka din (1-28)" />
        <button className="btn btn-primary" type="submit">Add rule</button>
      </form>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Category</th><th>Account</th><th>Day</th><th>Amount</th><th /></tr></thead>
            <tbody>
              {recurring.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td className="muted">{r.category}</td>
                  <td className="muted">{accName(r.accountId)}</td>
                  <td className="muted">Har mahine {r.day}</td>
                  <td className={`amount ${r.type === 'income' ? 'green' : 'red'}`}>{(r.type === 'income' ? '+' : '-') + money(r.amount)}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn danger" onClick={() => removeRecurring(r.id)} aria-label="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!recurring.length && <tr><td colSpan="6" className="empty">Koi recurring rule nahi hai.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}