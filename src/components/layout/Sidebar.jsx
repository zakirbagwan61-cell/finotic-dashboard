import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Wallet, ArrowLeftRight, PieChart, Settings } from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/accounts', icon: Wallet, label: 'Accounts' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/reports', icon: PieChart, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ open, onClose }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <h2 className="logo">Finotic</h2>
      <nav>
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} title={label} onClick={onClose}>
            <Icon size={18} /> <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}