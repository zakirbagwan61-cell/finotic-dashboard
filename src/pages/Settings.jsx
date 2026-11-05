import { useRef } from 'react'
import { Download, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTransactions } from '../context/TransactionsContext'
import { CURRENCIES, toISODate } from '../utils/format'

export default function Settings({ theme, onToggleTheme }) {
  const { settings, updateSettings, resetDemo, clearAll, exportData, importData } = useTransactions()
  const fileRef = useRef(null)

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `finotic-backup-${toISODate()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    toast.success('Backup downloaded')
  }

  const importBackup = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    let data
    try {
      data = JSON.parse(await file.text())
    } catch {
      return toast.error('Could not read the file')
    }
    if (!window.confirm('This will replace all your current data. Continue?')) return
    if (importData(data)) toast.success('Backup restored')
    else toast.error('Invalid backup file')
  }

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
              <br /><small className="muted">Off: only Completed transactions count toward balance, income and expenses</small>
            </span>
            <input type="checkbox" checked={settings.countPending} onChange={(e) => updateSettings({ countPending: e.target.checked })} />
          </li>
          <li>
            <span>Theme: <b>{theme}</b></span>
            <button className="btn" onClick={onToggleTheme}>Switch to {theme === 'dark' ? 'light' : 'dark'}</button>
          </li>
        </ul>
      </div>

      <div className="card">
        <h3 className="card-title">Backup</h3>
        <ul className="list">
          <li>
            <span>Download all your data as a JSON file</span>
            <button className="btn" onClick={exportBackup}><Download size={14} /> Export backup</button>
          </li>
          <li>
            <span>Restore data from a backup file</span>
            <span>
              <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={importBackup} />
              <button className="btn" onClick={() => fileRef.current?.click()}><Upload size={14} /> Import backup</button>
            </span>
          </li>
        </ul>
      </div>

      <div className="card">
        <h3 className="card-title">Danger zone</h3>
        <ul className="list">
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