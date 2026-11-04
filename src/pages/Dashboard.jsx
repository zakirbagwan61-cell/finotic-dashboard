import StatCard from '../components/dashboard/StatCard'
import BarChart from '../components/dashboard/BarChart'
import TransactionTable from '../components/dashboard/TransactionTable'
import { stats, monthly, transactions } from '../data/finance'

export default function Dashboard() {
  return (
    <main className="content">
      <div className="page-head">
        <h1>Dashboard</h1>
        <p>Welcome back, here's your financial overview.</p>
      </div>
      <div className="stats">
        {stats.map(s => <StatCard key={s.id} {...s} />)}
      </div>
      <div className="grid-2">
        <BarChart data={monthly} />
        <TransactionTable rows={transactions} />
      </div>
    </main>
  )
}
