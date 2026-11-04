import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function StatCard({ icon: Icon, label, value, change, up }) {
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
