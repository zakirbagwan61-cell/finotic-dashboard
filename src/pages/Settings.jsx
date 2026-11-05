import toast from 'react-hot-toast'
import { useTransactions } from '../context/TransactionsContext'
import { CURRENCIES } from '../utils/format'

export default function Settings({ theme, onToggleTheme }) {
  const { settings, updateSettings, resetDemo, clearAll } = useTransactions()

  return (
    <main className="content">
      <div className="page-head">
        <h1>Settings</h1>
        <p>Manage appearance, currency and your data.</p>
      </div>
      <div className="card">
        <ul className="list">
          <li>
            <span>Your name</span>
            <input className="text-input" value={settings.name} onChange={(e) => updateSettings({ name: e.target.value })} placeholder="Your name" />
          </li>
          <li>
            <span>Currency</span>
            <select className="text-input" value={settings.currency} onChange={(e) => updateSettings({ currency: e.target.value })}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </li>
          <li>
            <span>
              Count pending transactions in totals
              <br /><small className="muted">Off: sirf Completed transactions balance/income/expenses mein judte hain</small>
            </span>
            <input type="checkbox" checked={settings.countPending} onChange={(e) => updateSettings({ countPending: e.target.checked })} />
          </li>
          <li>
            <span>Theme: <b>{theme}</b></span>
            <button className="btn" onClick={onToggleTheme}>Switch to {theme === 'dark' ? 'light' : 'dark'}</button>
          </li>
          <li>
            <span>Reset to demo data</span>
            <button className="btn" onClick={() => { if (window.confirm('Reset to demo data?')) { resetDemo(); toast.success('Demo data restored') } }}>Reset</button>
          </li>
          <li>
            <span>Delete all transactions</span>
            <button className="btn btn-danger" onClick={() => { if (window.confirm('Delete everything?')) { clearAll(); toast.success('All transactions deleted') } }}>Clear all</button>
          </li>
        </ul>
      </div>
    </main>
  )
}