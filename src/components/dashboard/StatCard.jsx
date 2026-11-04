import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const icons = { 1: Wallet, 2: TrendingUp, 3: TrendingDown, 4: PiggyBank }

export default function StatCard({ id, label, value, change, up }) {
  const Icon = icons[id] || Wallet
  const Arrow = up ? ArrowUpRight : ArrowDownRight
  return (
    <div className="card stat">
      <div className="stat-top">
        <p className="muted">{label}</p>
        <div className="stat-icon"><Icon size={18} /></div>
      </div>
      <h3 className="stat-value">{value}</h3>
      <span className={`badge ${up ? 'up' : 'down'}`}>
        <Arrow size={12} /> {change}
      </span>
    </div>
  )
}
