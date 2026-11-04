import { Search, Bell } from 'lucide-react'

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="search">
        <Search size={16} />
        <input placeholder="Search..." />
      </div>
      <div className="topbar-right">
        <Bell size={18} />
        <div className="avatar">R</div>
      </div>
    </header>
  )
}