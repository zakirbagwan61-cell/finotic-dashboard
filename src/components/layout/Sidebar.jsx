import { LayoutDashboard, Wallet, ArrowLeftRight, PieChart, Settings } from 'lucide-react'

const links = [
  { icon: LayoutDashboard, label: 'Dashboard' },
  { icon: Wallet, label: 'Accounts' },
  { icon: ArrowLeftRight, label: 'Transactions' },
  { icon: PieChart, label: 'Reports' },
  { icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="logo">Finotic</h2>
      <nav>
        {links.map(({ icon: Icon, label }, i) => (
          <a key={label} href="#" className={i === 0 ? 'active' : ''}>
            <Icon size={18} /> {label}
          </a>
        ))}
      </nav>
    </aside>
  )
}