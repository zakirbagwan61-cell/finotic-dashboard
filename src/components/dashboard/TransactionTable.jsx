const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

const formatDate = iso =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export default function TransactionTable({ rows }) {
  return (
    <div className="card">
      <h3 className="card-title">Recent Transactions</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Date</th><th>Status</th><th>Amount</th></tr>
          </thead>
          <tbody>
            {rows.map(t => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td className="muted">{formatDate(t.date)}</td>
                <td>
                  <span className={`badge ${t.status === 'Pending' ? 'pending' : 'done'}`}>
                    {t.status}
                  </span>
                </td>
                <td className={`amount ${t.amount > 0 ? 'green' : 'red'}`}>
                  {t.amount > 0 ? '+' : '-'}{money.format(Math.abs(t.amount))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
