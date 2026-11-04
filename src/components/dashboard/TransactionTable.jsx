import { Link } from 'react-router-dom'
import { signed, fmtDate } from '../../utils/format'

export default function TransactionTable({ rows }) {
  return (
    <div className="card">
      <div className="card-head">
        <h3 className="card-title">Recent Transactions</h3>
        <Link to="/transactions" className="link">View all</Link>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Date</th><th>Status</th><th>Amount</th></tr>
          </thead>
          <tbody>
            {rows.map(t => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td className="muted">{fmtDate(t.date)}</td>
                <td>
                  <span className={`badge ${t.status === 'pending' ? 'pending' : 'done'}`}>
                    {t.status === 'pending' ? 'Pending' : 'Completed'}
                  </span>
                </td>
                <td className={`amount ${t.type === 'income' ? 'green' : 'red'}`}>{signed(t)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="4" className="empty">No transactions yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
