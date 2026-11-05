import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Moon, Sun, Menu } from 'lucide-react'
import { useTransactions } from '../../context/TransactionsContext'
import NotificationsMenu from './NotificationsMenu'
import ProfileMenu from './ProfileMenu'

export default function Topbar({ theme, onToggleTheme, onMenu }) {
  const isDark = theme === 'dark'
  const { search, setSearch } = useTransactions()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const onChange = (e) => {
    setSearch(e.target.value)
    if (e.target.value && pathname !== '/transactions') navigate('/transactions')
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Open menu">
          <Menu size={18} />
        </button>
        <div className="search">
          <Search size={16} />
          <input value={search} onChange={onChange} placeholder="Search transactions..." aria-label="Search" />
        </div>
      </div>
      <div className="topbar-right">
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <NotificationsMenu />
        <ProfileMenu theme={theme} onToggleTheme={onToggleTheme} />
      </div>
    </header>
  )
}