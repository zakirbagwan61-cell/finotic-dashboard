import { Landmark, PiggyBank, CreditCard } from 'lucide-react'
import { useTransactions } from '../context/TransactionsContext'
import { money } from '../utils/format'

export default function Accounts() {
  const { stats } = useTransactions()
  const accounts = [
    { name: 'Main Checking', icon: Landmark, balance: stats.balance - stats.savings, note: 'Everyday spending' },
    { name: 'Savings', icon: PiggyBank, balance: stats.savings, note: `${stats.savingsRate}% of income saved` },
    { name: 'Credit Card', icon: CreditCard, balance: -stats.expense * 0.1, note: 'Estimated due this month' },
  ]
  return (
    <main className="content">
      <div className="page-head">
        <h1>Accounts</h1>
        <p>Your accounts and their current balances.</p>
      </div>
      <section className="stats">
        {accounts.map(({ name, icon: Icon, balance, note }) => (
          <div className="card stat" key={name}>
            <div className="stat-top">
              <span className="muted">{name}</span>
              <div className="stat-icon"><Icon size={18} /></div>
            </div>
            <div className="stat-value">{money(balance)}</div>
            <span className="muted">{note}</span>
          </div>
        ))}
      </section>
    </main>
  )
}
