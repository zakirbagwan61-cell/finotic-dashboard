import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Clock, AlertTriangle, Target } from 'lucide-react'
import { useTransactions } from '../../context/TransactionsContext'
import { money, monthKey } from '../../utils/format'

const KEY = 'finotic-read-notifs'
const loadRead = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
}

export default function NotificationsMenu() {
  const { transactions, budgetUsage, goals } = useTransactions()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [read, setRead] = useState(loadRead)
  const ref = useRef(null)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(read)) } catch { /* ignore */ }
  }, [read])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const items = useMemo(() => {
    const list = []
    const mk = monthKey()
    transactions
      .filter((t) => t.status === 'pending')
      .forEach((t) =>
        list.push({ id: `pending-${t.id}`, icon: Clock, title: `Pending: ${t.name}`, text: `${money(t.amount)} is not completed yet`, to: '/transactions' })
      )
    budgetUsage.forEach((b) => {
      if (b.pct >= 100)
        list.push({ id: `budget-over-${b.category}-${mk}`, icon: AlertTriangle, title: `${b.category} budget exceeded`, text: `${money(b.spent)} / ${money(b.limit)}`, to: '/budgets' })
      else if (b.pct >= 80)
        list.push({ id: `budget-near-${b.category}-${mk}`, icon: AlertTriangle, title: `${b.category} budget ${b.pct}% used`, text: `${money(b.spent)} / ${money(b.limit)}`, to: '/budgets' })
    })
    goals
      .filter((g) => g.saved >= g.target)
      .forEach((g) =>
        list.push({ id: `goal-${g.id}`, icon: Target, title: `Goal complete: ${g.name}`, text: `${money(g.saved)} saved`, to: '/goals' })
      )
    return list
  }, [transactions, budgetUsage, goals])

  const unread = items.filter((i) => !read.includes(i.id))

  const openItem = (item) => {
    setRead((r) => (r.includes(item.id) ? r : [...r, item.id]))
    setOpen(false)
    navigate(item.to)
  }

  return (
    <div className="notif-wrap" ref={ref}>
      <button className="icon-btn" aria-label={`Notifications, ${unread.length} unread`} onClick={() => setOpen((o) => !o)}>
        <Bell size={18} />
        {unread.length > 0 && <span className="notif-badge">{unread.length > 9 ? '9+' : unread.length}</span>}
      </button>

      {open && (
        <div className="notif-panel card">
          <div className="card-head">
            <h3 className="card-title">Notifications</h3>
            {unread.length > 0 && (
              <button className="link notif-clear" onClick={() => setRead(items.map((i) => i.id))}>Mark all read</button>
            )}
          </div>
          <div className="notif-list">
            {items.map((i) => {
              const Icon = i.icon
              const isRead = read.includes(i.id)
              return (
                <button key={i.id} className={`notif-item ${isRead ? 'read' : ''}`} onClick={() => openItem(i)}>
                  <Icon size={16} />
                  <span><b>{i.title}</b><small className="muted">{i.text}</small></span>
                </button>
              )
            })}
            {!items.length && <p className="empty">You're all caught up!</p>}
          </div>
        </div>
      )}
    </div>
  )
}