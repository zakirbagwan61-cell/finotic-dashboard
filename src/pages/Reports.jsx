import { useMemo, useState } from 'react'
import { Printer } from 'lucide-react'
import { useTransactions } from '../context/TransactionsContext'
import { money, monthKey } from '../utils/format'

const COLORS = ['#4f46e5', '#12a150', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#ec4899', '#64748b']

function Donut({ data, total }) {
  const r = 52
  const c = 2 * Math.PI * r
  const segs = data.reduce(
    (acc, [cat, val], i) => {
      const len = (val / total) * c
      acc.list.push({ cat, len, offset: acc.sum, color: COLORS[i % COLORS.length] })
      acc.sum += len
      return acc
    },
    { list: [], sum: 0 }
  ).list

  return (
    <svg viewBox="0 0 140 140" className="donut" role="img" aria-label="Spending by category">
      <g transform="rotate(-90 70 70)">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="22" />
        {segs.map((s) => (
          <circle
            key={s.cat} cx="70" cy="70" r={r} fill="none" stroke={s.color} strokeWidth="22"
            strokeDasharray={`${s.len} ${c - s.len}`} strokeDashoffset={-s.offset}
          />
        ))}
      </g>
    </svg>
  )
}

function IncomeExpense({ data }) {
  const max = Math.max(...data.flatMap((d) => [d.income, d.amount]), 1)
  return (
    <div className="bars">
      {data.map((d) => (
        <div key={d.key} className="bar-col" tabIndex={0} aria-label={`${d.month}: income ${money(d.income)}, expenses ${money(d.amount)}`}>
          <span className="tooltip">In {money(d.income)} · Out {money(d.amount)}</span>
          <div className="pair">
            <div className="bar income" style={{ height: `${Math.max((d.income / max) * 100, 3)}%` }} />
            <div className="bar expense" style={{ height: `${Math.max((d.amount / max) * 100, 3)}%` }} />
          </div>
          <span className="muted">{d.month}</span>
        </div>
      ))}
    </div>
  )
}

export default function Reports() {
  const { counted, monthly } = useTransactions()
  const [period, setPeriod] = useState('all')

  const months = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      return { key: monthKey(d), label: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }) }
    })
  }, [])

  const scoped = useMemo(
    () => (period === 'all' ? counted : counted.filter((t) => t.date.startsWith(period))),
    [counted, period]
  )

  const income = scoped.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = scoped.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const net = income - expense
  const rate = income ? Math.round((Math.max(net, 0) / income) * 100) : 0

  const byCat = useMemo(() => {
    const map = {}
    scoped.filter((t) => t.type === 'expense').forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [scoped])

  const total = byCat.reduce((s, [, v]) => s + v, 0) || 1

  return (
    <main className="content">
      <div className="page-head page-head-row">
        <div>
          <h1>Reports</h1>
          <p>Where your money goes.</p>
        </div>
        <div className="row-actions no-print">
          <select className="text-input" value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Period">
            <option value="all">All time</option>
            {months.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
          <button className="btn" onClick={() => window.print()}><Printer size={14} /> Print / Save PDF</button>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Summary</h3>
          <ul className="list">
            <li><span>Total income</span><b className="green">{money(income)}</b></li>
            <li><span>Total expenses</span><b className="red">{money(expense)}</b></li>
            <li><span>Net</span><b className={net < 0 ? 'red' : ''}>{money(net)}</b></li>
            <li><span>Savings rate</span><b>{rate}%</b></li>
          </ul>
        </div>

        <div className="card">
          <h3 className="card-title">Spending by category</h3>
          {byCat.length > 0 ? (
            <div className="donut-wrap">
              <Donut data={byCat} total={total} />
              <div className="cat-list">
                {byCat.map(([cat, val], i) => (
                  <div key={cat}>
                    <div className="cat-row">
                      <span><i className="dot" style={{ background: COLORS[i % COLORS.length] }} />{cat}</span>
                      <span className="muted">{money(val)} · {Math.round((val / total) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="empty">No expenses yet.</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="card-title">Income vs Expenses</h3>
          <span className="muted"><i className="dot" style={{ background: 'var(--green)' }} />Income <i className="dot" style={{ background: 'var(--red)' }} />Expenses · last 6 months</span>
        </div>
        <IncomeExpense data={monthly} />
      </div>
    </main>
  )
}