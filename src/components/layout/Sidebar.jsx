import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Wallet, ArrowLeftRight, PieChart, Settings, Target,
  PiggyBank, Repeat, ChevronsLeft, ChevronsRight,
} from 'lucide-react'
import { useTransactions } from '../../context/TransactionsContext'

const GROUPS = [
  { title: 'Overview', links: [{ to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true }] },
  {
    title: 'Money',
    links: [
      { to: '/accounts', icon: Wallet, label: 'Accounts' },
      { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
    ],
  },
  {
    title: 'Planning',
    links: [
      { to: '/budgets', icon: Target, label: 'Budgets' },
      { to: '/goals', icon: PiggyBank, label: 'Goals' },
      { to: '/recurring', icon: Repeat, label: 'Recurring' },
    ],
  },
  {
    title: 'More',
    links: [
      { to: '/reports', icon: PieChart, label: 'Reports' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }) {
  const { settings } = useTransactions()
  const initial = (settings.name || 'R').trim().charAt(0).toUpperCase() || 'R'

  return (
    <aside className={`sidebar ${open ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-top">
        <h2 className="logo">Finotic</h2>
        <button
          className="icon-btn collapse-btn"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      <nav>
        {GROUPS.map((g) => (
          <div className="nav-section" key={g.title}>
            <p className="nav-group">{g.title}</p>
            {g.links.map(({ to, icon: Icon, label, end }) => (
              <NavLink key={to} to={to} end={end} title={label} onClick={onClose}>
                <Icon size={18} /> <span className="nav-label">{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="avatar">{initial}</div>
        <div className="user-meta">
          <b>{settings.name || 'Your name'}</b>
          <small className="muted">{settings.email || 'No email added'}</small>
        </div>
      </div>
    </aside>
  )
}