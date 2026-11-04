import { useTransactions } from '../context/TransactionsContext'

export default function Settings({ theme, onToggleTheme }) {
  const { resetDemo, clearAll } = useTransactions()
  return (
    <main className="content">
      <div className="page-head">
        <h1>Settings</h1>
        <p>Manage appearance and your data.</p>
      </div>
      <div className="card">
        <ul className="list">
          <li>
            <span>Theme: <b>{theme}</b></span>
            <button className="btn" onClick={onToggleTheme}>Switch to {theme === 'dark' ? 'light' : 'dark'}</button>
          </li>
          <li>
            <span>Reset to demo data</span>
            <button className="btn" onClick={() => confirm('Reset to demo data?') && resetDemo()}>Reset</button>
          </li>
          <li>
            <span>Delete all transactions</span>
            <button className="btn btn-danger" onClick={() => confirm('Delete everything?') && clearAll()}>Clear all</button>
          </li>
        </ul>
      </div>
    </main>
  )
}
