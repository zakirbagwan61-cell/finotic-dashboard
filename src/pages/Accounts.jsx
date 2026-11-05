import { useState } from 'react'
import { Landmark, PiggyBank, CreditCard, Banknote, Pencil, Trash2, Plus, ArrowLeftRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/Modal'
import { ACCOUNT_TYPES } from '../data/finance'
import { useTransactions } from '../context/TransactionsContext'
import { money, fmtDate, toISODate } from '../utils/format'

const ICONS = { checking: Landmark, savings: PiggyBank, card: CreditCard, cash: Banknote }

function AccountForm({ editing, onDone }) {
  const { addAccount, updateAccount } = useTransactions()
  const [f, setF] = useState({
    name: editing?.name || '',
    type: editing?.type || 'checking',
    opening: String(editing?.opening ?? 0),
  })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    const opening = parseFloat(f.opening)
    if (!f.name.trim()) return toast.error('Account ka naam likho')
    if (Number.isNaN(opening)) return toast.error('Opening balance number hona chahiye')
    const data = { name: f.name.trim(), type: f.type, opening }
    if (editing) { updateAccount(editing.id, data); toast.success('Account updated') }
    else { addAccount(data); toast.success('Account added') }
    onDone()
  }

  return (
    <form className="modal-form" onSubmit={submit}>
      <label className="full">Name
        <input value={f.name} onChange={set('name')} placeholder="e.g. HDFC Savings" autoFocus />
      </label>
      <label>Type
        <select value={f.type} onChange={set('type')}>
          {ACCOUNT_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label>Opening balance
        <input type="number" step="0.01" value={f.opening} onChange={set('opening')} />
      </label>
      <div className="form-actions full">
        <button className="btn btn-primary" type="submit">Save</button>
        <button className="btn" type="button" onClick={onDone}>Cancel</button>
      </div>
    </form>
  )
}

function TransferForm({ onDone }) {
  const { accounts, addTransfer } = useTransactions()
  const [f, setF] = useState({
    from: accounts[0]?.id, to: accounts[1]?.id || accounts[0]?.id, amount: '', date: toISODate(),
  })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    const amount = parseFloat(f.amount)
    if (f.from === f.to) return toast.error('From aur To alag account hone chahiye')
    if (!(amount > 0)) return toast.error('Amount 0 se zyada hona chahiye')
    addTransfer({ from: f.from, to: f.to, amount, date: f.date })
    toast.success('Transfer ho gaya')
    onDone()
  }

  return (
    <form className="modal-form" onSubmit={submit}>
      <label>From
        <select value={f.from} onChange={set('from')}>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </label>
      <label>To
        <select value={f.to} onChange={set('to')}>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </label>
      <label>Amount
        <input type="number" step="0.01" value={f.amount} onChange={set('amount')} autoFocus />
      </label>
      <label>Date
        <input type="date" value={f.date} onChange={set('date')} />
      </label>
      <div className="form-actions full">
        <button className="btn btn-primary" type="submit">Transfer</button>
        <button className="btn" type="button" onClick={onDone}>Cancel</button>
      </div>
    </form>
  )
}

export default function Accounts() {
  const { accounts, balances, transfers, removeAccount } = useTransactions()
  const [modal, setModal] = useState(null) // { kind: 'account' | 'transfer', editing? }
  const nameOf = (id) => accounts.find((a) => a.id === id)?.name || 'Deleted account'

  const handleDelete = (a) => {
    if (!window.confirm(`Delete "${a.name}"?`)) return
    if (!removeAccount(a.id)) {
      toast.error('Ye account delete nahi ho sakta (transactions/transfers jude hain ya ye akela account hai)')
    } else toast.success('Account deleted')
  }

  return (
    <main className="content">
      <div className="page-head page-head-row">
        <div>
          <h1>Accounts</h1>
          <p>Your accounts and their current balances.</p>
        </div>
        <div className="row-actions">
          <button className="btn" onClick={() => setModal({ kind: 'transfer' })} disabled={accounts.length < 2}>
            <ArrowLeftRight size={14} /> Transfer
          </button>
          <button className="btn btn-primary" onClick={() => setModal({ kind: 'account', editing: null })}>
            <Plus size={16} /> Add Account
          </button>
        </div>
      </div>

      <section className="stats">
        {accounts.map((a) => {
          const Icon = ICONS[a.type] || Landmark
          return (
            <div className="card stat" key={a.id}>
              <div className="stat-top">
                <span className="muted">{a.name}</span>
                <div className="stat-icon"><Icon size={18} /></div>
              </div>
              <div className="stat-value">{money(balances[a.id] ?? 0)}</div>
              <div className="card-head">
                <span className="muted">Opening {money(a.opening)}</span>
                <div className="row-actions">
                  <button className="icon-btn" aria-label="Edit" onClick={() => setModal({ kind: 'account', editing: a })}><Pencil size={14} /></button>
                  <button className="icon-btn danger" aria-label="Delete" onClick={() => handleDelete(a)}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          )
        })}
      </section>

      <div className="card">
        <h3 className="card-title">Recent transfers</h3>
        <ul className="list">
          {transfers.slice(0, 8).map((t) => (
            <li key={t.id}>
              <span>{nameOf(t.from)} → {nameOf(t.to)} <span className="muted">· {fmtDate(t.date)}</span></span>
              <b>{money(t.amount)}</b>
            </li>
          ))}
          {!transfers.length && <li className="empty">Abhi koi transfer nahi hua.</li>}
        </ul>
      </div>

      {modal?.kind === 'account' && (
        <Modal title={modal.editing ? 'Edit Account' : 'Add Account'} onClose={() => setModal(null)}>
          <AccountForm key={modal.editing?.id || 'new'} editing={modal.editing} onDone={() => setModal(null)} />
        </Modal>
      )}
      {modal?.kind === 'transfer' && (
        <Modal title="Transfer money" onClose={() => setModal(null)}>
          <TransferForm onDone={() => setModal(null)} />
        </Modal>
      )}
    </main>
  )
}