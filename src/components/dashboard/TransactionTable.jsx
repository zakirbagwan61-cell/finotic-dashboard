export default function TransactionTable({ rows }) {
  return (
    <div className="card">
      <h3>Recent Transactions</h3>
      <table>
        <thead>
          <tr><th>Name</th><th>Date</th><th>Status</th><th>Amount</th></tr>
        </thead>
        <tbody>
          {rows.map(t => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.date}</td>
              <td>{t.status}</td>
              <td className={t.amount > 0 ? 'green' : 'red'}>
                {t.amount > 0 ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}