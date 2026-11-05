import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react'
import StatCard from '../components/dashboard/StatCard'
import AreaChart from '../components/dashboard/AreaChart'
import Sparkline from '../components/dashboard/Sparkline'
import TransactionTable from '../components/dashboard/TransactionTable'
import AnimatedMoney from '../components/AnimatedMoney'
import { useTransactions } from '../context/TransactionsContext'
import { buildInsights } from '../utils/insights'
import { money, fmtDate, toISODate } from '../utils/format'

export default function Dashboard() {
  const { transactions, counted, stats, monthly, settings, budgetUsage, goals, recurring } = useTransactions()
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  const balanceNote = stats.pendingCount
    ? `${stats.pendingCount} pending ${settings.countPending ? 'included' : 'not counted'}`
    : 'All transactions counted'

  // Balance at the end of each of the last 6 months (worked out backwards from today's balance)
  const series = useMemo(() => {
    const out = []
    let b = stats.balance
    for (let i = monthly.length - 1; i >= 0; i--) {
      out.unshift(b)
      b -= monthly[i].income - monthly[i].amount
    }
    return out
  }, [monthly, stats.balance])

  const prevBalance = series[series.length - 2]
  const change = series[series.length - 1] - prevBalance
  const changePct = prevBalance ? Math.round((change / Math.abs(prevBalance)) * 100) : 0
  const up = change >= 0

  const insights = useMemo(() => buildInsights(counted, stats.pendingCount), [counted, stats.pendingCount])
  const topBudgets = [...budgetUsage].sort((a, b) => b.pct - a.pct).slice(0, 3)

  const upcoming = useMemo(() => {
    const now = new Date()
    const today = now.getDate()
    return recurring
      .map((r) => {
        const d = r.day > today
          ? new Date(now.getFullYear(), now.getMonth(), r.day)
          : new Date(now.getFullYear(), now.getMonth() + 1, r.day)
        return { ...r, date: toISODate(d) }
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4)
  }, [recurring])

  return (
    <main className="content">
      <div className="page-head">
        <h1>Dashboard</h1>
        <p>Welcome back, {settings.name || 'there'}. Here's your financial overview.</p>
      </div>

      <section className="card hero">
        <div className="hero-main">
          <p className="hero-label">Total Balance</p>
          <h2 className="hero-value"><AnimatedMoney value={stats.balance} /></h2>
          <span className="badge">
            {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {up ? '+' : ''}{changePct}% vs last month
          </span>
          <p className="hero-note">{balanceNote}</p>
        </div>
        <Sparkline values={series} />
      </section>

      <div className="stats">
        <StatCard icon={TrendingUp} label="Income" value={<AnimatedMoney value={stats.income} />} change={`${stats.incomeCount} transactions`} up />
        <StatCard icon={TrendingDown} label="Expenses" value={<AnimatedMoney value={stats.expense} />} change={`${stats.expenseCount} transactions`} up={false} />
        <StatCard icon={PiggyBank} label="Savings" value={<AnimatedMoney value={stats.savings} />} change={`${stats.savingsRate}% of income`} up />
      </div>

      <div className="grid-2">
        <AreaChart data={monthly} />
        <TransactionTable rows={recent} />
      </div>

      <div className="grid-4">
        <div className="card widget">
          <div className="card-head"><h3 className="card-title"><Sparkles size={15} /> Insights</h3></div>
          <ul className="insights">
            {insights.map((i, k) => <li key={k} className={i.tone}>{i.text}</li>)}
            {!insights.length && <li className="info">Add a few transactions to see insights here.</li>}
          </ul>
        </div>

        <div className="card widget">
          <div className="card-head">
            <h3 className="card-title">Budgets</h3>
            <Link to="/budgets" className="link">Manage</Link>
          </div>
          <div className="cat-list">
            {topBudgets.map((b) => (
              <div key={b.id}>
                <div className="cat-row"><span>{b.category}</span><span className="muted">{b.pct}%</span></div>
                <div className="progress">
                  <div className={b.pct >= 100 ? 'over' : b.pct >= 80 ? 'warn' : ''} style={{ width: `${Math.min(b.pct, 100)}%` }} />
                </div>
              </div>
            ))}
            {!topBudgets.length && <p className="muted">No budgets yet.</p>}
          </div>
        </div>

        <div className="card widget">
          <div className="card-head">
            <h3 className="card-title">Goals</h3>
            <Link to="/goals" className="link">Manage</Link>
          </div>
          <div className="cat-list">
            {goals.slice(0, 3).map((g) => {
              const pct = Math.min(Math.round((g.saved / g.target) * 100), 100)
              return (
                <div key={g.id}>
                  <div className="cat-row"><span>{g.name}</span><span className="muted">{pct}%</span></div>
                  <div className="progress"><div className={pct >= 100 ? '' : 'warn'} style={{ width: `${pct}%` }} /></div>
                </div>
              )
            })}
            {!goals.length && <p className="muted">No goals yet.</p>}
          </div>
        </div>

        <div className="card widget">
          <div className="card-head">
            <h3 className="card-title">Upcoming</h3>
            <Link to="/recurring" className="link">Manage</Link>
          </div>
          <ul className="list compact">
            {upcoming.map((r) => (
              <li key={r.id}>
                <span>{r.name}<br /><small className="muted">{fmtDate(r.date)}</small></span>
                <b className={r.type === 'income' ? 'green' : 'red'}>{(r.type === 'income' ? '+' : '-') + money(r.amount)}</b>
              </li>
            ))}
            {!upcoming.length && <li className="muted">No recurring rules yet.</li>}
          </ul>
        </div>
      </div>
    </main>
  )
}