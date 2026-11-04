export default function StatCard({ label, value, change, up }) {
  return (
    <div className="card">
      <p className="muted">{label}</p>
      <h3>{value}</h3>
      <span className={up ? 'green' : 'red'}>{change}</span>
    </div>
  )
}