import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'
import StatCard from '../components/dashboard/StatCard'
import BarChart from '../components/dashboard/BarChart'
import TransactionTable from '../components/dashboard/TransactionTable'
import { useTransactions } from '../context/TransactionsContext'
import AnimatedMoney from '../components/AnimatedMoney'

<StatCard icon={Wallet} label="Total Balance" value={<AnimatedMoney value={stats.balance} />} change={balanceNote} up />
<StatCard icon={TrendingUp} label="Income" value={<AnimatedMoney value={stats.income} />} change={`${stats.incomeCount} transactions`} up />
<StatCard icon={TrendingDown} label="Expenses" value={<AnimatedMoney value={stats.expense} />} change={`${stats.expenseCount} transactions`} up={false} />
<StatCard icon={PiggyBank} label="Savings" value={<AnimatedMoney value={stats.savings} />} change={`${stats.savingsRate}% of income`} up />

export default function Dashboard() {
  const { transactions, stats, monthly, settings } = useTransactions()
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  const balanceNote = stats.pendingCount
    ? `${stats.pendingCount} pending ${settings.countPending ? 'included' : 'not counted'}`
    : 'Live balance'

  return (
    <main className="content">
      <div className="page-head">
        <h1>Dashboard</h1>
        <p>Welcome back, here's your financial overview.</p>
      </div>
      <div className="stats">
        <StatCard icon={Wallet} label="Total Balance" value={money(stats.balance)} change={balanceNote} up />
        <StatCard icon={TrendingUp} label="Income" value={money(stats.income)} change={`${stats.incomeCount} transactions`} up />
        <StatCard icon={TrendingDown} label="Expenses" value={money(stats.expense)} change={`${stats.expenseCount} transactions`} up={false} />
        <StatCard icon={PiggyBank} label="Savings" value={money(stats.savings)} change={`${stats.savingsRate}% of income`} up />
      </div>
      <div className="grid-2">
        <BarChart data={monthly} />
        <TransactionTable rows={recent} />
      </div>
    </main>
  )
}