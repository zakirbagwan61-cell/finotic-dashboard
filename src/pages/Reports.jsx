import { useMemo } from 'react'
import { useTransactions } from '../context/TransactionsContext'
import { money } from '../utils/format'

export default function Reports() {
  const { transactions, stats } = useTransactions()

  const byCat = useMemo(() => {
    const map = {}
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [transactions])

  const total = byCat.reduce((s, [, v]) => s + v, 0) || 1

  return (
    <main className="content">
      <div className="page-head">
        <h1>Reports</h1>
        <p>Where your money goes.</p>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Summary</h3>
          <ul className="list">
            <li><span>Total income</span><b className="green">{money(stats.income)}</b></li>
            <li><span>Total expenses</span><b className="red">{money(stats.expense)}</b></li>
            <li><span>Net savings</span><b>{money(stats.savings)}</b></li>
            <li><span>Savings rate</span><b>{stats.savingsRate}%</b></li>
          </ul>
        </div>
        <div className="card">
          <h3 className="card-title">Spending by category</h3>
          <div className="cat-list">
            {byCat.map(([cat, val]) => (
              <div key={cat}>
                <div className="cat-row"><span>{cat}</span><span className="muted">{money(val)} · {Math.round((val / total) * 100)}%</span></div>
                <div className="progress"><div style={{ width: `${(val / total) * 100}%` }} /></div>
              </div>
            ))}
            {!byCat.length && <p className="empty">No expenses yet.</p>}
          </div>
        </div>
      </div>
    </main>
  )
}
