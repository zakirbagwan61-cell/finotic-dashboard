import { money } from '../../utils/format'

export default function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.amount), 1)
  return (
    <div className="card">
      <h3 className="card-title">Monthly Overview</h3>
      <p className="muted">Spending trend for the last 6 months</p>
      <div className="bars">
        {data.map(d => (
          <div key={d.key || d.month} className="bar-col" tabIndex={0} aria-label={`${d.month}: ${money(d.amount)}`}>
            <span className="tooltip">{money(d.amount)}</span>
            <div className="bar" style={{ height: `${Math.max((d.amount / max) * 100, 3)}%` }} />
            <span className="muted">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
