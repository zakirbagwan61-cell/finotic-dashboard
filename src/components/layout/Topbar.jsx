import { Search, Bell, Moon, Sun } from 'lucide-react'

export default function Topbar({ theme, onToggleTheme }) {
  const isDark = theme === 'dark'
  return (
    <header className="topbar">
      <div className="search">
        <Search size={16} />
        <input placeholder="Search transactions..." aria-label="Search" />
      </div>
      <div className="topbar-right">
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <div className="avatar">R</div>
      </div>
    </header>
  )
}
