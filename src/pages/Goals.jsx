import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTransactions } from '../context/TransactionsContext'
import { money } from '../utils/format'

function GoalCard({ goal }) {
  const { fundGoal, removeGoal } = useTransactions()
  const [amt, setAmt] = useState('')
  const pct = Math.min(Math.round((goal.saved / goal.target) * 100), 100)
  const done = goal.saved >= goal.target

  const fund = (e) => {
    e.preventDefault()
    const v = parseFloat(amt)
    if (!(v > 0)) return toast.error('Amount 0 se zyada hona chahiye')
    fundGoal(goal.id, v)
    setAmt('')
    toast.success(`${money(v)} add ho gaye`)
  }

  return (
    <div className="card">
      <div className="card-head">
        <h3 className="card-title">{goal.name}</h3>
        {done ? <span className="badge done">Completed</span> : <span className="badge pending">{pct}%</span>}
      </div>
      <p className="muted goal-amount">{money(goal.saved)} of {money(goal.target)}</p>
      <div className="progress"><div className={done ? '' : 'warn'} style={{ width: `${pct}%` }} /></div>
      <form className="inline-form goal-fund" onSubmit={fund}>
        <input type="number" step="0.01" placeholder="Add funds" value={amt} onChange={(e) => setAmt(e.target.value)} />
        <button className="btn" type="submit">Add</button>
        <button className="icon-btn danger" type="button" aria-label="Delete goal"
          onClick={() => window.confirm(`Delete "${goal.name}"?`) && removeGoal(goal.id)}>
          <Trash2 size={14} />
        </button>
      </form>
    </div>
  )
}

export default function Goals() {
  const { goals, addGoal } = useTransactions()
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [saved, setSaved] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const t = parseFloat(target)
    const s = parseFloat(saved) || 0
    if (!name.trim()) return toast.error('Goal ka naam likho')
    if (!(t > 0)) return toast.error('Target 0 se zyada hona chahiye')
    addGoal({ name: name.trim(), target: t, saved: Math.max(s, 0) })
    setName(''); setTarget(''); setSaved('')
    toast.success('Goal added')
  }

  return (
    <main className="content">
      <div className="page-head">
        <h1>Savings Goals</h1>
        <p>Apne goals set karo aur progress track karo.</p>
      </div>

      <form className="card inline-form" onSubmit={submit}>
        <input placeholder="Goal name (e.g. New Phone)" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="number" step="0.01" placeholder="Target amount" value={target} onChange={(e) => setTarget(e.target.value)} />
        <input type="number" step="0.01" placeholder="Already saved (optional)" value={saved} onChange={(e) => setSaved(e.target.value)} />
        <button className="btn btn-primary" type="submit">Add goal</button>
      </form>

      <div className="goal-grid">
        {goals.map((g) => <GoalCard key={g.id} goal={g} />)}
        {!goals.length && <p className="empty">Abhi koi goal nahi hai.</p>}
      </div>
    </main>
  )
}