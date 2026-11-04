export default function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.amount))
  return (
    <div className="card">
      <h3>Monthly Overview</h3>
      <div className="bars">
        {data.map(d => (
          <div key={d.month} className="bar-col">
            <div className="bar" style={{ height: `${(d.amount / max) * 100}%` }} />
            <span className="muted">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  )
}