import { useEffect } from 'react'
import { X, Pencil, Trash2 } from 'lucide-react'
import CategoryBadge from './CategoryBadge'
import { useTransactions } from '../context/TransactionsContext'
import { signed, fmtDate } from '../utils/format'

export default function TransactionDrawer({ tx, onClose, onEdit, onDelete, onTag }) {
  const { accounts } = useTransactions()
  const account = accounts.find((a) => a.id === tx.accountId)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Transaction details">
        <div className="card-head">
          <h3 className="card-title">Transaction details</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <div>
          <p className="muted">{tx.name}</p>
          <div className={`drawer-amount ${tx.type === 'income' ? 'green' : 'red'}`}>{signed(tx)}</div>
        </div>

        <ul className="detail-list">
          <li><span className="muted">Category</span><CategoryBadge category={tx.category} /></li>
          <li><span className="muted">Account</span><b>{account?.name || '-'}</b></li>
          <li><span className="muted">Date</span><b>{fmtDate(tx.date)}</b></li>
          <li>
            <span className="muted">Status</span>
            <span className={`badge ${tx.status === 'completed' ? 'done' : 'pending'}`}>
              {tx.status === 'completed' ? 'Completed' : 'Pending'}
            </span>
          </li>
        </ul>

        <div>
          <p className="muted drawer-label">Tags</p>
          {tx.tags?.length ? (
            <div className="tag-row">
              {tx.tags.map((g) => (
                <button key={g} className="tag" onClick={() => onTag(g)} title="Filter by this tag">#{g}</button>
              ))}
            </div>
          ) : (
            <p className="muted">No tags</p>
          )}
        </div>

        <div>
          <p className="muted drawer-label">Notes</p>
          <p>{tx.note || <span className="muted">No notes</span>}</p>
        </div>

        <div className="form-actions drawer-actions">
          <button className="btn btn-primary" onClick={onEdit}><Pencil size={14} /> Edit</button>
          <button className="btn btn-danger" onClick={onDelete}><Trash2 size={14} /> Delete</button>
        </div>
      </aside>
    </div>
  )
}