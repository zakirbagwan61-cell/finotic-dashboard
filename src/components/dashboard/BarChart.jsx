export default function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.amount))
  return (
    <div className="card">
      <h3 className="card-title">Monthly Overview</h3>
      <p className="muted">Spending trend for the last 6 months</p>
      <div className="bars">
        {data.map(d => (
          <div key={d.month} className="bar-col" tabIndex={0} aria-label={`${d.month}: ${d.amount}`}>
            <span className="tooltip">{d.amount}</span>
            <div className="bar" style={{ height: `${(d.amount / max) * 100}%` }} />
            <span className="muted">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
